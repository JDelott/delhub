'use client';

import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Trade {
  id: string;
  symbol: string;
  amount: number;
  timestamp: Date | string;
  notes?: string;
}

interface TradeStats {
  totalTrades: number;
  totalAmount: number;
  averageAmount: number;
  positiveEntries: number;
  negativeEntries: number;
  topSymbols: Array<{ symbol: string; total: number; count: number }>;
}

interface DailySummaryPreviewProps {
  trades: Trade[];
  stats: TradeStats;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function DailySummaryPreview({ 
  trades, 
  stats, 
  onSave, 
  onCancel, 
  isLoading 
}: DailySummaryPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Save Daily Summary - {today}
          </h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <ChartBarIcon className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Total Trades</p>
              <p className="font-bold text-gray-900">{stats.totalTrades}</p>
            </div>
            
            <div className={`rounded-lg p-3 text-center ${
              stats.totalAmount >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {stats.totalAmount >= 0 ? (
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-500 mx-auto mb-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-500 mx-auto mb-1" />
              )}
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className={`font-bold ${stats.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-purple-600 font-bold text-xs">+/-</span>
              </div>
              <p className="text-sm text-gray-600">Win/Loss</p>
              <p className="font-bold text-gray-900">{stats.positiveEntries}/{stats.negativeEntries}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-gray-600 font-bold text-xs">Avg</span>
              </div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="font-bold text-gray-900">{formatCurrency(stats.averageAmount)}</p>
            </div>
          </div>

          {/* Top Symbols */}
          {stats.topSymbols.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Top Symbols</h4>
              <div className="space-y-2">
                {stats.topSymbols.slice(0, 5).map((symbol, index) => (
                  <div key={symbol.symbol} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 font-mono text-sm w-4">{index + 1}.</span>
                      <span className="font-bold text-gray-900">{symbol.symbol}</span>
                      <span className="text-gray-500 text-sm">({symbol.count} trades)</span>
                    </div>
                    <span className={`font-bold ${symbol.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(symbol.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Trades Preview */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Recent Trades ({trades.length} total)
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {trades.slice(-10).reverse().map((trade) => (
                <div key={trade.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  trade.amount >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      trade.amount >= 0 ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="font-medium text-gray-900">{trade.symbol}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`font-bold ${trade.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(trade.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                'Save to Database'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
