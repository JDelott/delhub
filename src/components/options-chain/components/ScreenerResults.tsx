'use client';

import { ScreenerResults as ScreenerResultsType, OptionType } from '../types';
import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';
import { formatCurrency, formatDate, generateOptionId } from '../utils';

// Custom Electric Checkbox Component
const ElectricCheckbox = ({ 
  checked, 
  onChange, 
  className = "" 
}: { 
  checked: boolean; 
  onChange: () => void; 
  className?: string; 
}) => (
  <div className={`relative ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only" // Hide default checkbox
    />
    <div
      onClick={onChange}
      className={`
        w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 relative
        ${checked 
          ? 'bg-gradient-to-br from-cyan-400 to-violet-500 border-cyan-400 shadow-lg shadow-cyan-400/25' 
          : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
        }
      `}
    >
      {checked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-3 h-3 text-slate-900 font-bold" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
      {checked && (
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 rounded-lg blur animate-pulse"></div>
      )}
    </div>
  </div>
);

interface ScreenerResultsProps {
  screenerResults: ScreenerResultsType;
  optionType: OptionType;
  selectedOptions: Set<string>;
  onToggleOptionSelection: (symbol: string, option: FilteredPutOption | FilteredCallOption, optionType: 'put' | 'call') => void;
  onOpenTradeModal: (symbol: string, option: FilteredPutOption | FilteredCallOption, optionType: 'put' | 'call', stockPrice?: number) => void;
  onDownloadPDF: () => void;
}

export default function ScreenerResults({
  screenerResults,
  optionType,
  selectedOptions,
  onToggleOptionSelection,
  onOpenTradeModal,
  onDownloadPDF
}: ScreenerResultsProps) {
  if (!screenerResults?.results || screenerResults.results.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Results Found</h3>
        <p className="text-slate-500">
          No stocks found matching your screening criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  const totalSelected = selectedOptions.size;
  // Calculate total options found across all results
  const totalOptionsFound = screenerResults.results.reduce((sum, result) => {
    return sum + (optionType === 'puts' ? result.totalPutOptionsFound : result.totalCallOptionsFound);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header with selection info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Screening Results ({screenerResults.results.length} stocks)
          </h2>
          <p className="text-sm text-slate-400">
            Found {totalOptionsFound} matching {optionType} across all stocks
          </p>
        </div>
        <div className="flex items-center gap-4">
          {totalSelected > 0 && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-lg">
              <span className="text-sm font-medium text-cyan-400">
                {totalSelected} selected for batch trading
              </span>
            </div>
          )}
          <button
            onClick={onDownloadPDF}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors text-sm font-medium border border-slate-600/50"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Results for each stock */}
      {screenerResults.results.map((result, stockIdx) => {
        const optionsToShow = optionType === 'puts' ? result.bestPutOptions : result.bestCallOptions;
        const totalOptionsFound = optionType === 'puts' ? result.totalPutOptionsFound : result.totalCallOptionsFound;
        
        if (optionsToShow.length === 0) return null;
        
        return (
          <div key={stockIdx} className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  {result.symbol}
                </h3>
                <div className="flex gap-4 text-sm text-slate-400">
                  <span>Stock: {result.stockPrice ? formatCurrency(result.stockPrice) : 'N/A'}</span>
                  <span>Vol: {result.averageVolume ? 
                    `${(result.averageVolume / 1000000).toFixed(1)}M` : 'N/A'}</span>
                  <span>{totalOptionsFound} matching {optionType}</span>
                  <span>{result.expirations.length} expirations available</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-cyan-400">
                  Top {optionsToShow.length} {optionType === 'puts' ? 'Puts' : 'Calls'}
                </div>
              </div>
            </div>
            
            {optionsToShow.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="text-center py-2 w-8">
                        <ElectricCheckbox
                          checked={optionsToShow.every(option => 
                            selectedOptions.has(generateOptionId(result.symbol, option, optionType === 'puts' ? 'put' : 'call'))
                          )}
                          onChange={() => {
                            const allSelected = optionsToShow.every(option => 
                              selectedOptions.has(generateOptionId(result.symbol, option, optionType === 'puts' ? 'put' : 'call'))
                            );
                            
                            optionsToShow.forEach(option => {
                              if (allSelected) {
                                // If all are selected, deselect all
                                onToggleOptionSelection(result.symbol, option, optionType === 'puts' ? 'put' : 'call');
                              } else {
                                // If not all are selected, select any that aren't selected
                                const optionId = generateOptionId(result.symbol, option, optionType === 'puts' ? 'put' : 'call');
                                if (!selectedOptions.has(optionId)) {
                                  onToggleOptionSelection(result.symbol, option, optionType === 'puts' ? 'put' : 'call');
                                }
                              }
                            });
                          }}
                        />
                      </th>
                      <th className="text-left py-2">Strike</th>
                      <th className="text-left py-2">vs Stock</th>
                      <th className="text-left py-2">Bid</th>
                      <th className="text-left py-2">Ask</th>
                      <th className="text-left py-2">Spread</th>
                      <th className="text-left py-2">Volume</th>
                      <th className="text-left py-2">Expiration</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsToShow.map((option: FilteredPutOption | FilteredCallOption, idx: number) => {
                      const optionId = generateOptionId(result.symbol, option, optionType === 'puts' ? 'put' : 'call');
                      const isSelected = selectedOptions.has(optionId);
                      
                      return (
                        <tr key={idx} className={`border-b border-slate-800/30 last:border-b-0 transition-all duration-200 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border-l-2 border-l-cyan-400' 
                            : 'hover:bg-slate-800/30'
                        }`}>
                          <td className="py-2 text-center">
                            <ElectricCheckbox
                              checked={isSelected}
                              onChange={() => onToggleOptionSelection(result.symbol, option, optionType === 'puts' ? 'put' : 'call')}
                            />
                          </td>
                          <td className="py-2 text-slate-100 font-medium">
                            {formatCurrency(option.strike)}
                          </td>
                          <td className={`py-2 text-xs ${
                            optionType === 'puts' 
                              ? 'text-red-400' 
                              : result.stockPrice && option.strike > result.stockPrice 
                                ? 'text-red-400' 
                                : 'text-green-400'
                          }`}>
                            {result.stockPrice ? 
                              `${((option.strike - result.stockPrice) / result.stockPrice * 100).toFixed(1)}%` 
                              : 'N/A'
                            }
                          </td>
                          <td className="py-2 text-green-400 font-medium">
                            {formatCurrency(option.bid)}
                          </td>
                          <td className="py-2 text-red-400 font-medium">
                            {formatCurrency(option.ask)}
                          </td>
                          <td className="py-2 text-slate-300">
                            {formatCurrency(option.bidAskSpread)}
                          </td>
                          <td className="py-2 text-slate-400">
                            {option.volume?.toLocaleString() || '0'}
                          </td>
                          <td className="py-2 text-slate-400 text-xs">
                            {formatDate(option.expirationDate)}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => onOpenTradeModal(result.symbol, option, optionType === 'puts' ? 'put' : 'call', result.stockPrice)}
                              className="px-3 py-1.5 bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 text-violet-400 border border-violet-500/30 rounded-md text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10"
                            >
                              Trade
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
