import { NextResponse } from 'next/server';
import { postgresService } from '@/lib/postgres-service';

export async function GET() {
  try {
    const isConnected = await postgresService.testConnection();
    
    return NextResponse.json({
      success: true,
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
