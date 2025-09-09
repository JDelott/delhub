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
    <div className="relative border-b border-slate-800/50 px-8 py-5">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-blue-500/5" />
      <div className="relative flex items-center justify-between">
        {/* Left: Title + Strategy */}
        <div className="flex items-center gap-10">
          <div>
            <h1 className="text-xl font-semibold text-slate-100 mb-1">
              Options Screener
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                optionType === 'puts' 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {optionType === 'puts' ? 'BEARISH STRATEGY' : 'BULLISH STRATEGY'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-cyan-400 font-medium">
                {selectedSpreadsCount} spread{selectedSpreadsCount !== 1 ? 's' : ''}
              </span>
              {selectedOptionsCount > 0 && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-violet-400 font-medium">{selectedOptionsCount} selected</span>
                </>
              )}
            </div>
          </div>
          
          {/* Option Type Toggle - Electric */}
          <div className="relative">
            <div className="flex bg-slate-900/60 rounded-xl p-1 border border-slate-700/50">
              {/* Sliding indicator */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out ${
                  optionType === 'puts' 
                    ? 'left-1 bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-400/40' 
                    : 'left-[calc(50%+2px)] bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border border-emerald-400/40'
                }`}
              />
              <button
                onClick={() => setOptionType('puts')}
                className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  optionType === 'puts'
                    ? 'text-orange-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PUT OPTIONS
              </button>
              <button
                onClick={() => setOptionType('calls')}
                className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  optionType === 'calls'
                    ? 'text-emerald-200'
                    : 'text-slate-400 hover:text-slate-200'
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
              className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-violet-500/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Batch Trade ({selectedOptionsCount})
            </button>
          )}

          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/40">
            <button
              onClick={() => setViewMode('screener')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'screener'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Multi-Stock Screener
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'single'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
