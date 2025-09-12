import { NextRequest, NextResponse } from 'next/server';
import { postgresService } from '@/lib/postgres-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Test database connection
    const isConnected = await postgresService.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    switch (type) {
      case 'monthly': {
        const monthlyData = await postgresService.getMonthlyPerformance(limit);
        return NextResponse.json({
          success: true,
          data: monthlyData
        });
      }

      case 'top-symbols': {
        const topSymbols = await postgresService.getTopSymbols(limit);
        return NextResponse.json({
          success: true,
          data: topSymbols
        });
      }

      case 'symbol-performance': {
        const symbolPerformance = await postgresService.getSymbolPerformance(
          startDate || undefined,
          endDate || undefined
        );
        return NextResponse.json({
          success: true,
          data: symbolPerformance
        });
      }

      case 'overview': {
        // Get comprehensive overview data
        const [
          recentSummaries,
          monthlyPerformance,
          topSymbols
        ] = await Promise.all([
          postgresService.getDailySummaries(undefined, undefined, 30), // Last 30 days
          postgresService.getMonthlyPerformance(12), // Last 12 months
          postgresService.getTopSymbols(10) // Top 10 symbols
        ]);

        // Calculate overall statistics
        const totalDays = recentSummaries.length;
        const totalTrades = recentSummaries.reduce((sum, day) => sum + day.total_trades, 0);
        const totalAmount = recentSummaries.reduce((sum, day) => sum + parseFloat(day.total_amount.toString()), 0);
        const totalGains = recentSummaries.reduce((sum, day) => sum + parseFloat(day.total_gains.toString()), 0);
        const totalLosses = recentSummaries.reduce((sum, day) => sum + parseFloat(day.total_losses.toString()), 0);
        const avgDailyAmount = totalDays > 0 ? totalAmount / totalDays : 0;
        const winRate = recentSummaries.length > 0 ? 
          recentSummaries.filter(day => parseFloat(day.total_amount.toString()) > 0).length / recentSummaries.length * 100 : 0;

        // Get best and worst days
        const bestDay = recentSummaries.reduce((best, day) => 
          parseFloat(day.total_amount.toString()) > parseFloat(best.total_amount.toString()) ? day : best, 
          recentSummaries[0] || { total_amount: 0 }
        );
        
        const worstDay = recentSummaries.reduce((worst, day) => 
          parseFloat(day.total_amount.toString()) < parseFloat(worst.total_amount.toString()) ? day : worst, 
          recentSummaries[0] || { total_amount: 0 }
        );

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalDays,
              totalTrades,
              totalAmount,
              avgDailyAmount,
              totalGains,
              totalLosses,
              winRate,
              bestDay,
              worstDay
            },
            recentSummaries,
            monthlyPerformance,
            topSymbols
          }
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter. Use: monthly, top-symbols, symbol-performance, or overview' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
