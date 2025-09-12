'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';

interface DailyTradeSummary {
  id: number;
  trade_date: string;
  total_trades: number;
  total_amount: number;
  average_amount: number;
  positive_entries: number;
  negative_entries: number;
  total_gains: number;
  total_losses: number;
  total_commissions: number;
  total_net_amount: number;
  average_net_amount: number;
  created_at: string;
  updated_at: string;
}

interface MonthlyPerformance {
  month: string;
  trading_days: number;
  total_trades: number;
  total_amount: number;
  avg_daily_amount: number;
  total_gains: number;
  total_losses: number;
  total_wins: number;
  total_losses_count: number;
}

interface TopSymbol {
  symbol: string;
  days_traded: number;
  total_trades: number;
  total_amount: number;
  avg_daily_amount: number;
}

interface OverviewData {
  totalDays: number;
  totalTrades: number;
  totalAmount: number;
  avgDailyAmount: number;
  totalGains: number;
  totalLosses: number;
  totalCommissions?: number;
  totalNetAmount?: number;
  avgDailyNetAmount?: number;
  winRate: number;
  bestDay: DailyTradeSummary;
  worstDay: DailyTradeSummary;
}

interface AnalyticsData {
  overview: OverviewData;
  recentSummaries: DailyTradeSummary[];
  monthlyPerformance: MonthlyPerformance[];
  topSymbols: TopSymbol[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('30d');
  const { downloadPDFReport, isExporting } = useAnalyticsExport(data);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (monthString: string) => {
    return new Date(monthString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics?type=overview');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
      
      setData(result.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-gray-500">Start logging daily trade summaries to see analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trading Analytics</h1>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          {data && (
            <button
              onClick={downloadPDFReport}
              disabled={isExporting}
              className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg transition-colors text-sm font-medium border border-slate-300"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-slate-600 border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Trading Days</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalTrades.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className={`h-8 w-8 ${data.overview.totalAmount >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Gross P&L</p>
              <p className={`text-2xl font-bold ${data.overview.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.overview.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className={`h-8 w-8 ${data.overview.totalNetAmount >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Net P&L</p>
              <p className={`text-2xl font-bold ${data.overview.totalNetAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(data.overview.totalNetAmount || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.winRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">Avg</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Daily Net P&L</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(data.overview.avgDailyNetAmount || data.overview.avgDailyAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Gains</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.overview.totalGains)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Losses</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(data.overview.totalLosses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">R:R</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Risk/Reward</p>
              <p className="text-xl font-bold text-gray-900">
                {data.overview.totalLosses > 0 ? (data.overview.totalGains / data.overview.totalLosses).toFixed(2) : '∞'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Analytics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 text-orange-500 mr-2" />
          Commission Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Total Commissions Paid</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.overview.totalCommissions || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Commission Impact</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency((data.overview.totalAmount || 0) - (data.overview.totalNetAmount || 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.overview.totalAmount !== 0 ? 
                `${(((data.overview.totalAmount || 0) - (data.overview.totalNetAmount || 0)) / Math.abs(data.overview.totalAmount || 1) * 100).toFixed(1)}% of gross P&L` : 
                '0% of gross P&L'
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Avg Commission per Trade</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.overview.totalTrades > 0 ? 
                formatCurrency((data.overview.totalCommissions || 0) / data.overview.totalTrades) : 
                formatCurrency(0)
              }
            </p>
          </div>
        </div>
      </div>

      {/* Best & Worst Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Best Trading Day
          </h3>
          {data.overview.bestDay && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-medium">{formatDate(data.overview.bestDay.trade_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">P&L</span>
                <span className="font-bold text-green-600">{formatCurrency(data.overview.bestDay.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Trades</span>
                <span className="font-medium">{data.overview.bestDay.total_trades}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            Worst Trading Day
          </h3>
          {data.overview.worstDay && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-medium">{formatDate(data.overview.worstDay.trade_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">P&L</span>
                <span className="font-bold text-red-600">{formatCurrency(data.overview.worstDay.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Trades</span>
                <span className="font-medium">{data.overview.worstDay.total_trades}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Symbols */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Symbols</h3>
        <div className="space-y-4">
          {data.topSymbols.slice(0, 10).map((symbol, index) => (
            <div key={symbol.symbol} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">{symbol.symbol}</span>
                  <p className="text-sm text-gray-500">{symbol.days_traded} days • {symbol.total_trades} trades</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-lg ${symbol.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(symbol.total_amount)}
                </span>
                <p className="text-sm text-gray-500">
                  Avg: {formatCurrency(symbol.avg_daily_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance</h3>
        <div className="space-y-4">
          {data.monthlyPerformance.slice(0, 6).map((month) => (
            <div key={month.month} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <span className="font-semibold text-gray-900">{formatMonth(month.month)}</span>
                <p className="text-sm text-gray-500">
                  {month.trading_days} days • {month.total_trades.toLocaleString()} trades
                </p>
              </div>
              <div className="text-right">
                <span className={`font-bold text-lg ${month.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(month.total_amount)}
                </span>
                <p className="text-sm text-gray-500">
                  Avg: {formatCurrency(month.avg_daily_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Daily Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Daily Performance</h3>
        <div className="space-y-3">
          {data.recentSummaries.slice(0, 15).map((day) => {
            const netAmount = day.total_net_amount ?? day.total_amount;
            const avgNetAmount = day.average_net_amount ?? day.average_amount;
            const commissions = day.total_commissions ?? 0;
            return (
              <div key={day.id} className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                netAmount >= 0 ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-red-50 border-l-4 border-red-400'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${netAmount >= 0 ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                  <div>
                    <span className="font-medium text-gray-900">{formatDate(day.trade_date)}</span>
                    <p className="text-sm text-gray-500">
                      {day.total_trades} trades • {formatCurrency(commissions)} commissions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end space-y-1">
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Gross: </span>
                      <span className={`text-sm font-medium ${day.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(day.total_amount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Net: </span>
                      <span className={`font-bold text-lg ${netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
