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
    <div className="relative border-b border-gray-200 px-8 py-6 bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50" />
      <div className="relative flex items-center justify-between">
        {/* Left: Title + Strategy */}
        <div className="flex items-center gap-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Options Screener
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                optionType === 'puts' 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {optionType === 'puts' ? 'BEARISH STRATEGY' : 'BULLISH STRATEGY'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-blue-600 font-medium">
                {selectedSpreadsCount} spread{selectedSpreadsCount !== 1 ? 's' : ''}
              </span>
              {selectedOptionsCount > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-indigo-600 font-medium">{selectedOptionsCount} selected</span>
                </>
              )}
            </div>
          </div>
          
          {/* Option Type Toggle - Professional */}
          <div className="relative">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              {/* Sliding indicator */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md transition-all duration-300 ease-out shadow-sm ${
                  optionType === 'puts' 
                    ? 'left-1 bg-white border border-orange-200' 
                    : 'left-[calc(50%+2px)] bg-white border border-green-200'
                }`}
              />
              <button
                onClick={() => setOptionType('puts')}
                className={`relative z-10 px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  optionType === 'puts'
                    ? 'text-orange-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                PUT OPTIONS
              </button>
              <button
                onClick={() => setOptionType('calls')}
                className={`relative z-10 px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  optionType === 'calls'
                    ? 'text-green-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                CALL OPTIONS
              </button>
            </div>
          </div>
        </div>
        
        {/* Right: View Mode Toggle + Batch Actions */}
        <div className="flex gap-4 items-center">
          {/* Batch Trade Button */}
          {viewMode === 'screener' && selectedOptionsCount > 0 && (
            <button
              onClick={onBatchTradeClick}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Batch Trade ({selectedOptionsCount})
            </button>
          )}

          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('screener')}
              className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                viewMode === 'screener'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Multi-Stock Screener
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                viewMode === 'single'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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
