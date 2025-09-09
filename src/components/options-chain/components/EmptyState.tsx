'use client';

import { ViewMode } from '../types';

interface EmptyStateProps {
  viewMode: ViewMode;
}

export default function EmptyState({ viewMode }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="text-gray-400 mb-6">
          <svg className="w-20 h-20 mx-auto opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Options Chain Analyzer</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
          {viewMode === 'screener' 
            ? 'Run the screener to find multiple stocks with options matching your criteria and start building your trading strategy.'
            : 'Enter a stock symbol to search for options with your specified criteria and begin your analysis.'
          }
        </p>
      </div>
    </div>
  );
}
