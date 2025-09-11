'use client';

import React, { useState } from 'react';
import { useTradeStore } from '@/store/tradeStore';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TradeDashboard() {
  const { trades, getTradeStats, clearAllTrades } = useTradeStore();
  const stats = getTradeStats();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };


  const getRecentTrades = () => {
    return trades
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const handleClearTrades = () => {
    if (showConfirmClear) {
      clearAllTrades();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Stock Quantity Counter</h1>
        <button
          onClick={handleClearTrades}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showConfirmClear
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {showConfirmClear ? 'Confirm Clear All' : 'Clear All Trades'}
        </button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-500" />
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-500">Total Entries</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalTrades}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              stats.totalAmount >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {stats.totalAmount >= 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className={`text-lg font-bold ${
                stats.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">Avg</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-500">Average</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.averageAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xs">+/-</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-500">Wins/Losses</p>
              <p className="text-lg font-bold text-gray-900">{stats.positiveEntries}/{stats.negativeEntries}</p>
            </div>
          </div>
        </div>

        {/* Total Gains Card */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-500">Total Gains</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(trades.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Total Losses Card */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-500">Total Losses</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(Math.abs(trades.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Symbols */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Symbols by Total Amount</h3>
        <div className="space-y-3">
          {stats.topSymbols.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No entries yet</p>
          ) : (
            stats.topSymbols.map((symbolData, index) => (
              <div key={symbolData.symbol} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-lg">{symbolData.symbol}</span>
                  <span className="text-sm text-gray-600">
                    {symbolData.count} entries
                  </span>
                </div>
                <span className={`font-bold text-lg ${
                  symbolData.total >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(symbolData.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No entries yet. Use the chatbot to start logging: "SRPT $2"
            </div>
          ) : (
            getRecentTrades().map((trade) => (
              <div key={trade.id} className={`flex justify-between items-center py-3 px-4 rounded-lg hover:opacity-90 transition-all ${
                trade.amount >= 0 
                  ? 'bg-green-50 border-l-4 border-green-400' 
                  : 'bg-red-50 border-l-4 border-red-400'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    trade.amount >= 0 ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="font-bold text-lg text-gray-900">{trade.symbol}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(trade.timestamp).toLocaleString([], { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {trade.notes && (
                    <span className="text-xs text-gray-400 max-w-xs truncate">
                      "{trade.notes}"
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {trade.amount >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold text-lg ${
                    trade.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(trade.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
