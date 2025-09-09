import { db } from '../../db/connection';
import type { 
  Position, 
  Transaction, 
  PerformanceMetrics,
  MarketData,
  PositionAnalytics,
  RiskMetrics,
  PortfolioExportData,
  PositionStrategy
} from '@/store/portfolioStore';
import { PositionLifecycleManager } from './position-lifecycle';

// Define proper JSON types
interface EntryStrategyData {
  price: number;
  condition: string;
  allocation: number;
}

interface ExitStrategyData {
  target: number;
  stopLoss: number;
  reason: string;
}

interface PositionSizeStrategyData {
  shares: number;
  dollarAmount: number;
  portfolioPercentage: number;
}

interface TieredPricingTierData {
  tier: number;
  targetPrice: number;
  sharesToSell: number | 'remaining';
  profitPerShare: number;
  condition: string;
  autoExecute: boolean;
  executed?: boolean;
  executedAt?: string;
  executedPrice?: number;
  actualSharesSold?: number;
}

interface TieredPricingStrategyData {
  tiers: TieredPricingTierData[];
  totalShares: number;
  entryPrice: number;
  strategyName: string;
  currentTier: number;
  executionHistory: Array<{
    tier: number;
    executedAt: string;
    executedPrice: number;
    sharesSold: number;
    profit: number;
  }>;
}

export interface DatabasePosition extends Omit<Position, 'priceHistory'> {
  id: string;
  portfolio_id: string;
  // Strategy database fields with proper types
  strategy_id?: string;
  strategy_type?: string;
  target_price?: number;
  stop_loss_price?: number;
  entry_strategy?: EntryStrategyData;
  exit_strategy?: ExitStrategyData;
  risk_reward_ratio?: number;
  position_size_strategy?: PositionSizeStrategyData;
  strategy_conditions?: string[];
  auto_execute_targets?: boolean;
  auto_execute_stop_loss?: boolean;
  strategy_status?: string;
  // Add tiered pricing fields
  tiered_pricing_strategy?: TieredPricingStrategyData;
  current_tier?: number;
  tier_execution_history?: Array<{
    tier: number;
    executedAt: string;
    executedPrice: number;
    sharesSold: number;
    profit: number;
  }>;
  price_history?: Array<{
    timestamp: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
}

export interface DatabasePortfolio {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  starting_balance: number;
  total_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  auto_update_interval: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class PortfolioService {
  // Core Portfolio Operations
  static async getDefaultPortfolio(): Promise<DatabasePortfolio> {
    const result = await db.query(`
      SELECT * FROM portfolios 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `, ['default_user']);

    if (result.rows.length === 0) {
      const newPortfolio = await db.query(`
        INSERT INTO portfolios (name, balance, starting_balance)
        VALUES ($1, $2, $3)
        RETURNING *
      `, ['Default Portfolio', 100000, 100000]);
      
      return newPortfolio.rows[0];
    }

    return result.rows[0];
  }

  static async getPortfolioById(portfolioId: string): Promise<DatabasePortfolio | null> {
    const result = await db.query('SELECT * FROM portfolios WHERE id = $1', [portfolioId]);
    return result.rows[0] || null;
  }

  // Position Operations
  static async getPositions(portfolioId: string): Promise<Position[]> {
    const result = await db.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'timestamp', ph.timestamp,
              'price', ph.price,
              'change', ph.change,
              'changePercent', ph.change_percent
            ) ORDER BY ph.timestamp DESC
          ) FROM price_history ph WHERE ph.position_id = p.id LIMIT 50),
          '[]'::json
        ) as price_history
      FROM positions p 
      WHERE p.portfolio_id = $1 
      ORDER BY p.total_value DESC
    `, [portfolioId]);

    return result.rows.map(row => ({
      symbol: row.symbol,
      shares: parseFloat(row.shares),
      averagePrice: parseFloat(row.average_price),
      currentPrice: parseFloat(row.current_price),
      totalValue: parseFloat(row.total_value),
      gainLoss: parseFloat(row.gain_loss),
      gainLossPercent: parseFloat(row.gain_loss_percent),
      dayChange: parseFloat(row.day_change),
      dayChangePercent: parseFloat(row.day_change_percent),
      marketValue: parseFloat(row.market_value),
      costBasis: parseFloat(row.cost_basis),
      openDate: row.open_date,
      lastUpdate: row.last_update,
      maxGain: parseFloat(row.max_gain),
      maxLoss: parseFloat(row.max_loss),
      daysHeld: parseInt(row.days_held),
      volatility: parseFloat(row.volatility),
      beta: row.beta ? parseFloat(row.beta) : undefined,
      sharpeRatio: row.sharpe_ratio ? parseFloat(row.sharpe_ratio) : undefined,
      maxDrawdown: parseFloat(row.max_drawdown),
      // ADD STRATEGY MAPPING - This is the key missing piece!
      strategy: row.strategy_id ? {
        strategyId: row.strategy_id,
        strategyType: row.strategy_type as PositionStrategy['strategyType'],
        targetPrice: row.target_price ? parseFloat(row.target_price) : undefined,
        stopLossPrice: row.stop_loss_price ? parseFloat(row.stop_loss_price) : undefined,
        entryStrategy: row.entry_strategy,
        exitStrategy: row.exit_strategy,
        riskRewardRatio: row.risk_reward_ratio ? parseFloat(row.risk_reward_ratio) : undefined,
        positionSizeStrategy: row.position_size_strategy,
        strategyConditions: row.strategy_conditions,
        autoExecuteTargets: row.auto_execute_targets || false,
        autoExecuteStopLoss: row.auto_execute_stop_loss || false,
        strategyStatus: row.strategy_status as PositionStrategy['strategyStatus'] || 'active'
      } : undefined,
      priceHistory: row.price_history || []
    }));
  }

  static async getPositionBySymbol(portfolioId: string, symbol: string): Promise<Position | null> {
    const result = await db.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'timestamp', ph.timestamp,
              'price', ph.price,
              'change', ph.change,
              'changePercent', ph.change_percent
            ) ORDER BY ph.timestamp DESC
          ) FROM price_history ph WHERE ph.position_id = p.id LIMIT 50),
          '[]'::json
        ) as price_history
      FROM positions p 
      WHERE p.portfolio_id = $1 AND p.symbol = $2
    `, [portfolioId, symbol]);

    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      symbol: row.symbol,
      shares: parseFloat(row.shares),
      averagePrice: parseFloat(row.average_price),
      currentPrice: parseFloat(row.current_price),
      totalValue: parseFloat(row.total_value),
      gainLoss: parseFloat(row.gain_loss),
      gainLossPercent: parseFloat(row.gain_loss_percent),
      dayChange: parseFloat(row.day_change),
      dayChangePercent: parseFloat(row.day_change_percent),
      marketValue: parseFloat(row.market_value),
      costBasis: parseFloat(row.cost_basis),
      openDate: row.open_date,
      lastUpdate: row.last_update,
      maxGain: parseFloat(row.max_gain),
      maxLoss: parseFloat(row.max_loss),
      daysHeld: parseInt(row.days_held),
      volatility: parseFloat(row.volatility),
      beta: row.beta ? parseFloat(row.beta) : undefined,
      sharpeRatio: row.sharpe_ratio ? parseFloat(row.sharpe_ratio) : undefined,
      maxDrawdown: parseFloat(row.max_drawdown),
      priceHistory: row.price_history || []
    };
  }

  // Enhanced trading operations with lifecycle management
  static async buyStock(
    portfolioId: string, 
    symbol: string, 
    shares: number, 
    price: number, 
    orderType: 'MARKET' | 'LIMIT' | 'STOP' = 'MARKET',
    strategy?: PositionStrategy
  ) {
    return await db.transaction(async (query) => {
      // Check sufficient balance
      const portfolio = await query('SELECT balance FROM portfolios WHERE id = $1', [portfolioId]);
      const total = shares * price;
      
      if (portfolio.rows[0].balance < total) {
        throw new Error('Insufficient funds');
      }

      // Check if position exists
      const existingPosition = await query(`
        SELECT * FROM positions 
        WHERE portfolio_id = $1 AND symbol = $2
      `, [portfolioId, symbol]);

      const now = new Date().toISOString();
      const transactionId = `txn_${Date.now()}`;

      let positionId: string;

      if (existingPosition.rows.length > 0) {
        const pos = existingPosition.rows[0];
        positionId = pos.id;
        const newShares = parseFloat(pos.shares) + shares;
        const total = shares * price;

        // Handle zero shares case to avoid division by zero
        if (Math.abs(newShares) < 0.0001) {
          // Position nets out to zero - delete it instead of updating
          await query('DELETE FROM positions WHERE id = $1', [pos.id]);
          
          console.log(`✅ Position ${pos.symbol} closed (netted to zero shares)`);
          
          // Still record the transaction
         // Around line 251, replace the transaction INSERT with:

// Still record the transaction with a unique ID for position closing
const closingTransactionId = `txn_${Date.now()}_close`;
await query(`
  INSERT INTO transactions (portfolio_id, transaction_id, symbol, type, shares, price, total, order_type, execution_price, timestamp)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`, [portfolioId, closingTransactionId, symbol, shares > 0 ? 'BUY' : 'SELL', Math.abs(shares), price, Math.abs(total), orderType, price, now]);
        } else {
          // Normal position update (existing logic)
          const newAvgPrice = (parseFloat(pos.shares) * parseFloat(pos.average_price) + total) / newShares;
          const newTotalValue = newShares * price;
          const newGainLoss = (price - newAvgPrice) * newShares;
          const newGainLossPercent = ((price - newAvgPrice) / newAvgPrice) * 100;

          const updateFields: string[] = [
            'shares = $1',
            'average_price = $2',
            'current_price = $3',
            'total_value = $4',
            'market_value = $5',
            'cost_basis = $6',
            'gain_loss = $7',
            'gain_loss_percent = $8',
            'updated_at = NOW()'
          ];

          const updateValues: (string | number | boolean)[] = [
            newShares, newAvgPrice, price, newTotalValue,
            newTotalValue, newShares * newAvgPrice,
            newGainLoss, newGainLossPercent
          ];

          // Add strategy fields if provided
          if (strategy) {
            if (strategy.strategyId) {
              updateFields.push(`strategy_id = $${updateValues.length + 1}`);
              updateValues.push(strategy.strategyId);
            }
            if (strategy.strategyType) {
              updateFields.push(`strategy_type = $${updateValues.length + 1}`);
              updateValues.push(strategy.strategyType);
            }
            if (strategy.targetPrice !== undefined) {
              updateFields.push(`target_price = $${updateValues.length + 1}`);
              updateValues.push(strategy.targetPrice);
            }
            if (strategy.stopLossPrice !== undefined) {
              updateFields.push(`stop_loss_price = $${updateValues.length + 1}`);
              updateValues.push(strategy.stopLossPrice);
            }
            if (strategy.entryStrategy) {
              updateFields.push(`entry_strategy = $${updateValues.length + 1}`);
              updateValues.push(JSON.stringify(strategy.entryStrategy));
            }
            if (strategy.exitStrategy) {
              updateFields.push(`exit_strategy = $${updateValues.length + 1}`);
              updateValues.push(JSON.stringify(strategy.exitStrategy));
            }
            if (strategy.riskRewardRatio !== undefined) {
              updateFields.push(`risk_reward_ratio = $${updateValues.length + 1}`);
              updateValues.push(strategy.riskRewardRatio);
            }
            if (strategy.positionSizeStrategy) {
              updateFields.push(`position_size_strategy = $${updateValues.length + 1}`);
              updateValues.push(JSON.stringify(strategy.positionSizeStrategy));
            }
            if (strategy.strategyConditions) {
              updateFields.push(`strategy_conditions = $${updateValues.length + 1}`);
              updateValues.push(JSON.stringify(strategy.strategyConditions));
            }
            if (strategy.autoExecuteTargets !== undefined) {
              updateFields.push(`auto_execute_targets = $${updateValues.length + 1}`);
              updateValues.push(strategy.autoExecuteTargets);
            }
            if (strategy.autoExecuteStopLoss !== undefined) {
              updateFields.push(`auto_execute_stop_loss = $${updateValues.length + 1}`);
              updateValues.push(strategy.autoExecuteStopLoss);
            }
            if (strategy.strategyStatus) {
              updateFields.push(`strategy_status = $${updateValues.length + 1}`);
              updateValues.push(strategy.strategyStatus);
            }
          }

          updateValues.push(portfolioId, symbol);
          const whereClause = `WHERE portfolio_id = $${updateValues.length - 1} AND symbol = $${updateValues.length}`;

          await query(`UPDATE positions SET ${updateFields.join(', ')} ${whereClause}`, updateValues);
        }
      } else {
        // Create new position with strategy
        const insertFields: string[] = [
          'portfolio_id', 'symbol', 'shares', 'average_price', 'current_price',
          'total_value', 'market_value', 'cost_basis', 'open_date',
          'gain_loss', 'gain_loss_percent'
        ];
        
        const insertValues: (string | number | boolean)[] = [
          portfolioId, symbol, shares, price, price, total, total, total, now, 0, 0
        ];

        // Add strategy fields if provided
        if (strategy) {
          if (strategy.strategyId) {
            insertFields.push('strategy_id');
            insertValues.push(strategy.strategyId);
          }
          if (strategy.strategyType) {
            insertFields.push('strategy_type');
            insertValues.push(strategy.strategyType);
          }
          if (strategy.targetPrice !== undefined) {
            insertFields.push('target_price');
            insertValues.push(strategy.targetPrice);
          }
          if (strategy.stopLossPrice !== undefined) {
            insertFields.push('stop_loss_price');
            insertValues.push(strategy.stopLossPrice);
          }
          if (strategy.entryStrategy) {
            insertFields.push('entry_strategy');
            insertValues.push(JSON.stringify(strategy.entryStrategy));
          }
          if (strategy.exitStrategy) {
            insertFields.push('exit_strategy');
            insertValues.push(JSON.stringify(strategy.exitStrategy));
          }
          if (strategy.riskRewardRatio !== undefined) {
            insertFields.push('risk_reward_ratio');
            insertValues.push(strategy.riskRewardRatio);
          }
          if (strategy.positionSizeStrategy) {
            insertFields.push('position_size_strategy');
            insertValues.push(JSON.stringify(strategy.positionSizeStrategy));
          }
          if (strategy.strategyConditions) {
            insertFields.push('strategy_conditions');
            insertValues.push(JSON.stringify(strategy.strategyConditions));
          }
          if (strategy.autoExecuteTargets !== undefined) {
            insertFields.push('auto_execute_targets');
            insertValues.push(strategy.autoExecuteTargets);
          }
          if (strategy.autoExecuteStopLoss !== undefined) {
            insertFields.push('auto_execute_stop_loss');
            insertValues.push(strategy.autoExecuteStopLoss);
          }
          if (strategy.strategyStatus) {
            insertFields.push('strategy_status');
            insertValues.push(strategy.strategyStatus);
          }
        }

        const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(', ');
        
        const result = await query(`
          INSERT INTO positions (${insertFields.join(', ')})
          VALUES (${placeholders})
          RETURNING id
        `, insertValues);
        
        positionId = result.rows[0].id;
        
        // Initialize position lifecycle
        await PositionLifecycleManager.initializePosition(positionId, symbol, shares, price);
      }

      // Record transaction
      await query(`
        INSERT INTO transactions (
          portfolio_id, transaction_id, symbol, type, shares, price, total,
          order_type, execution_price, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        portfolioId, transactionId, symbol, 'BUY', shares, price, total,
        orderType, price, now
      ]);

      // Update portfolio balance
      await query(`
        UPDATE portfolios SET 
          balance = balance - $1,
          updated_at = NOW()
        WHERE id = $2
      `, [total, portfolioId]);

      // Don't call update_portfolio_totals here - it will recalculate incorrectly
      // Instead, manually update the portfolio totals
      await query(`
        UPDATE portfolios SET
          total_value = balance + COALESCE((
            SELECT SUM(total_value) 
            FROM positions 
            WHERE portfolio_id = $1
          ), 0)
        WHERE id = $1
      `, [portfolioId]);

      await query(`
        UPDATE portfolios SET
          total_gain_loss = total_value - starting_balance,
          total_gain_loss_percent = CASE 
            WHEN starting_balance > 0 
            THEN ((total_value - starting_balance) / starting_balance) * 100 
            ELSE 0 
          END
        WHERE id = $1
      `, [portfolioId]);

      return { 
        success: true, 
        transactionId,
        total, 
        newBalance: portfolio.rows[0].balance - total,
        positionId
      };
    });
  }

  static async sellStock(
    portfolioId: string, 
    symbol: string, 
    shares: number, 
    price: number, 
    orderType: 'MARKET' | 'LIMIT' | 'STOP' = 'MARKET'
  ) {
    return await db.transaction(async (query) => {
      // Check if position exists and has sufficient shares
      const position = await query(`
        SELECT * FROM positions 
        WHERE portfolio_id = $1 AND symbol = $2
      `, [portfolioId, symbol]);

      if (position.rows.length === 0 || parseFloat(position.rows[0].shares) < shares) {
        throw new Error('Insufficient shares');
      }

      const pos = position.rows[0];
      const total = shares * price;
      const now = new Date().toISOString();
      const transactionId = `txn_${Date.now()}`;
      const newShares = parseFloat(pos.shares) - shares;

      if (newShares === 0) {
        // Position fully closed - move to closed_positions
        const totalReturn = (price - parseFloat(pos.average_price)) * parseFloat(pos.shares);
        const totalReturnPercent = ((price - parseFloat(pos.average_price)) / parseFloat(pos.average_price)) * 100;
        const daysHeld = Math.floor((Date.now() - new Date(pos.open_date).getTime()) / (1000 * 60 * 60 * 24));

        await query(`
          INSERT INTO closed_positions (
            portfolio_id, symbol, open_date, close_date, shares, 
            buy_price, sell_price, total_return, total_return_percent, 
            days_held, max_gain, max_loss
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          portfolioId, symbol, pos.open_date, now, pos.shares,
          pos.average_price, price, totalReturn, totalReturnPercent,
          daysHeld, pos.max_gain, pos.max_loss
        ]);

        // Delete position
        await query('DELETE FROM positions WHERE portfolio_id = $1 AND symbol = $2', [portfolioId, symbol]);
      } else {
        // Partial close - update position and create closed position for sold shares
        const soldReturn = (price - parseFloat(pos.average_price)) * shares;
        const soldReturnPercent = ((price - parseFloat(pos.average_price)) / parseFloat(pos.average_price)) * 100;
        const daysHeld = Math.floor((Date.now() - new Date(pos.open_date).getTime()) / (1000 * 60 * 60 * 24));

        await query(`
          INSERT INTO closed_positions (
            portfolio_id, symbol, open_date, close_date, shares, 
            buy_price, sell_price, total_return, total_return_percent, 
            days_held, max_gain, max_loss, reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          portfolioId, symbol, pos.open_date, now, shares,
          pos.average_price, price, soldReturn, soldReturnPercent,
          daysHeld, pos.max_gain, pos.max_loss, 'Partial close'
        ]);

        // Update remaining position
        const newTotalValue = newShares * price;
        const newGainLoss = (price - parseFloat(pos.average_price)) * newShares;
        const newGainLossPercent = ((price - parseFloat(pos.average_price)) / parseFloat(pos.average_price)) * 100;

        await query(`
          UPDATE positions SET
            shares = $1,
            current_price = $2,
            total_value = $3,
            market_value = $4,
            gain_loss = $5,
            gain_loss_percent = $6,
            updated_at = NOW()
          WHERE portfolio_id = $7 AND symbol = $8
        `, [
          newShares, price, newTotalValue, newTotalValue,
          newGainLoss, newGainLossPercent, portfolioId, symbol
        ]);
      }

      // Still record the transaction with a unique ID for position closing
      const closingTransactionId = `txn_${Date.now()}_close`;
      await query(`
        INSERT INTO transactions (portfolio_id, transaction_id, symbol, type, shares, price, total, order_type, execution_price, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [portfolioId, closingTransactionId, symbol, shares > 0 ? 'BUY' : 'SELL', Math.abs(shares), price, Math.abs(total), orderType, price, now]);

      // Update portfolio balance
      await query(`
        UPDATE portfolios SET 
          balance = balance + $1,
          updated_at = NOW()
        WHERE id = $2
      `, [total, portfolioId]);

      // Update portfolio totals
      await query('SELECT update_portfolio_totals($1)', [portfolioId]);

      return { 
        success: true, 
        transactionId,
        total,
        newShares
      };
    });
  }

  // Enhanced market data update with lifecycle management
  static async updateMarketData(marketData: MarketData) {
    return await db.transaction(async (query) => {
      const now = new Date().toISOString();
      const marketHours = PositionLifecycleManager.getMarketHours();
      
      console.log(`📊 Updating market data (Market Open: ${marketHours.isMarketOpen})`);

      // Update market_data table
      for (const [symbol, data] of Object.entries(marketData)) {
        await query(`
          INSERT INTO market_data (symbol, price, change, change_percent, volume, day_high, day_low, last_update)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (symbol) DO UPDATE SET
            price = EXCLUDED.price,
            change = EXCLUDED.change,
            change_percent = EXCLUDED.change_percent,
            volume = EXCLUDED.volume,
            day_high = EXCLUDED.day_high,
            day_low = EXCLUDED.day_low,
            last_update = EXCLUDED.last_update
        `, [symbol, data.price, data.change, data.changePercent, data.volume,
            data.dayHigh, data.dayLow, data.lastUpdate
        ]);
      }

      // Update positions with new prices and add to price history
      for (const [symbol, data] of Object.entries(marketData)) {
        const positions = await query('SELECT id FROM positions WHERE symbol = $1', [symbol]);
        
        for (const position of positions.rows) {
          // Only add to price history if market is open or if it's a significant change
          const shouldRecordHistory = marketHours.isMarketOpen || 
                                     marketHours.isExtendedHours || 
                                     Math.abs(data.changePercent) >= 1;
          
          if (shouldRecordHistory) {
            await query(`
              INSERT INTO price_history (position_id, timestamp, price, change, change_percent)
              VALUES ($1, $2, $3, $4, $5)
            `, [position.id, now, data.price, data.change, data.changePercent]);
          }
        }

        // Update position current values
        await query(`
          UPDATE positions SET
            current_price = $1,
            total_value = shares * $1,
            market_value = shares * $1,
            gain_loss = ($1 - average_price) * shares,
            gain_loss_percent = CASE 
              WHEN average_price > 0 
              THEN (($1 - average_price) / average_price) * 100 
              ELSE 0 
            END,
            day_change = $2 * shares,
            day_change_percent = $3,
            max_gain = GREATEST(max_gain, ($1 - average_price) * shares),
            max_loss = LEAST(max_loss, ($1 - average_price) * shares),
            last_update = NOW()
          WHERE symbol = $4
        `, [data.price, data.change, data.changePercent, symbol]);
      }

      // Update portfolio totals for all affected portfolios
      const symbolsList = Object.keys(marketData);
      if (symbolsList.length > 0) {
        const placeholders = symbolsList.map((_, i) => `$${i + 1}`).join(',');
        const portfoliosResult = await query(`
          SELECT DISTINCT portfolio_id FROM positions 
          WHERE symbol IN (${placeholders})
        `, symbolsList);

        for (const portfolio of portfoliosResult.rows) {
          await query('SELECT update_portfolio_totals($1)', [portfolio.portfolio_id]);
        }
      }

      // If market just closed, run end-of-day tasks
      if (!marketHours.isMarketOpen && !marketHours.isExtendedHours) {
        // Check if we already ran end-of-day tasks today
        const today = new Date().toISOString().split('T')[0];
        const lastSnapshot = await query(`
          SELECT COUNT(*) as count FROM portfolio_snapshots 
          WHERE DATE(timestamp) = $1
        `, [today]);
        
        if (lastSnapshot.rows[0].count === '0') {
          console.log('🌅 Running end-of-day tasks...');
          setTimeout(() => {
            PositionLifecycleManager.runDailyMarketCloseTasks();
          }, 1000); // Run asynchronously
        }
      }
    });
  }

  // Analytics Operations
  static async getPositionAnalytics(portfolioId: string, symbol: string): Promise<PositionAnalytics | null> {
    const result = await db.query(`
      SELECT * FROM position_analytics 
      WHERE portfolio_id = $1 AND symbol = $2
    `, [portfolioId, symbol]);

    if (result.rows.length === 0) return null;

    const analytics = result.rows[0];
    
    // Get transactions for this symbol
    const transactions = await this.getTradeHistory(portfolioId, symbol);
    
    // Get closed positions for this symbol
    const closedPositions = await db.query(`
      SELECT * FROM closed_positions 
      WHERE portfolio_id = $1 AND symbol = $2 
      ORDER BY close_date DESC
    `, [portfolioId, symbol]);

    return {
      position: analytics,
      transactions,
      closedPositions: closedPositions.rows,
      totalInvested: analytics.total_invested || 0,
      totalRealized: analytics.total_realized || 0,
      averageHoldingPeriod: analytics.avg_closed_return_percent || 0
    };
  }

  static async getPortfolioAllocation(portfolioId: string) {
    const result = await db.query(`
      SELECT 
        symbol,
        total_value as value,
        CASE 
          WHEN SUM(total_value) OVER() > 0 
          THEN (total_value / SUM(total_value) OVER()) * 100 
          ELSE 0 
        END as percentage
      FROM positions 
      WHERE portfolio_id = $1 
      ORDER BY total_value DESC
    `, [portfolioId]);

    return result.rows;
  }

  static async getRiskMetrics(portfolioId: string): Promise<RiskMetrics> {
    const [allocation, performanceMetrics] = await Promise.all([
      this.getPortfolioAllocation(portfolioId),
      this.getPerformanceMetrics(portfolioId)
    ]);

    const numberOfPositions = allocation.length;
    const averagePositionSize = numberOfPositions > 0 
      ? allocation.reduce((sum, pos) => sum + pos.percentage, 0) / numberOfPositions 
      : 0;
    
    return {
      portfolioConcentration: allocation[0]?.percentage || 0,
      numberOfPositions,
      averagePositionSize,
      maxDrawdown: performanceMetrics?.maxDrawdown || 0,
      volatility: performanceMetrics?.volatility || 0,
      sharpeRatio: performanceMetrics?.sharpeRatio || 0,
      exposureByValue: allocation.slice(0, 5) // Top 5 positions
    };
  }

  static async getTradeHistory(portfolioId: string, symbol?: string): Promise<Transaction[]> {
    const query = symbol 
      ? 'SELECT * FROM transactions WHERE portfolio_id = $1 AND symbol = $2 ORDER BY timestamp DESC'
      : 'SELECT * FROM transactions WHERE portfolio_id = $1 ORDER BY timestamp DESC';
    
    const params = symbol ? [portfolioId, symbol] : [portfolioId];
    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.transaction_id,
      symbol: row.symbol,
      type: row.type as 'BUY' | 'SELL',
      shares: parseFloat(row.shares),
      price: parseFloat(row.price),
      total: parseFloat(row.total),
      timestamp: row.timestamp,
      fees: row.fees ? parseFloat(row.fees) : undefined,
      notes: row.notes,
      orderType: row.order_type as 'MARKET' | 'LIMIT' | 'STOP',
      executionPrice: parseFloat(row.execution_price),
      slippage: row.slippage ? parseFloat(row.slippage) : undefined
    }));
  }

  // Performance Operations
  static async createPortfolioSnapshot(portfolioId: string) {
    const result = await db.query('SELECT create_portfolio_snapshot($1)', [portfolioId]);
    return result.rows[0].create_portfolio_snapshot;
  }

  static async getPerformanceMetrics(portfolioId: string): Promise<PerformanceMetrics | null> {
    const result = await db.query(`
      SELECT * FROM performance_metrics 
      WHERE portfolio_id = $1 
      ORDER BY calculated_at DESC 
      LIMIT 1
    `, [portfolioId]);

    if (result.rows.length === 0) return null;

    const metrics = result.rows[0];
    return {
      totalReturn: parseFloat(metrics.total_return),
      totalReturnPercent: parseFloat(metrics.total_return_percent),
      annualizedReturn: parseFloat(metrics.annualized_return),
      sharpeRatio: parseFloat(metrics.sharpe_ratio),
      maxDrawdown: parseFloat(metrics.max_drawdown),
      volatility: parseFloat(metrics.volatility),
      beta: parseFloat(metrics.beta),
      winRate: parseFloat(metrics.win_rate),
      lossRate: parseFloat(metrics.loss_rate),
      avgWinPercent: parseFloat(metrics.avg_win_percent),
      avgLossPercent: parseFloat(metrics.avg_loss_percent),
      profitFactor: parseFloat(metrics.profit_factor),
      largestPosition: parseFloat(metrics.largest_position),
      concentration: parseFloat(metrics.concentration),
      diversification: parseFloat(metrics.diversification),
      daysActive: parseInt(metrics.days_active),
      avgHoldingPeriod: parseFloat(metrics.avg_holding_period),
      totalTrades: parseInt(metrics.total_trades),
      winningTrades: parseInt(metrics.winning_trades),
      losingTrades: parseInt(metrics.losing_trades),
      breakEvenTrades: parseInt(metrics.break_even_trades)
    };
  }

  static async calculatePerformanceMetrics(portfolioId: string) {
    // This uses the database function we created
    return await db.transaction(async (query) => {
      const portfolio = await query('SELECT * FROM portfolios WHERE id = $1', [portfolioId]);
      const closedPositions = await query('SELECT * FROM closed_positions WHERE portfolio_id = $1', [portfolioId]);

      if (portfolio.rows.length === 0) return null;

      const p = portfolio.rows[0];
      const totalReturn = parseFloat(p.total_value) - parseFloat(p.starting_balance);
      const totalReturnPercent = parseFloat(p.starting_balance) > 0 
        ? (totalReturn / parseFloat(p.starting_balance)) * 100 
        : 0;

      // Calculate other metrics...
      const totalTrades = closedPositions.rows.length;
      const winningTrades = closedPositions.rows.filter(pos => parseFloat(pos.total_return) > 0).length;
      const losingTrades = closedPositions.rows.filter(pos => parseFloat(pos.total_return) < 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      // Store calculated metrics
      await query(`
        INSERT INTO performance_metrics (
          portfolio_id, total_return, total_return_percent, win_rate,
          total_trades, winning_trades, losing_trades, break_even_trades
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (portfolio_id, calculated_at) DO UPDATE SET
          total_return = EXCLUDED.total_return,
          total_return_percent = EXCLUDED.total_return_percent,
          win_rate = EXCLUDED.win_rate,
          total_trades = EXCLUDED.total_trades,
          winning_trades = EXCLUDED.winning_trades,
          losing_trades = EXCLUDED.losing_trades,
          break_even_trades = EXCLUDED.break_even_trades
      `, [
        portfolioId, totalReturn, totalReturnPercent, winRate,
        totalTrades, winningTrades, losingTrades, totalTrades - winningTrades - losingTrades
      ]);

      return true;
    });
  }

  static async getPortfolioSummary(portfolioId: string) {
    const result = await db.query(`
      SELECT * FROM portfolio_summary WHERE portfolio_id = $1
    `, [portfolioId]);

    return result.rows[0];
  }

  static async exportPortfolioData(portfolioId: string): Promise<PortfolioExportData> {
    const [portfolio, positions, transactions, closedPositions, performanceMetrics, performanceHistory] = await Promise.all([
      this.getPortfolioById(portfolioId),
      this.getPositions(portfolioId),
      this.getTradeHistory(portfolioId),
      db.query('SELECT * FROM closed_positions WHERE portfolio_id = $1', [portfolioId]),
      this.getPerformanceMetrics(portfolioId),
      db.query('SELECT * FROM portfolio_snapshots WHERE portfolio_id = $1 ORDER BY timestamp', [portfolioId])
    ]);

    if (!portfolio) throw new Error('Portfolio not found');

    return {
      portfolio: {
        balance: portfolio.balance,
        totalValue: portfolio.total_value,
        totalGainLoss: portfolio.total_gain_loss,
        startingBalance: portfolio.starting_balance
      },
      positions,
      transactions,
      closedPositions: closedPositions.rows,
      performanceMetrics: performanceMetrics || {} as PerformanceMetrics,
      performanceHistory: performanceHistory.rows
    };
  }

  static async resetPortfolio(portfolioId: string) {
    return await db.transaction(async (query) => {
      // Delete all related data
      await query('DELETE FROM price_history WHERE position_id IN (SELECT id FROM positions WHERE portfolio_id = $1)', [portfolioId]);
      await query('DELETE FROM positions WHERE portfolio_id = $1', [portfolioId]);
      await query('DELETE FROM transactions WHERE portfolio_id = $1', [portfolioId]);
      await query('DELETE FROM closed_positions WHERE portfolio_id = $1', [portfolioId]);
      await query('DELETE FROM portfolio_snapshots WHERE portfolio_id = $1', [portfolioId]);
      await query('DELETE FROM performance_metrics WHERE portfolio_id = $1', [portfolioId]);
      await query('DELETE FROM alerts WHERE portfolio_id = $1', [portfolioId]);

      // Reset portfolio to initial state
      await query(`
        UPDATE portfolios SET
          balance = starting_balance,
          total_value = starting_balance,
          total_gain_loss = 0,
          total_gain_loss_percent = 0,
          updated_at = NOW()
        WHERE id = $1
      `, [portfolioId]);

      return { success: true };
    });
  }

  // Alert Operations
  static async createAlert(portfolioId: string, symbol: string, type: 'above' | 'below', targetPrice: number, currentPrice: number) {
    const alertId = `alert_${Date.now()}`;
    await db.query(`
      INSERT INTO alerts (portfolio_id, alert_id, symbol, type, target_price, current_price)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [portfolioId, alertId, symbol, type, targetPrice, currentPrice]);

    return { alertId };
  }

  static async getAlerts(portfolioId: string) {
    const result = await db.query(`
      SELECT * FROM alerts 
      WHERE portfolio_id = $1 
      ORDER BY created_at DESC
    `, [portfolioId]);

    return result.rows;
  }

  static async removeAlert(portfolioId: string, alertId: string) {
    await db.query(`
      DELETE FROM alerts 
      WHERE portfolio_id = $1 AND alert_id = $2
    `, [portfolioId, alertId]);

    return { success: true };
  }

  // New method to get enhanced position data with timeline
  static async getPositionWithTimeline(portfolioId: string, symbol: string) {
    try {
      const position = await this.getPositionBySymbol(portfolioId, symbol);
      if (!position) return null;

      const positionId = await db.query(
        'SELECT id FROM positions WHERE portfolio_id = $1 AND symbol = $2',
        [portfolioId, symbol]
      );

      if (positionId.rows.length === 0) return position;

      const timeline = await PositionLifecycleManager.getPositionTimeline(positionId.rows[0].id);
      
      return {
        ...position,
        timeline: timeline || [], // Remove .timeline since timeline is already TimelineEvent[]
        metrics: {
          daysHeld: position.daysHeld,
          volatility: position.volatility,
          sharpeRatio: position.sharpeRatio,
          maxDrawdown: position.maxDrawdown
        }
      };
    } catch (error) {
      console.error('Failed to get position with timeline:', error);
      return null;
    }
  }

  static async updatePositionStrategy(
    portfolioId: string,
    symbol: string,
    strategy: PositionStrategy
  ) {
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean)[] = [];

    if (strategy.strategyId) {
      updateFields.push(`strategy_id = $${updateValues.length + 1}`);
      updateValues.push(strategy.strategyId);
    }
    if (strategy.strategyType) {
      updateFields.push(`strategy_type = $${updateValues.length + 1}`);
      updateValues.push(strategy.strategyType);
    }
    if (strategy.targetPrice !== undefined) {
      updateFields.push(`target_price = $${updateValues.length + 1}`);
      updateValues.push(strategy.targetPrice);
    }
    if (strategy.stopLossPrice !== undefined) {
      updateFields.push(`stop_loss_price = $${updateValues.length + 1}`);
      updateValues.push(strategy.stopLossPrice);
    }
    if (strategy.entryStrategy) {
      updateFields.push(`entry_strategy = $${updateValues.length + 1}`);
      updateValues.push(JSON.stringify(strategy.entryStrategy));
    }
    if (strategy.exitStrategy) {
      updateFields.push(`exit_strategy = $${updateValues.length + 1}`);
      updateValues.push(JSON.stringify(strategy.exitStrategy));
    }
    if (strategy.riskRewardRatio !== undefined) {
      updateFields.push(`risk_reward_ratio = $${updateValues.length + 1}`);
      updateValues.push(strategy.riskRewardRatio);
    }
    if (strategy.positionSizeStrategy) {
      updateFields.push(`position_size_strategy = $${updateValues.length + 1}`);
      updateValues.push(JSON.stringify(strategy.positionSizeStrategy));
    }
    if (strategy.strategyConditions) {
      updateFields.push(`strategy_conditions = $${updateValues.length + 1}`);
      updateValues.push(JSON.stringify(strategy.strategyConditions));
    }
    if (strategy.autoExecuteTargets !== undefined) {
      updateFields.push(`auto_execute_targets = $${updateValues.length + 1}`);
      updateValues.push(strategy.autoExecuteTargets);
    }
    if (strategy.autoExecuteStopLoss !== undefined) {
      updateFields.push(`auto_execute_stop_loss = $${updateValues.length + 1}`);
      updateValues.push(strategy.autoExecuteStopLoss);
    }
    if (strategy.strategyStatus) {
      updateFields.push(`strategy_status = $${updateValues.length + 1}`);
      updateValues.push(strategy.strategyStatus);
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(portfolioId, symbol);

    await db.query(`
      UPDATE positions 
      SET ${updateFields.join(', ')}
      WHERE portfolio_id = $${updateValues.length - 1} AND symbol = $${updateValues.length}
    `, updateValues);

    return { success: true };
  }

  // New method to check and execute tiered pricing strategy
  static async checkTieredPricingTriggers(portfolioId: string): Promise<void> {
    return await db.transaction(async (query) => {
      // Get all positions with active tiered pricing strategies
      const positions = await query(`
        SELECT 
          p.id, p.symbol, p.current_price, p.shares, p.portfolio_id,
          p.tiered_pricing_strategy, p.current_tier, p.tier_execution_history,
          p.strategy_status
        FROM positions p 
        WHERE p.strategy_status = 'active' 
        AND p.tiered_pricing_strategy IS NOT NULL
      `);

      for (const position of positions.rows) {
        const currentPrice = parseFloat(position.current_price);
        const tieredStrategy = position.tiered_pricing_strategy;
        const currentTier = position.current_tier || 1;

        if (!tieredStrategy || currentTier > tieredStrategy.tiers.length) {
          continue;
        }

        const currentTierData = tieredStrategy.tiers[currentTier - 1];
        
        // Check if current tier target is hit
        if (currentPrice >= currentTierData.targetPrice && !currentTierData.executed) {
          console.log(`🎯 Tier ${currentTier} target hit for ${position.symbol}: $${currentPrice} >= $${currentTierData.targetPrice}`);
          
          if (currentTierData.autoExecute) {
            await this.executeTieredPricingOrder(position, currentTierData, currentTier);
          } else {
            // Update status only
            await query(`
              UPDATE positions SET strategy_status = 'tier_ready' WHERE id = $1
            `, [position.id]);
          }
        }
      }
    });
  }

  // Execute tiered pricing order
  private static async executeTieredPricingOrder(
    position: {
      id: string;
      portfolio_id: string;
      symbol: string;
      shares: string;
      current_price: string;
      tiered_pricing_strategy: TieredPricingStrategyData;
      current_tier: number;
      tier_execution_history: Array<{
        tier: number;
        executedAt: string;
        executedPrice: number;
        sharesSold: number;
        profit: number;
      }>;
    },
    tierData: TieredPricingTierData,
    currentTier: number
  ): Promise<void> {
    return await db.transaction(async (query) => {
      const currentShares = parseFloat(position.shares);
      const currentPrice = parseFloat(position.current_price);
      
      // Calculate shares to sell
      let sharesToSell: number;
      if (tierData.sharesToSell === 'remaining') {
        sharesToSell = currentShares;
      } else {
        sharesToSell = Math.min(tierData.sharesToSell, currentShares);
      }

      if (sharesToSell <= 0) {
        console.log(`⚠️ No shares to sell for tier ${currentTier} of ${position.symbol}`);
        return;
      }

      console.log(`🔄 Executing tier ${currentTier} order for ${position.symbol}: ${sharesToSell} shares @ $${currentPrice}`);
      
      // Execute sell order
      await this.sellStock(
        position.portfolio_id,
        position.symbol,
        sharesToSell,
        currentPrice,
        'MARKET'
      );

      // Update tiered pricing strategy
      const updatedStrategy = { ...position.tiered_pricing_strategy };
      updatedStrategy.tiers[currentTier - 1].executed = true;
      updatedStrategy.tiers[currentTier - 1].executedAt = new Date().toISOString();
      updatedStrategy.tiers[currentTier - 1].executedPrice = currentPrice;
      updatedStrategy.tiers[currentTier - 1].actualSharesSold = sharesToSell;

      // Add to execution history
      const executionRecord = {
        tier: currentTier,
        executedAt: new Date().toISOString(),
        executedPrice: currentPrice,
        sharesSold: sharesToSell,
        profit: (currentPrice - updatedStrategy.entryPrice) * sharesToSell
      };

      const updatedHistory = [...(position.tier_execution_history || []), executionRecord];

      // Update position
      const newCurrentTier = currentTier + 1;
      const newStrategyStatus = newCurrentTier > updatedStrategy.tiers.length ? 'tiered_complete' : 'active';

      await query(`
        UPDATE positions SET
          tiered_pricing_strategy = $1,
          current_tier = $2,
          tier_execution_history = $3,
          strategy_status = $4,
          updated_at = NOW()
        WHERE id = $5
      `, [
        JSON.stringify(updatedStrategy),
        newCurrentTier,
        JSON.stringify(updatedHistory),
        newStrategyStatus,
        position.id
      ]);

      console.log(`✅ Tier ${currentTier} executed for ${position.symbol}. Next tier: ${newCurrentTier}`);
    });
  }

  // Method to create tiered pricing strategy
  static async createTieredPricingStrategy(
    portfolioId: string,
    symbol: string,
    entryPrice: number,
    totalShares: number,
    tiers: Array<{
      targetPrice: number;
      sharesToSell: number | 'remaining';
      profitPerShare: number;
      condition: string;
      autoExecute: boolean;
    }>
  ): Promise<void> {
    return await db.transaction(async (query) => {
      const tieredStrategy: TieredPricingStrategyData = {
        tiers: tiers.map((tier, index) => ({
          tier: index + 1,
          targetPrice: tier.targetPrice,
          sharesToSell: tier.sharesToSell,
          profitPerShare: tier.profitPerShare,
          condition: tier.condition,
          autoExecute: tier.autoExecute
        })),
        totalShares,
        entryPrice,
        strategyName: 'Tiered Profit Taking',
        currentTier: 1,
        executionHistory: []
      };

      await query(`
        UPDATE positions SET
          tiered_pricing_strategy = $1,
          current_tier = $2,
          tier_execution_history = $3,
          strategy_type = 'tiered_pricing',
          strategy_status = 'active',
          updated_at = NOW()
        WHERE portfolio_id = $4 AND symbol = $5
      `, [
        JSON.stringify(tieredStrategy),
        1,
        JSON.stringify([]),
        portfolioId,
        symbol
      ]);

      console.log(`✅ Created tiered pricing strategy for ${symbol} with ${tiers.length} tiers`);
    });
  }

  // Method to get tiered pricing status
  static async getTieredPricingStatus(portfolioId: string, symbol: string) {
    const result = await db.query(`
      SELECT 
        tiered_pricing_strategy,
        current_tier,
        tier_execution_history,
        strategy_status
      FROM positions 
      WHERE portfolio_id = $1 AND symbol = $2
    `, [portfolioId, symbol]);

    if (result.rows.length === 0) return null;

    const position = result.rows[0];
    return {
      strategy: position.tiered_pricing_strategy,
      currentTier: position.current_tier,
      executionHistory: position.tier_execution_history,
      status: position.strategy_status
    };
  }

} // End of PortfolioService class
