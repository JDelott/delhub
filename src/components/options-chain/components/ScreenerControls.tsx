'use client';

import { SECTOR_FILTERS, VOLUME_FILTERS, STRIKE_RANGES, SPREAD_OPTIONS } from '../constants';

interface ScreenerControlsProps {
  customSymbols: string;
  setCustomSymbols: (symbols: string) => void;
  expirationFilter: 'all' | 'near' | 'far';
  setExpirationFilter: (filter: 'all' | 'near' | 'far') => void;
  priceFilter: 'all' | 'under50' | 'under25' | 'verified50';
  setPriceFilter: (filter: 'all' | 'under50' | 'under25' | 'verified50') => void;
  sectorFilter: string;
  setSectorFilter: (sector: string) => void;
  maxStockPrice: number;
  setMaxStockPrice: (price: number) => void;
  minAverageVolume: number;
  setMinAverageVolume: (volume: number) => void;
  selectedSpreads: number[];
  setSelectedSpreads: React.Dispatch<React.SetStateAction<number[]>>; // Fixed type
  minBid: number;
  setMinBid: (bid: number) => void;
  strikeRange: 'tight' | 'moderate' | 'wide' | 'extended';
  setStrikeRange: (range: 'tight' | 'moderate' | 'wide' | 'extended') => void;
  loading: boolean;
  onRunScreener: () => void;
}

export default function ScreenerControls({
  customSymbols,
  setCustomSymbols,
  expirationFilter,
  setExpirationFilter,
  priceFilter,
  setPriceFilter,
  sectorFilter,
  setSectorFilter,
  maxStockPrice,
  setMaxStockPrice,
  minAverageVolume,
  setMinAverageVolume,
  selectedSpreads,
  setSelectedSpreads,
  minBid,
  setMinBid,
  strikeRange,
  setStrikeRange,
  loading,
  onRunScreener
}: ScreenerControlsProps) {

  const toggleSpread = (spread: number) => {
    setSelectedSpreads((prev: number[]) => 
      prev.includes(spread) 
        ? prev.filter((s: number) => s !== spread)
        : [...prev, spread].sort((a: number, b: number) => a - b)
    );
  };

  return (
    <div className="space-y-5">
      {/* Filters Row - Keep as 4 columns */}
      <div className="grid grid-cols-4 gap-5">
        {/* Expiration Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Time Horizon
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('expiration-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {expirationFilter === 'all' ? 'All Timeframes' :
                   expirationFilter === 'near' ? 'Short Term (30 days or less)' : 'Long Term (more than 30 days)'}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="expiration-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg"
            >
              {[
                { value: 'all', label: 'All Timeframes', desc: 'Every available expiration date' },
                { value: 'near', label: 'Short Term', desc: 'Options expiring in 30 days or less' },
                { value: 'far', label: 'Long Term', desc: 'Options expiring in more than 30 days' }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    expirationFilter === option.value 
                      ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-300'
                  }`}
                  onClick={() => {
                    setExpirationFilter(option.value as 'all' | 'near' | 'far');
                    document.getElementById('expiration-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Price Range
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('price-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-violet-400/60 hover:bg-slate-900/70 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-violet-500/10">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {priceFilter === 'verified50' ? 'Premium Under $50' :
                   priceFilter === 'under25' ? 'Budget Under $25' :
                   priceFilter === 'under50' ? 'Standard Under $50' : 'All Price Ranges'}
                </span>
                <svg className="w-4 h-4 text-violet-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="price-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl overflow-hidden z-50 shadow-2xl shadow-violet-500/10"
            >
              {[
                { value: 'verified50', label: 'Premium Under $50', desc: 'Curated high-quality stocks' },
                { value: 'under25', label: 'Budget Under $25', desc: 'Affordable entry points' },
                { value: 'under50', label: 'Standard Under $50', desc: 'Broad market selection' },
                { value: 'all', label: 'All Price Ranges', desc: 'Complete market coverage' }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    priceFilter === option.value 
                      ? 'bg-violet-500/15 text-violet-100 border-l-4 border-violet-400' 
                      : 'hover:bg-slate-800/60 border-l-4 border-transparent hover:border-violet-500/30'
                  }`}
                  onClick={() => {
                    setPriceFilter(option.value as 'all' | 'under50' | 'under25' | 'verified50');
                    document.getElementById('price-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="font-medium text-slate-100">{option.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{option.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            Industry Sector
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('sector-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-emerald-400/60 hover:bg-slate-900/70 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {SECTOR_FILTERS.find(s => s.value === sectorFilter)?.label || 'All Sectors'}
                </span>
                <svg className="w-4 h-4 text-emerald-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="sector-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl overflow-hidden z-50 shadow-2xl shadow-emerald-500/10 max-h-60 overflow-y-auto"
            >
              {SECTOR_FILTERS.map((sector) => (
                <div
                  key={sector.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    sectorFilter === sector.value 
                      ? 'bg-emerald-500/15 text-emerald-100 border-l-4 border-emerald-400' 
                      : 'hover:bg-slate-800/60 border-l-4 border-transparent hover:border-emerald-500/30'
                  }`}
                  onClick={() => {
                    setSectorFilter(sector.value);
                    document.getElementById('sector-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-100">{sector.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{sector.desc}</div>
                    </div>
                    {sector.value !== 'all' && (
                      <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-1 rounded-full ml-3">
                        {sector.stocks.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-transparent">Action</label>
          <button
            onClick={onRunScreener}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning...
              </div>
            ) : (
              'Run Screen'
            )}
          </button>
        </div>
      </div>
      
      {/* Parameters Row - Update to 6 columns to include strike range */}
      <div className="grid grid-cols-6 gap-4 pt-6 border-t border-gray-200">
        {/* Custom Symbols */}
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Custom Symbols (optional)</label>
          <input
            type="text"
            value={customSymbols}
            onChange={(e) => setCustomSymbols(e.target.value)}
            placeholder="AAPL, TSLA, MSFT, GOOGL..."
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            disabled={loading}
          />
        </div>
        
        {/* Volume Filter - New styled dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Volume Filter</label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('volume-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-orange-400/60 hover:bg-slate-900/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {VOLUME_FILTERS.find(v => v.value === minAverageVolume)?.displayValue || 'Custom'}
                </span>
                <svg className="w-4 h-4 text-orange-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="volume-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl overflow-hidden z-50 shadow-2xl shadow-orange-500/10 max-h-60 overflow-y-auto"
            >
              {VOLUME_FILTERS.map((volumeOption) => (
                <div
                  key={volumeOption.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    minAverageVolume === volumeOption.value 
                      ? 'bg-orange-500/15 text-orange-100 border-l-4 border-orange-400' 
                      : 'hover:bg-slate-800/60 border-l-4 border-transparent hover:border-orange-500/30'
                  }`}
                  onClick={() => {
                    setMinAverageVolume(volumeOption.value);
                    document.getElementById('volume-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="font-medium text-slate-100">{volumeOption.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{volumeOption.desc}</div>
                </div>
              ))}
              
              {/* Custom input option */}
              <div className="border-t border-slate-700/50 px-4 py-3">
                <div className="font-medium text-slate-100 mb-2">Custom Volume</div>
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={VOLUME_FILTERS.find(v => v.value === minAverageVolume) ? '' : minAverageVolume}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setMinAverageVolume(value);
                  }}
                  placeholder="Enter custom volume..."
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none transition-all text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Max Price */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Max Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={maxStockPrice}
            onChange={(e) => setMaxStockPrice(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            disabled={loading}
          />
        </div>
        
        {/* Strike Range Dropdown - New */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Strike Distance</label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('strike-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-yellow-400/60 hover:bg-slate-900/70 transition-all duration-300">
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
              id="strike-dropdown"
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
                    document.getElementById('strike-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="font-medium text-slate-100">{range.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{range.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Exact Spreads - Multi-Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">
            Exact Spreads ({selectedSpreads.length} selected)
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('spreads-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 hover:border-cyan-400/60 hover:bg-slate-900/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {selectedSpreads.length === 0 ? 'Select spreads...' : 
                   selectedSpreads.length === 1 ? `$${selectedSpreads[0].toFixed(2)}` :
                   `${selectedSpreads.length} spreads`}
                </span>
                <svg className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="spreads-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl overflow-hidden z-50 shadow-2xl shadow-cyan-500/10 max-h-60 overflow-y-auto"
            >
              {SPREAD_OPTIONS.map((spreadOption) => (
                <div
                  key={spreadOption.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                    selectedSpreads.includes(spreadOption.value)
                      ? 'bg-cyan-500/15 text-cyan-100 border-l-4 border-cyan-400' 
                      : 'hover:bg-slate-800/60 border-l-4 border-transparent hover:border-cyan-500/30'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSpread(spreadOption.value);
                  }}
                >
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedSpreads.includes(spreadOption.value)
                      ? 'border-cyan-400 bg-cyan-500'
                      : 'border-slate-600'
                  }`}>
                    {selectedSpreads.includes(spreadOption.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">${spreadOption.value.toFixed(2)}</div>
                    <div className="text-xs text-slate-400 mt-1">{spreadOption.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Min Bid */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Min Bid ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minBid}
            onChange={(e) => setMinBid(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
