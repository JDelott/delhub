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
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-200">
              {optionsData.symbol} Put Options
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">
                Expiration: {formatDate(optionsData.expiration)}
              </p>
              {optionsData.stockPrice && (
                <p className="text-sm text-slate-400">
                  Current Stock Price: {formatCurrency(optionsData.stockPrice)}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-cyan-400">
              {optionsData.count} Results
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Spread: {formatCurrency(optionsData.criteria.exactSpread)}</div>
              <div>Min Bid: {formatCurrency(optionsData.criteria.minBid)}</div>
              <div>Strike: Within $1 below stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Stock Options Table */}
      {optionsData.putOptions.length > 0 ? (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Strike
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Bid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ask
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Spread
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Open Interest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Last
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {optionsData.putOptions.map((option) => (
                  <tr key={option.symbol} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-100 font-medium">
                      {formatCurrency(option.strike)}
                    </td>
                    <td className="px-4 py-3 text-green-400">
                      {formatCurrency(option.bid)}
                    </td>
                    <td className="px-4 py-3 text-red-400">
                      {formatCurrency(option.ask)}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-medium">
                      {formatCurrency(option.bidAskSpread)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {option.volume.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {option.openInterest.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
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
                          className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-md text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
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
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-md text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
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
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-8 text-center">
          <div className="text-slate-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Options Found</h3>
          <p className="text-slate-500">
            No put options match your criteria for {optionsData.symbol} expiring {formatDate(optionsData.expiration)}.
            Try adjusting the spread or minimum bid requirements.
          </p>
        </div>
      )}
    </div>
  );
}
