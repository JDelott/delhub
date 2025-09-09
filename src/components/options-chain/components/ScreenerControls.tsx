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
    <div className="space-y-6">
      {/* First Row - 5 columns */}
      <div className="grid grid-cols-5 gap-4">
        {/* Expiration Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
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
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {expirationFilter === 'all' ? 'All Timeframes' :
                   expirationFilter === 'near' ? 'Short Term' : 'Long Term'}
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
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
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
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {priceFilter === 'verified50' ? 'Under $50' :
                   priceFilter === 'under25' ? 'Under $25' :
                   priceFilter === 'under50' ? 'Under $50' : 'All Prices'}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="price-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg"
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
                      ? 'bg-violet-50 text-violet-900 border-l-4 border-violet-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-violet-300'
                  }`}
                  onClick={() => {
                    setPriceFilter(option.value as 'all' | 'under50' | 'under25' | 'verified50');
                    document.getElementById('price-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className={`font-medium ${
                    priceFilter === option.value ? 'text-violet-900' : 'text-gray-900'
                  }`}>{option.label}</div>
                  <div className={`text-xs mt-1 ${
                    priceFilter === option.value ? 'text-violet-700' : 'text-gray-600'
                  }`}>{option.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Industry Sector
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('sector-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {SECTOR_FILTERS.find(s => s.value === sectorFilter)?.label || 'All Sectors'}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="sector-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg max-h-60 overflow-y-auto"
            >
              {SECTOR_FILTERS.map((sector) => (
                <div
                  key={sector.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    sectorFilter === sector.value 
                      ? 'bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-emerald-300'
                  }`}
                  onClick={() => {
                    setSectorFilter(sector.value);
                    document.getElementById('sector-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`font-medium ${
                        sectorFilter === sector.value ? 'text-emerald-900' : 'text-gray-900'
                      }`}>{sector.label}</div>
                      <div className={`text-xs mt-1 ${
                        sectorFilter === sector.value ? 'text-emerald-700' : 'text-gray-600'
                      }`}>{sector.desc}</div>
                    </div>
                    {sector.value !== 'all' && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full ml-3">
                        {sector.stocks.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Min Bid */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            Min Bid ($)
          </label>
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

        {/* Run Screen Button */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Action
          </label>
          <button
            onClick={onRunScreener}
            disabled={loading}
            className="w-full h-11 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:cursor-not-allowed text-sm"
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
      
      {/* Second Row - 5 columns */}
      <div className="grid grid-cols-5 gap-4 pt-6 border-t border-gray-200">
        {/* Custom Symbols */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Custom Symbols
          </label>
          <input
            type="text"
            value={customSymbols}
            onChange={(e) => setCustomSymbols(e.target.value)}
            placeholder="AAPL, TSLA, MSFT..."
            className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            disabled={loading}
          />
        </div>
        {/* Volume Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Volume Filter
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('volume-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {VOLUME_FILTERS.find(v => v.value === minAverageVolume)?.displayValue || 'Custom'}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="volume-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg max-h-60 overflow-y-auto"
            >
              {VOLUME_FILTERS.map((volumeOption) => (
                <div
                  key={volumeOption.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    minAverageVolume === volumeOption.value 
                      ? 'bg-orange-50 text-orange-900 border-l-4 border-orange-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-orange-300'
                  }`}
                  onClick={() => {
                    setMinAverageVolume(volumeOption.value);
                    document.getElementById('volume-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className={`font-medium ${
                    minAverageVolume === volumeOption.value ? 'text-orange-900' : 'text-gray-900'
                  }`}>{volumeOption.label}</div>
                  <div className={`text-xs mt-1 ${
                    minAverageVolume === volumeOption.value ? 'text-orange-700' : 'text-gray-600'
                  }`}>{volumeOption.desc}</div>
                </div>
              ))}
              
              {/* Custom input option */}
              <div className="border-t border-gray-200 px-4 py-3">
                <div className="font-medium text-gray-900 mb-2">Custom Volume</div>
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
                  className="w-full h-9 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Max Price */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Max Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={maxStockPrice}
            onChange={(e) => setMaxStockPrice(Number(e.target.value))}
            className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            disabled={loading}
          />
        </div>
        
        {/* Strike Range Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Strike Distance
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('strike-dropdown');
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
              id="strike-dropdown"
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
                    document.getElementById('strike-dropdown')?.classList.add('hidden');
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
        
        {/* Exact Spreads - Multi-Select */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 h-6">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            Exact Spreads ({selectedSpreads.length})
          </label>
          <div 
            className="relative group cursor-pointer"
            onClick={() => {
              const dropdown = document.getElementById('spreads-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
          >
            <div className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {selectedSpreads.length === 0 ? 'Select spreads' : 
                   selectedSpreads.length === 1 ? `$${selectedSpreads[0].toFixed(2)}` :
                   `${selectedSpreads.length} spreads`}
                </span>
                <svg className="w-4 h-4 text-blue-500 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              id="spreads-dropdown"
              className="hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden z-50 shadow-lg max-h-60 overflow-y-auto"
            >
              {SPREAD_OPTIONS.map((spreadOption) => (
                <div
                  key={spreadOption.value}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                    selectedSpreads.includes(spreadOption.value)
                      ? 'bg-cyan-50 text-cyan-900 border-l-4 border-cyan-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-cyan-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSpread(spreadOption.value);
                  }}
                >
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedSpreads.includes(spreadOption.value)
                      ? 'border-cyan-500 bg-cyan-500'
                      : 'border-gray-400'
                  }`}>
                    {selectedSpreads.includes(spreadOption.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${
                      selectedSpreads.includes(spreadOption.value) ? 'text-cyan-900' : 'text-gray-900'
                    }`}>${spreadOption.value.toFixed(2)}</div>
                    <div className={`text-xs mt-1 ${
                      selectedSpreads.includes(spreadOption.value) ? 'text-cyan-700' : 'text-gray-600'
                    }`}>{spreadOption.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
