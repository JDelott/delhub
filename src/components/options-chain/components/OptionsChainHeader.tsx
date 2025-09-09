'use client';

import { OptionType, ViewMode } from '../types';

interface OptionsChainHeaderProps {
  optionType: OptionType;
  setOptionType: (type: OptionType) => void;
  selectedSpreadsCount: number; // Changed from exactSpread
  selectedOptionsCount: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onBatchTradeClick: () => void;
}

export default function OptionsChainHeader({
  optionType,
  setOptionType,
  selectedSpreadsCount,
  selectedOptionsCount,
  viewMode,
  setViewMode,
  onBatchTradeClick
}: OptionsChainHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 pt-8 pb-4">
      <div className="flex items-center justify-between">
        {/* Left: Title and Status */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Options Screener
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                optionType === 'puts' 
                  ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {optionType === 'puts' ? 'BEARISH STRATEGY' : 'BULLISH STRATEGY'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 font-medium">
                {selectedSpreadsCount} spread{selectedSpreadsCount !== 1 ? 's' : ''}
              </span>
              {selectedOptionsCount > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-blue-600 font-medium">{selectedOptionsCount} selected</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Right: All Controls */}
        <div className="flex items-center gap-4">
          {/* Batch Trade Button */}
          {viewMode === 'screener' && selectedOptionsCount > 0 && (
            <button
              onClick={onBatchTradeClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Batch Trade ({selectedOptionsCount})
            </button>
          )}

          {/* Option Type Toggle */}
          <div className="flex bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={() => setOptionType('puts')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                optionType === 'puts'
                  ? 'bg-white text-orange-600 shadow-sm border border-orange-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PUT OPTIONS
            </button>
            <button
              onClick={() => setOptionType('calls')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                optionType === 'calls'
                  ? 'bg-white text-green-600 shadow-sm border border-green-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CALL OPTIONS
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={() => setViewMode('screener')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'screener'
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Multi-Stock Screener
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'single'
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
