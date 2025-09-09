import { NextRequest, NextResponse } from 'next/server';
import TradierService from '@/lib/tradier-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Await params in Next.js 15+
    const resolvedParams = await params;
    const symbol = resolvedParams.symbol.toUpperCase();
    
    // Extract search parameters for filtering
    const expiration = searchParams.get('expiration');
    const exactSpreadsParam = searchParams.get('exactSpreads') || '0.15';
    const exactSpreads = exactSpreadsParam.split(',').map(s => parseFloat(s.trim()));
    const minBid = parseFloat(searchParams.get('minBid') || '0.05');
    const strikeRange = searchParams.get('strikeRange') as 'tight' | 'moderate' | 'wide' | 'extended' || 'moderate';
    
    const tradierService = new TradierService();

    switch (action) {
      case 'expirations':
        try {
          const expirations = await tradierService.getOptionsExpirations(symbol);
          return NextResponse.json({
            success: true,
            data: {
              symbol,
              expirations
            }
          });
        } catch (error) {
          console.error(`Error fetching expirations for ${symbol}:`, error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch expirations'
          }, { status: 500 });
        }

      case 'filtered-puts':
        if (!expiration) {
          return NextResponse.json({
            success: false,
            error: 'Expiration date is required'
          }, { status: 400 });
        }

        try {
          const quote = await tradierService.getQuote(symbol);
          const filteredPuts = await tradierService.getFilteredPutOptions(
            symbol,
            expiration,
            exactSpreads,
            minBid,
            quote.last,
            strikeRange
          );

          return NextResponse.json({
            success: true,
            data: {
              symbol,
              expiration,
              stockPrice: quote.last,
              criteria: {
                exactSpreads,
                minBid,
                strikeRange
              },
              putOptions: filteredPuts,
              count: filteredPuts.length
            }
          });
        } catch (error) {
          console.error(`Error fetching filtered puts for ${symbol}:`, error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch filtered puts'
          }, { status: 500 });
        }

      case 'filtered-calls':
        if (!expiration) {
          return NextResponse.json({
            success: false,
            error: 'Expiration date is required'
          }, { status: 400 });
        }

        try {
          const quote = await tradierService.getQuote(symbol);
          const filteredCalls = await tradierService.getFilteredCallOptions(
            symbol,
            expiration,
            exactSpreads,
            minBid,
            quote.last,
            strikeRange
          );

          return NextResponse.json({
            success: true,
            data: {
              symbol,
              expiration,
              stockPrice: quote.last,
              criteria: {
                exactSpreads,
                minBid,
                strikeRange
              },
              callOptions: filteredCalls,
              count: filteredCalls.length
            }
          });
        } catch (error) {
          console.error(`Error fetching filtered calls for ${symbol}:`, error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch filtered calls'
          }, { status: 500 });
        }

      case 'debug-expirations':
        try {
          const result = await tradierService.getOptionsExpirationsWithDebug(symbol);
          return NextResponse.json({
            success: true,
            data: {
              symbol,
              ...result
            }
          });
        } catch (error) {
          console.error(`Error fetching debug expirations for ${symbol}:`, error);
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch debug expirations'
          }, { status: 500 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: expirations, filtered-puts, filtered-calls, debug-expirations'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Options API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
