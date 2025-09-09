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
          ? 'bg-blue-600 border-blue-600 shadow-sm' 
          : 'bg-white border-gray-300 hover:border-blue-400'
        }
      `}
    >
      {checked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-3 h-3 text-white font-bold" 
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
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
        <p className="text-gray-600">
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
          <h2 className="text-2xl font-bold text-gray-900">
            Screening Results ({screenerResults.results.length} stocks)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Found {totalOptionsFound} matching {optionType} across all stocks
          </p>
        </div>
        <div className="flex items-center gap-4">
          {totalSelected > 0 && (
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-semibold text-blue-700">
                {totalSelected} selected for batch trading
              </span>
            </div>
          )}
          <button
            onClick={onDownloadPDF}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-300"
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
          <div key={stockIdx} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {result.symbol}
                </h3>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span>Stock: {result.stockPrice ? formatCurrency(result.stockPrice) : 'N/A'}</span>
                  <span>Vol: {result.averageVolume ? 
                    `${(result.averageVolume / 1000000).toFixed(1)}M` : 'N/A'}</span>
                  <span>{totalOptionsFound} matching {optionType}</span>
                  <span>{result.expirations.length} expirations available</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-blue-600">
                  Top {optionsToShow.length} {optionType === 'puts' ? 'Puts' : 'Calls'}
                </div>
              </div>
            </div>
            
            {optionsToShow.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200">
                      <th className="text-center py-3 w-8">
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
                      <th className="text-left py-3 font-semibold">Strike</th>
                      <th className="text-left py-3 font-semibold">vs Stock</th>
                      <th className="text-left py-3 font-semibold">Bid</th>
                      <th className="text-left py-3 font-semibold">Ask</th>
                      <th className="text-left py-3 font-semibold">Spread</th>
                      <th className="text-left py-3 font-semibold">Volume</th>
                      <th className="text-left py-3 font-semibold">Expiration</th>
                      <th className="text-center py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsToShow.map((option: FilteredPutOption | FilteredCallOption, idx: number) => {
                      const optionId = generateOptionId(result.symbol, option, optionType === 'puts' ? 'put' : 'call');
                      const isSelected = selectedOptions.has(optionId);
                      
                      return (
                        <tr key={idx} className={`border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}>
                          <td className="py-2 text-center">
                            <ElectricCheckbox
                              checked={isSelected}
                              onChange={() => onToggleOptionSelection(result.symbol, option, optionType === 'puts' ? 'put' : 'call')}
                            />
                          </td>
                          <td className="py-3 text-gray-900 font-semibold">
                            {formatCurrency(option.strike)}
                          </td>
                          <td className={`py-3 text-xs font-medium ${
                            optionType === 'puts' 
                              ? 'text-red-600' 
                              : result.stockPrice && option.strike > result.stockPrice 
                                ? 'text-red-600' 
                                : 'text-green-600'
                          }`}>
                            {result.stockPrice ? 
                              `${((option.strike - result.stockPrice) / result.stockPrice * 100).toFixed(1)}%` 
                              : 'N/A'
                            }
                          </td>
                          <td className="py-3 text-green-600 font-semibold">
                            {formatCurrency(option.bid)}
                          </td>
                          <td className="py-3 text-red-600 font-semibold">
                            {formatCurrency(option.ask)}
                          </td>
                          <td className="py-3 text-gray-700 font-medium">
                            {formatCurrency(option.bidAskSpread)}
                          </td>
                          <td className="py-3 text-gray-600">
                            {option.volume?.toLocaleString() || '0'}
                          </td>
                          <td className="py-3 text-gray-600 text-xs">
                            {formatDate(option.expirationDate)}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => onOpenTradeModal(result.symbol, option, optionType === 'puts' ? 'put' : 'call', result.stockPrice)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
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
