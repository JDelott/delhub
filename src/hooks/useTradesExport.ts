import { useCallback } from 'react';
import { TradeEntry, TradeStats } from '@/store/tradeStore';
import { TradesPdfData } from '@/utils/tradesPdfGenerator';

interface UseTradesExportProps {
  trades: TradeEntry[];
  stats: TradeStats;
}

export const useTradesExport = ({ trades, stats }: UseTradesExportProps) => {
  const downloadPDFReport = useCallback(async () => {
    if (!trades || trades.length === 0) {
      alert('No trade entries to export. Please add some trades first.');
      return;
    }

    const button = document.getElementById('download-trades-pdf-button');
    if (button) {
      button.textContent = 'Generating PDF...';
      button.classList.add('opacity-50', 'cursor-not-allowed');
    }

    try {
      const { generateTradesPDF } = await import('@/utils/tradesPdfGenerator');
      
      const tradesData: TradesPdfData = {
        trades,
        stats
      };
      
      await generateTradesPDF(tradesData);
      
      // Show success feedback
      if (button) {
        button.textContent = '✅ Downloaded!';
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.classList.add('bg-green-500');
        setTimeout(() => {
          button.textContent = 'Download PDF';
          button.classList.remove('bg-green-500');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to generate trades PDF:', err);
      if (button) {
        button.textContent = '❌ Failed';
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.classList.add('bg-red-500');
        setTimeout(() => {
          button.textContent = 'Download PDF';
          button.classList.remove('bg-red-500');
        }, 3000);
      }
      alert('Failed to generate PDF report. Please try again.');
    }
  }, [trades, stats]);

  return {
    downloadPDFReport
  };
};
