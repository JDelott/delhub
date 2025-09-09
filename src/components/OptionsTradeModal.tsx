


'use client';

import { useState, useCallback, useEffect } from 'react';
import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';

interface OptionsTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: FilteredPutOption | FilteredCallOption | null;
  optionType: 'put' | 'call';
  symbol: string;
  stockPrice: number;
  onExecute: (tradeData: OptionsTradeData) => Promise<void>;
  isExecuting: boolean;
}

export interface OptionsTradeData {
  action: 'buy' | 'sell';
  contracts: number;
  premium: number;
  orderType: 'MARKET' | 'LIMIT';
}

export default function OptionsTradeModal({
  isOpen,
  onClose,
  option,
  optionType,
  symbol,
  stockPrice,
  onExecute,
  isExecuting
}: OptionsTradeModalProps) {
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [contracts, setContracts] = useState(1);
  const [premium, setPremium] = useState(0);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('LIMIT');

  // Update premium when option changes - Fixed useEffect hook
  useEffect(() => {
    if (option) {
      setPremium(orderType === 'MARKET' ? (option.bid + option.ask) / 2 : option.bid);
    }
  }, [option, orderType]);

  const handleExecute = useCallback(async () => {
    if (!option) return;
    
    await onExecute({
      action,
      contracts,
      premium,
      orderType
    });
  }, [action, contracts, premium, orderType, option, onExecute]);

  if (!isOpen || !option) return null;

  const totalCost = contracts * premium * 100;
  const breakEven = optionType === 'put' 
    ? option.strike - premium 
    : option.strike + premium;
  
  const maxProfit = optionType === 'put'
    ? (option.strike - premium) * contracts * 100
    : 'Unlimited';
  
  const maxLoss = contracts * premium * 100;

  const formatCurrency = (value: number | string) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              Trade {optionType.toUpperCase()} Option
            </h2>
            <p className="text-sm text-slate-400">
              {symbol} ${option.strike} {formatDate(option.expirationDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Option Details */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Strike Price:</span>
              <div className="font-medium text-slate-100">{formatCurrency(option.strike)}</div>
            </div>
            <div>
              <span className="text-slate-400">Stock Price:</span>
              <div className="font-medium text-slate-100">{formatCurrency(stockPrice)}</div>
            </div>
            <div>
              <span className="text-slate-400">Bid:</span>
              <div className="text-green-400 font-medium">{formatCurrency(option.bid)}</div>
            </div>
            <div>
              <span className="text-slate-400">Ask:</span>
              <div className="text-red-400 font-medium">{formatCurrency(option.ask)}</div>
            </div>
            <div>
              <span className="text-slate-400">Volume:</span>
              <div className="font-medium text-slate-100">{option.volume.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-slate-400">Open Interest:</span>
              <div className="font-medium text-slate-100">{option.openInterest?.toLocaleString() || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Trade Configuration */}
        <div className="space-y-4 mb-6">
          {/* Buy/Sell Toggle */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Action</label>
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setAction('buy')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  action === 'buy'
                    ? 'bg-green-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Buy to Open
              </button>
              <button
                onClick={() => setAction('sell')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  action === 'sell'
                    ? 'bg-red-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sell to Open
              </button>
            </div>
          </div>

          {/* Number of Contracts */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Contracts</label>
            <input
              type="number"
              min="1"
              value={contracts}
              onChange={(e) => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
            />
          </div>

          {/* Order Type */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => {
                const newOrderType = e.target.value as 'MARKET' | 'LIMIT';
                setOrderType(newOrderType);
                setPremium(newOrderType === 'MARKET' ? (option.bid + option.ask) / 2 : option.bid);
              }}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
            >
              <option value="LIMIT">Limit Order</option>
              <option value="MARKET">Market Order</option>
            </select>
          </div>

          {/* Premium */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Premium per Contract ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={premium}
              onChange={(e) => setPremium(parseFloat(e.target.value) || 0)}
              disabled={orderType === 'MARKET'}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none disabled:opacity-50"
            />
            {orderType === 'MARKET' && (
              <p className="text-xs text-slate-500 mt-1">Market orders use mid-price</p>
            )}
          </div>
        </div>

        {/* Trade Summary */}
        <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Trade Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Cost:</span>
              <span className="font-medium text-slate-100">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Break Even:</span>
              <span className="font-medium text-slate-100">{formatCurrency(breakEven)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max Profit:</span>
              <span className="font-medium text-green-400">
                {typeof maxProfit === 'number' ? formatCurrency(maxProfit) : maxProfit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max Loss:</span>
              <span className="font-medium text-red-400">{formatCurrency(maxLoss)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors font-medium border border-slate-600/50"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || contracts <= 0 || premium <= 0}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium border disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'buy'
                ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-500/30'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30'
            }`}
          >
            {isExecuting ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Executing...
              </div>
            ) : (
              `${action === 'buy' ? 'Buy' : 'Sell'} ${contracts} Contract${contracts > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
