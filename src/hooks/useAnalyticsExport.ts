import { useCallback, useState } from 'react';

interface AnalyticsData {
  overview: {
    totalDays: number;
    totalTrades: number;
    totalAmount: number;
    avgDailyAmount: number;
    totalGains: number;
    totalLosses: number;
    winRate: number;
    bestDay: any;
    worstDay: any;
  };
  recentSummaries: any[];
  monthlyPerformance: any[];
  topSymbols: any[];
}

export const useAnalyticsExport = (data: AnalyticsData | null) => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadPDFReport = useCallback(async () => {
    if (!data) {
      alert('No analytics data to export. Please wait for data to load.');
      return;
    }

    setIsExporting(true);

    try {
      const { generateAnalyticsPDF } = await import('../utils/analyticsPdfGenerator');
      
      await generateAnalyticsPDF(data);
      
    } catch (err) {
      console.error('Failed to generate analytics PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [data]);

  return {
    downloadPDFReport,
    isExporting
  };
};
