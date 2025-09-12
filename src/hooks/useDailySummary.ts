import { useState } from 'react';

interface TradeData {
  id: string;
  symbol: string;
  amount: number;
  timestamp: string;
  notes?: string;
}

interface DailySummaryResponse {
  success: boolean;
  data?: {
    summary: any;
    symbolCount: number;
    entriesCount: number;
  };
  error?: string;
}

export const useDailySummary = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);

  const logDailySummary = async (trades: TradeData[], date?: string): Promise<DailySummaryResponse> => {
    setIsLogging(true);
    
    try {
      const response = await fetch('/api/daily-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trades,
          date: date || new Date().toISOString().split('T')[0]
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setLastLoggedDate(date || new Date().toISOString().split('T')[0]);
      }
      
      return result;
    } catch (error) {
      console.error('Error logging daily summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log daily summary'
      };
    } finally {
      setIsLogging(false);
    }
  };

  const checkDatabaseConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/daily-summary');
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  };

  return {
    logDailySummary,
    checkDatabaseConnection,
    isLogging,
    lastLoggedDate
  };
};
