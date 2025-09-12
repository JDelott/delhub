import { NextRequest, NextResponse } from 'next/server';
import { postgresService } from '@/lib/postgres-service';

interface TradeData {
  id: string;
  symbol: string;
  amount: number;
  timestamp: string;
  notes?: string;
}

interface DailySummaryRequest {
  trades: TradeData[];
  date?: string; // Optional, defaults to today
}

export async function POST(request: NextRequest) {
  try {
    const { trades, date }: DailySummaryRequest = await request.json();

    if (!trades || !Array.isArray(trades)) {
      return NextResponse.json(
        { success: false, error: 'Trades array is required' },
        { status: 400 }
      );
    }

    // Use provided date or default to today
    const tradeDate = date || new Date().toISOString().split('T')[0];

    // Calculate summary statistics
    const totalTrades = trades.length;
    const totalAmount = trades.reduce((sum, trade) => sum + trade.amount, 0);
    const averageAmount = totalTrades > 0 ? totalAmount / totalTrades : 0;
    const positiveEntries = trades.filter(trade => trade.amount > 0).length;
    const negativeEntries = trades.filter(trade => trade.amount < 0).length;
    const totalGains = trades.filter(trade => trade.amount > 0).reduce((sum, trade) => sum + trade.amount, 0);
    const totalLosses = Math.abs(trades.filter(trade => trade.amount < 0).reduce((sum, trade) => sum + trade.amount, 0));

    // Calculate symbol performance
    const symbolTotals = trades.reduce((acc, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { total: 0, count: 0 };
      }
      acc[trade.symbol].total += trade.amount;
      acc[trade.symbol].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const symbolPerformances = Object.entries(symbolTotals).map(([symbol, data]) => ({
      trade_date: tradeDate,
      symbol,
      trade_count: data.count,
      total_amount: data.total,
      average_amount: data.total / data.count
    }));

    // Prepare trade entries for database
    const tradeEntries = trades.map(trade => ({
      trade_date: tradeDate,
      symbol: trade.symbol,
      amount: trade.amount,
      notes: trade.notes,
      entry_timestamp: trade.timestamp
    }));

    // Save to database
    const summary = await postgresService.saveDailyTradeSummary({
      trade_date: tradeDate,
      total_trades: totalTrades,
      total_amount: totalAmount,
      average_amount: averageAmount,
      positive_entries: positiveEntries,
      negative_entries: negativeEntries,
      total_gains: totalGains,
      total_losses: totalLosses
    });

    await postgresService.saveDailySymbolPerformance(symbolPerformances);
    await postgresService.saveTradeEntries(tradeEntries);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        symbolCount: symbolPerformances.length,
        entriesCount: tradeEntries.length
      }
    });

  } catch (error) {
    console.error('Error saving daily summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save daily summary' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Test database connection
    const isConnected = await postgresService.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const summaries = await postgresService.getDailySummaries(
      startDate || undefined,
      endDate || undefined,
      limit
    );

    return NextResponse.json({
      success: true,
      data: summaries
    });

  } catch (error) {
    console.error('Error fetching daily summaries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily summaries' },
      { status: 500 }
    );
  }
}
