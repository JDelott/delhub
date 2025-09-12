import { Pool, PoolClient } from 'pg';

// Database connection pool
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      database: process.env.POSTGRES_DATABASE || 'delhub',
      password: process.env.POSTGRES_PASSWORD || 'password',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Types for database operations
export interface DailyTradeSummary {
  id?: number;
  trade_date: string; // YYYY-MM-DD format
  total_trades: number;
  total_amount: number;
  average_amount: number;
  positive_entries: number;
  negative_entries: number;
  total_gains: number;
  total_losses: number;
  created_at?: string;
  updated_at?: string;
}

export interface DailySymbolPerformance {
  id?: number;
  trade_date: string; // YYYY-MM-DD format
  symbol: string;
  trade_count: number;
  total_amount: number;
  average_amount: number;
  created_at?: string;
}

export interface TradeEntry {
  id?: number;
  trade_date: string; // YYYY-MM-DD format
  symbol: string;
  amount: number;
  notes?: string;
  entry_timestamp: string; // ISO timestamp
  created_at?: string;
}

export interface MonthlyPerformance {
  month: string;
  trading_days: number;
  total_trades: number;
  total_amount: number;
  avg_daily_amount: number;
  total_gains: number;
  total_losses: number;
  total_wins: number;
  total_losses_count: number;
}

export interface TopSymbol {
  symbol: string;
  days_traded: number;
  total_trades: number;
  total_amount: number;
  avg_daily_amount: number;
}

// Database service class
export class PostgresService {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('SELECT NOW()');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    } finally {
      if (client) client.release();
    }
  }

  // Save daily trade summary
  async saveDailyTradeSummary(summary: Omit<DailyTradeSummary, 'id' | 'created_at' | 'updated_at'>): Promise<DailyTradeSummary> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      
      const query = `
        INSERT INTO daily_trade_summaries 
        (trade_date, total_trades, total_amount, average_amount, positive_entries, negative_entries, total_gains, total_losses)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (trade_date) 
        DO UPDATE SET 
          total_trades = EXCLUDED.total_trades,
          total_amount = EXCLUDED.total_amount,
          average_amount = EXCLUDED.average_amount,
          positive_entries = EXCLUDED.positive_entries,
          negative_entries = EXCLUDED.negative_entries,
          total_gains = EXCLUDED.total_gains,
          total_losses = EXCLUDED.total_losses,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const values = [
        summary.trade_date,
        summary.total_trades,
        summary.total_amount,
        summary.average_amount,
        summary.positive_entries,
        summary.negative_entries,
        summary.total_gains,
        summary.total_losses
      ];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving daily trade summary:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Save daily symbol performance
  async saveDailySymbolPerformance(performances: Omit<DailySymbolPerformance, 'id' | 'created_at'>[]): Promise<void> {
    if (performances.length === 0) return;

    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');

      // Delete existing records for the date
      const tradeDate = performances[0].trade_date;
      await client.query('DELETE FROM daily_symbol_performance WHERE trade_date = $1', [tradeDate]);

      // Insert new records
      for (const perf of performances) {
        const query = `
          INSERT INTO daily_symbol_performance 
          (trade_date, symbol, trade_count, total_amount, average_amount)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        const values = [
          perf.trade_date,
          perf.symbol,
          perf.trade_count,
          perf.total_amount,
          perf.average_amount
        ];
        
        await client.query(query, values);
      }

      await client.query('COMMIT');
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error saving daily symbol performance:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Save individual trade entries
  async saveTradeEntries(entries: Omit<TradeEntry, 'id' | 'created_at'>[]): Promise<void> {
    if (entries.length === 0) return;

    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');

      for (const entry of entries) {
        const query = `
          INSERT INTO trade_entries 
          (trade_date, symbol, amount, notes, entry_timestamp)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        const values = [
          entry.trade_date,
          entry.symbol,
          entry.amount,
          entry.notes || null,
          entry.entry_timestamp
        ];
        
        await client.query(query, values);
      }

      await client.query('COMMIT');
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error saving trade entries:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get daily summaries with optional date range
  async getDailySummaries(startDate?: string, endDate?: string, limit?: number): Promise<DailyTradeSummary[]> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      
      let query = 'SELECT * FROM daily_trade_summaries';
      const conditions: string[] = [];
      const values: string[] = [];
      let paramIndex = 1;

      if (startDate) {
        conditions.push(`trade_date >= $${paramIndex++}`);
        values.push(startDate);
      }

      if (endDate) {
        conditions.push(`trade_date <= $${paramIndex++}`);
        values.push(endDate);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY trade_date DESC';

      if (limit) {
        query += ` LIMIT $${paramIndex}`;
        values.push(limit.toString());
      }

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting daily summaries:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get monthly performance
  async getMonthlyPerformance(limit?: number): Promise<MonthlyPerformance[]> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      
      let query = 'SELECT * FROM monthly_performance';
      
      if (limit) {
        query += ' LIMIT $1';
        const result = await client.query(query, [limit]);
        return result.rows;
      } else {
        const result = await client.query(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error getting monthly performance:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get top symbols
  async getTopSymbols(limit?: number): Promise<TopSymbol[]> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      
      let query = 'SELECT * FROM top_symbols_all_time';
      
      if (limit) {
        query += ' LIMIT $1';
        const result = await client.query(query, [limit]);
        return result.rows;
      } else {
        const result = await client.query(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error getting top symbols:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Get symbol performance for a specific date range
  async getSymbolPerformance(startDate?: string, endDate?: string): Promise<DailySymbolPerformance[]> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      
      let query = 'SELECT * FROM daily_symbol_performance';
      const conditions: string[] = [];
      const values: string[] = [];
      let paramIndex = 1;

      if (startDate) {
        conditions.push(`trade_date >= $${paramIndex++}`);
        values.push(startDate);
      }

      if (endDate) {
        conditions.push(`trade_date <= $${paramIndex++}`);
        values.push(endDate);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY trade_date DESC, total_amount DESC';

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting symbol performance:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  // Close the database connection pool
  async close(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
}

// Export a singleton instance
export const postgresService = new PostgresService();
