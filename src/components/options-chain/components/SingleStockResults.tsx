'use client';

import { OptionsData } from '../types';
import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';
import { formatCurrency, formatDate } from '../utils';

interface SingleStockResultsProps {
  optionsData: OptionsData;
  onOpenTradeModal: (option: FilteredPutOption | FilteredCallOption, optionType: 'put' | 'call', symbol: string, stockPrice: number) => void;
}

export default function SingleStockResults({
  optionsData,
  onOpenTradeModal
}: SingleStockResultsProps) {
  return (
    <div className="space-y-4">
      {/* Single Stock Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {optionsData.symbol} Put Options
            </h3>
            <div className="space-y-1 mt-2">
              <p className="text-sm text-gray-600">
                Expiration: {formatDate(optionsData.expiration)}
              </p>
              {optionsData.stockPrice && (
                <p className="text-sm text-gray-600">
                  Current Stock Price: {formatCurrency(optionsData.stockPrice)}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {optionsData.count} Results
            </div>
            <div className="text-xs text-gray-500 space-y-1 mt-1">
              <div>Spread: {formatCurrency(optionsData.criteria.exactSpread)}</div>
              <div>Min Bid: {formatCurrency(optionsData.criteria.minBid)}</div>
              <div>Strike: Within $1 below stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Stock Options Table */}
      {optionsData.putOptions.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Strike
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Bid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ask
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Spread
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-help" title="Total contracts traded for this option today">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Open Interest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {optionsData.putOptions.map((option) => (
                  <tr key={option.symbol} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      {formatCurrency(option.strike)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {formatCurrency(option.bid)}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-semibold">
                      {formatCurrency(option.ask)}
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">
                      {formatCurrency(option.bidAskSpread)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {option.volume.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {option.openInterest.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCurrency(option.lastPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onOpenTradeModal(
                            option,
                            'put',
                            optionsData.symbol,
                            optionsData.stockPrice || 0
                          )}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Buy put option"
                        >
                          BUY
                        </button>
                        <button
                          onClick={() => onOpenTradeModal(
                            option,
                            'put',
                            optionsData.symbol,
                            optionsData.stockPrice || 0
                          )}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Sell put option"
                        >
                          SELL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">No Options Found</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            No put options match your criteria for {optionsData.symbol} expiring {formatDate(optionsData.expiration)}.
            Try adjusting the spread or minimum bid requirements.
          </p>
        </div>
      )}
    </div>
  );
}
