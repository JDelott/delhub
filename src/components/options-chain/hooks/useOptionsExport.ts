


import { useCallback } from 'react';
import { ScreenerResults, OptionType } from '../types';

interface UseOptionsExportProps {
  screenerResults: ScreenerResults | null;
  optionType: OptionType;
  expirationFilter: 'all' | 'near' | 'far';
}

export const useOptionsExport = ({
  screenerResults,
  optionType,
  expirationFilter
}: UseOptionsExportProps) => {

  const downloadPDFReport = useCallback(async () => {
    if (!screenerResults || screenerResults.results.length === 0) return;

    const button = document.getElementById('download-pdf-button');
    if (button) {
      button.textContent = 'Generating PDF...';
      button.classList.add('opacity-50', 'cursor-not-allowed');
    }

    try {
      const { generateOptionsPDF } = await import('@/utils/optionsPdfGenerator');
      
      await generateOptionsPDF(screenerResults, optionType, expirationFilter);
      
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
      console.error('Failed to generate PDF:', err);
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
  }, [screenerResults, optionType, expirationFilter]);

  return {
    downloadPDFReport
  };
};
