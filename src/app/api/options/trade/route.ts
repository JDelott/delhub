import { NextResponse } from 'next/server';
import { PortfolioService } from '@/lib/db-services';
import type { PositionStrategy } from '@/store/portfolioStore';
import { randomUUID } from 'crypto';

interface OptionsTradeRequest {
  action: 'buy' | 'sell';
  symbol: string; // Underlying stock symbol
  optionSymbol: string; // Full option symbol
  optionType: 'put' | 'call';
  strike: number;
  expiration: string;
  contracts: number; // Number of option contracts
  premium: number; // Price per contract
  orderType?: 'MARKET' | 'LIMIT' | 'STOP';
  strategy?: string;
}

export async function POST(request: Request) {
  try {
    const {
      action,
      symbol,
      optionSymbol,
      optionType,
      strike,
      expiration,
      contracts,
      premium,
      orderType = 'LIMIT',
      strategy = 'OPTIONS_STRATEGY'
    }: OptionsTradeRequest = await request.json();

    console.log('📊 Received options trade request:', {
      action,
      symbol,
      optionSymbol,
      optionType,
      strike,
      expiration,
      contracts,
      premium
    });

    // Validate required fields
    if (!action || !symbol || !optionType || !strike || !expiration || !contracts || !premium) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get default portfolio
    const portfolio = await PortfolioService.getDefaultPortfolio();
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'No portfolio found' },
        { status: 404 }
      );
    }

    const totalShares = contracts; // Each contract = 100 shares, but we track as 1 unit
    const pricePerShare = premium * 100; // Convert premium to per-share price

    // Validate strategy ID format
    let normalizedStrategy: PositionStrategy;
    try {
      // Generate a proper UUID for strategy_id
      normalizedStrategy = {
        id: randomUUID(),
        name: strategy || 'OPTIONS_STRATEGY',
        description: `${action.toUpperCase()} ${optionType.toUpperCase()} option`,
        type: 'options' as const
      };
    } catch (error) {
      console.error('Strategy ID generation error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid strategy configuration' },
        { status: 400 }
      );
    }

    // Clean readable symbol format: GSK-37P-09/26
    const tradeSymbol = `${symbol}-${strike}${optionType.charAt(0).toUpperCase()}-${expiration.slice(5).replace('-', '/')}`;
    
    let result;

    if (action === 'buy') {
      // BUY TO OPEN or BUY TO CLOSE
      result = await PortfolioService.buyStock(
        portfolio.id,
        tradeSymbol,
        totalShares,
        pricePerShare,
        orderType,
        normalizedStrategy
      );
    } else if (action === 'sell') {
      // SELL TO OPEN - collect premium, create short position
      // Use negative shares to create short position, positive price for premium collected
      result = await PortfolioService.buyStock(
        portfolio.id,
        tradeSymbol,
        -totalShares, // Negative shares = short position
        pricePerShare, // Positive price (premium collected per share)
        orderType,
        normalizedStrategy
      );
    }

    if (result?.success) {
      console.log('✅ Options trade executed successfully:', result);
      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        total: result.total,
        newBalance: result.newBalance,
        positionId: result.positionId
      });
    } else {
      console.error('❌ Options trade failed:', result);
      return NextResponse.json(
        { success: false, error: 'Trade execution failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Options trade API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
