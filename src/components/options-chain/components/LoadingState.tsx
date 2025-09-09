'use client';

import { ViewMode } from '../types';

interface LoadingStateProps {
  viewMode: ViewMode;
}

export default function LoadingState({ viewMode }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">
          {viewMode === 'screener' ? 'Screening stocks for options...' : 'Loading options data...'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This may take a few moments
        </p>
      </div>
    </div>
  );
}
