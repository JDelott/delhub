'use client';

import { ViewMode } from '../types';

interface LoadingStateProps {
  viewMode: ViewMode;
}

export default function LoadingState({ viewMode }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">
          {viewMode === 'screener' ? 'Screening stocks for options...' : 'Loading options data...'}
        </p>
      </div>
    </div>
  );
}
