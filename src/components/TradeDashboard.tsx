'use client';

import React, { useState, useEffect } from 'react';
import { useTradeStore } from '@/store/tradeStore';
import { useTradesExport } from '@/hooks/useTradesExport';
import { useDailySummary } from '@/hooks/useDailySummary';
import DailySummaryPreview from '@/components/DailySummaryPreview';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, DocumentArrowDownIcon, ChevronLeftIcon, ChevronRightIcon as ChevronRightIconSolid, CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TradeDashboard() {
  const { trades, getTradeStats, clearAllTrades, deleteTrade, addTrade } = useTradeStore();
  const stats = getTradeStats();
  const { downloadPDFReport } = useTradesExport({ trades, stats });
  const { 
    logDailySummary, 
    isLogging, 
    lastLoggedDate
  } = useDailySummary();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showTopSymbols, setShowTopSymbols] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSymbol, setManualSymbol] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsHydrated(true);
  }, []);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };


  // Get all trades in chronological order (most recent first)
  const getSortedTrades = () => {
    return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Pagination logic
  const sortedTrades = getSortedTrades();
  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const currentTrades = sortedTrades.slice(startIndex, endIndex);

  // Reset to page 1 if current page is beyond available pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleClearTrades = () => {
    if (showConfirmClear) {
      clearAllTrades();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualSymbol.trim() || !manualAmount.trim()) return;
    
    const amount = parseFloat(manualAmount);
    if (isNaN(amount)) return;
    
    addTrade({
      symbol: manualSymbol.trim().toUpperCase(),
      amount: amount,
      notes: manualNotes.trim() || undefined
    });
    
    // Reset form
    setManualSymbol('');
    setManualAmount('');
    setManualNotes('');
    setShowManualEntry(false);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setDeleteConfirmId(null); // Clear any pending delete confirmations
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleLogDailySummary = () => {
    if (trades.length === 0) {
      setLogMessage('No trades to save');
      setTimeout(() => setLogMessage(null), 3000);
      return;
    }
    setShowSummaryPreview(true);
  };

  const handleConfirmSave = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tradesData = trades.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        amount: trade.amount,
        timestamp: typeof trade.timestamp === 'string' ? trade.timestamp : trade.timestamp.toISOString(),
        notes: trade.notes
      }));

      const result = await logDailySummary(tradesData, today);
      
      if (result.success) {
        setLogMessage(`✅ Saved ${result.data?.entriesCount} trades for ${today}`);
        setShowSummaryPreview(false);
      } else {
        setLogMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setLogMessage(`❌ Failed to save daily summary`);
    }
    
    setTimeout(() => setLogMessage(null), 5000);
  };


  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Trade Counter</h1>
          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              Top Symbols (0)
            </div>
            <div className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
              Clear All Trades
            </div>
          </div>
        </div>
        
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading skeleton for recent entries */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
          <div className="text-center py-8 text-gray-500">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trade Counter</h1>
        <div className="flex items-center space-x-3">
          {/* Manual Entry Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Entry
            </button>
            
            {showManualEntry && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <form onSubmit={handleManualEntry} className="p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 mb-3">Add Manual Entry</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={manualSymbol}
                      onChange={(e) => setManualSymbol(e.target.value)}
                      placeholder="e.g. AAPL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="e.g. 150.00 or -75.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      placeholder="e.g. Weekly calls"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowManualEntry(false)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Add Entry
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

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
          
          {/* Log Daily Summary Button */}
          <button
            onClick={handleLogDailySummary}
            disabled={isLogging || trades.length === 0}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              trades.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isLogging
                ? 'bg-blue-100 text-blue-600 cursor-wait'
                : lastLoggedDate === new Date().toISOString().split('T')[0]
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            }`}
            title={trades.length === 0 
              ? 'No trades to save' 
              : `Save ${trades.length} trades (${formatCurrency(stats.totalAmount)} total)`
            }
          >
            {isLogging ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : lastLoggedDate === new Date().toISOString().split('T')[0] ? (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Saved Today
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                Save Daily Summary ({trades.length})
              </>
            )}
          </button>
          
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

      {/* Log Message Display */}
      {logMessage && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          logMessage.startsWith('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {logMessage}
        </div>
      )}

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trade Entries</h3>
            {sortedTrades.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedTrades.length)} of {sortedTrades.length} trades
              </p>
            )}
          </div>
          {trades.length > 0 && (
            <button
              id="download-trades-pdf-button"
              onClick={downloadPDFReport}
              className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-300"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          )}
        </div>
        <div className="space-y-2">
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No entries yet. Use the chatbot to start logging trades.
            </div>
          ) : (
            currentTrades.map((trade) => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
                <ChevronRightIconSolid className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Summary Preview Modal */}
      {showSummaryPreview && (
        <DailySummaryPreview
          trades={trades}
          stats={stats}
          onSave={handleConfirmSave}
          onCancel={() => setShowSummaryPreview(false)}
          isLoading={isLogging}
        />
      )}
    </div>
  );
}
