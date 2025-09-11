'use client';

import React, { useState } from 'react';
import { useTradeStore } from '@/store/tradeStore';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function TradeDashboard() {
  const { trades, getTradeStats, clearAllTrades, deleteTrade } = useTradeStore();
  const stats = getTradeStats();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showTopSymbols, setShowTopSymbols] = useState(false);

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

  const handleDeleteTrade = (tradeId: string) => {
    if (deleteConfirmId === tradeId) {
      deleteTrade(tradeId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(tradeId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        if (deleteConfirmId === tradeId) {
          setDeleteConfirmId(null);
        }
      }, 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Stock Quantity Counter</h1>
        <div className="flex items-center space-x-3">
          {/* Top Symbols Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowTopSymbols(!showTopSymbols)}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              {showTopSymbols ? (
                <ChevronDownIcon className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 mr-1" />
              )}
              Top Symbols ({stats.topSymbols.length})
            </button>
            
            {showTopSymbols && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-3 space-y-0.5">
                  {stats.topSymbols.length === 0 ? (
                    <p className="text-gray-400 text-xs py-2">No entries</p>
                  ) : (
                    stats.topSymbols.slice(0, 5).map((symbolData, index) => (
                      <div key={symbolData.symbol} className="flex items-center justify-between py-1 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-gray-400 font-mono w-3">{index + 1}.</span>
                          <span className="font-bold text-gray-900">{symbolData.symbol}</span>
                          <span className="text-gray-400">({symbolData.count})</span>
                        </div>
                        <span className={`font-bold ${
                          symbolData.total >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(symbolData.total)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Clear All Trades Button */}
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
                <div className="flex items-center space-x-3">
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
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTrade(trade.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      deleteConfirmId === trade.id
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirmId === trade.id ? 'Click again to confirm delete' : 'Delete entry'}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
