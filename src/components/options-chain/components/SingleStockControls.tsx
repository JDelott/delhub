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

  // Ensure selectedSpreads is always an array (defensive programming for Zustand issues)
  const safeSelectedSpreads = Array.isArray(selectedSpreads) ? selectedSpreads : [];

  const toggleSpread = (spread: number) => {
    setSelectedSpreads((prev: number[]) => {
      // Ensure prev is an array
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.includes(spread) 
        ? safePrev.filter((s: number) => s !== spread)
        : [...safePrev, spread].sort((a: number, b: number) => a - b);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Stock Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol (e.g., AAPL, TSLA)"
            className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Strike Distance</label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('single-strike-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {STRIKE_RANGES.find(r => r.value === strikeRange)?.label || 'Select Range'}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="single-strike-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg"
            >
              {STRIKE_RANGES.map((range) => (
                <div
                  key={range.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    strikeRange === range.value 
                      ? 'bg-yellow-50 text-yellow-900 border-l-4 border-yellow-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-yellow-300'
                  }`}
                  onClick={() => {
                    setStrikeRange(range.value);
                    document.getElementById('single-strike-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className={`font-medium ${
                    strikeRange === range.value ? 'text-yellow-900' : 'text-gray-900'
                  }`}>{range.label}</div>
                  <div className={`text-xs mt-1 ${
                    strikeRange === range.value ? 'text-yellow-700' : 'text-gray-600'
                  }`}>{range.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Multi-Select Spreads */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            Spreads ({safeSelectedSpreads.length})
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('single-spreads-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {safeSelectedSpreads.length === 0 ? 'Select' : 
                   safeSelectedSpreads.length === 1 && safeSelectedSpreads[0] != null ? `$${safeSelectedSpreads[0].toFixed(2)}` :
                   `${safeSelectedSpreads.length} spreads`}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="single-spreads-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg"
            >
              {SPREAD_OPTIONS.map((spread) => (
                <div
                  key={spread.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                    safeSelectedSpreads.includes(spread.value)
                      ? 'bg-cyan-50 text-cyan-900 border-l-4 border-cyan-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-cyan-300'
                  }`}
                  onClick={() => toggleSpread(spread.value)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    safeSelectedSpreads.includes(spread.value)
                      ? 'border-cyan-500 bg-cyan-500'
                      : 'border-gray-400'
                  }`}>
                    {safeSelectedSpreads.includes(spread.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      safeSelectedSpreads.includes(spread.value) ? 'text-cyan-900' : 'text-gray-900'
                    }`}>{spread.label}</div>
                    <div className={`text-xs mt-1 ${
                      safeSelectedSpreads.includes(spread.value) ? 'text-cyan-700' : 'text-gray-600'
                    }`}>{spread.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Min Bid ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minBid}
            onChange={(e) => setMinBid(Number(e.target.value))}
            className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Expiration Selector for Single Stock */}
      {expirations.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Expiration Date</label>
          <select
            value={selectedExpiration}
            onChange={(e) => setSelectedExpiration(e.target.value)}
            className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
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

      <div className="flex justify-start pt-4">
        <button
          type="submit"
          disabled={loading || !symbol.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </div>
          ) : (
            'Analyze Options'
          )}
        </button>
      </div>
    </form>
  );
}
