'use client';

import { formatDate } from '../utils';
import { STRIKE_RANGES, SPREAD_OPTIONS } from '../constants';

interface SingleStockControlsProps {
  symbol: string;
  setSymbol: (symbol: string) => void;
  expirations: string[];
  selectedExpiration: string;
  setSelectedExpiration: (expiration: string) => void;
  selectedSpreads: number[];
  setSelectedSpreads: React.Dispatch<React.SetStateAction<number[]>>; // Fixed type
  minBid: number;
  setMinBid: (bid: number) => void;
  strikeRange: 'tight' | 'moderate' | 'wide' | 'extended';
  setStrikeRange: (range: 'tight' | 'moderate' | 'wide' | 'extended') => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SingleStockControls({
  symbol,
  setSymbol,
  expirations,
  selectedExpiration,
  setSelectedExpiration,
  selectedSpreads,
  setSelectedSpreads,
  minBid,
  setMinBid,
  strikeRange,
  setStrikeRange,
  loading,
  onSubmit
}: SingleStockControlsProps) {

  const toggleSpread = (spread: number) => {
    setSelectedSpreads((prev: number[]) => 
      prev.includes(spread) 
        ? prev.filter((s: number) => s !== spread)
        : [...prev, spread].sort((a: number, b: number) => a - b)
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            Stock Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol (e.g., AAPL, TSLA)"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Strike Distance</label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('single-strike-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-yellow-400/60 hover:bg-slate-900/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {STRIKE_RANGES.find(r => r.value === strikeRange)?.label || 'Select Range'}
                </span>
                <svg className="w-4 h-4 text-yellow-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="single-strike-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl overflow-hidden z-50 shadow-2xl shadow-yellow-500/10"
            >
              {STRIKE_RANGES.map((range) => (
                <div
                  key={range.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    strikeRange === range.value 
                      ? 'bg-yellow-500/15 text-yellow-100 border-l-4 border-yellow-400' 
                      : 'hover:bg-slate-800/60 border-l-4 border-transparent hover:border-yellow-500/30'
                  }`}
                  onClick={() => {
                    setStrikeRange(range.value);
                    document.getElementById('single-strike-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="font-medium text-slate-100">{range.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{range.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Multi-Select Spreads */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">
            Spreads ({selectedSpreads.length})
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('single-spreads-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-blue-400/60 hover:bg-slate-900/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {selectedSpreads.length === 0 ? 'Select' : 
                   selectedSpreads.length === 1 ? `$${selectedSpreads[0].toFixed(2)}` :
                   `${selectedSpreads.length} spreads`}
                </span>
                <svg className="w-4 h-4 text-blue-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="single-spreads-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl overflow-hidden z-50 shadow-2xl shadow-blue-500/10"
            >
              {SPREAD_OPTIONS.map((spread) => (
                <div
                  key={spread.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                    selectedSpreads.includes(spread.value)
                      ? 'bg-blue-500/15 text-blue-100 border-l-4 border-blue-400' 
                      : 'hover:bg-slate-800/60 border-l-4 border-transparent hover:border-blue-500/30'
                  }`}
                  onClick={() => toggleSpread(spread.value)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedSpreads.includes(spread.value)
                      ? 'border-blue-400 bg-blue-400'
                      : 'border-slate-500'
                  }`}>
                    {selectedSpreads.includes(spread.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-100">{spread.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{spread.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Min Bid ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minBid}
            onChange={(e) => setMinBid(Number(e.target.value))}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Expiration Selector for Single Stock */}
      {expirations.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Expiration Date</label>
          <select
            value={selectedExpiration}
            onChange={(e) => setSelectedExpiration(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
            disabled={loading}
          >
            {expirations.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-start pt-2">
        <button
          type="submit"
          disabled={loading || !symbol.trim()}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Options'}
        </button>
      </div>
    </form>
  );
}
