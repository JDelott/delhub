'use client';

import { ViewMode } from '../types';

interface EmptyStateProps {
  viewMode: ViewMode;
}

export default function EmptyState({ viewMode }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-slate-300 mb-2">Options Chain Analyzer</h3>
        <p className="text-slate-500 max-w-md">
          {viewMode === 'screener' 
            ? 'Run the screener to find multiple stocks with put options matching your criteria.'
            : 'Enter a stock symbol to search for put options with your specified criteria.'
          }
        </p>
      </div>
    </div>
  );
}
