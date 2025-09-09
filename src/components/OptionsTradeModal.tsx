


'use client';

import { useState, useCallback, useEffect } from 'react';
import { FilteredPutOption, FilteredCallOption } from '../lib/tradier-service';
import { calculateSmartPricing } from '../utils/smartPricing';

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

  // Initialize action and premium when option changes
  useEffect(() => {
    if (option) {
      // Default to 'sell' for puts, 'buy' for calls
      const defaultAction = optionType === 'put' ? 'sell' : 'buy';
      setAction(defaultAction);
      
      // Calculate smart pricing
      if (orderType === 'LIMIT') {
        const smartPricing = calculateSmartPricing(option, defaultAction);
        setPremium(smartPricing.price);
      } else {
        // Market order uses mid-price
        setPremium((option.bid + option.ask) / 2);
      }
    }
  }, [option, optionType, orderType]);

  // Update premium when action or order type changes
  useEffect(() => {
    if (option && action) {
      if (orderType === 'LIMIT') {
        const smartPricing = calculateSmartPricing(option, action);
        setPremium(smartPricing.price);
      } else {
        setPremium((option.bid + option.ask) / 2);
      }
    }
  }, [action, orderType, option]);

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
      <div className="bg-white border border-gray-300 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Trade {optionType.toUpperCase()} Option
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {symbol} ${option.strike} {formatDate(option.expirationDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Option Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Strike Price:</span>
              <div className="font-semibold text-gray-900">{formatCurrency(option.strike)}</div>
            </div>
            <div>
              <span className="text-gray-600">Stock Price:</span>
              <div className="font-semibold text-gray-900">{formatCurrency(stockPrice)}</div>
            </div>
            <div>
              <span className="text-gray-600">Bid:</span>
              <div className="text-green-600 font-semibold">{formatCurrency(option.bid)}</div>
            </div>
            <div>
              <span className="text-gray-600">Ask:</span>
              <div className="text-red-600 font-semibold">{formatCurrency(option.ask)}</div>
            </div>
            <div>
              <span className="text-gray-600">Spread:</span>
              <div className="font-semibold text-gray-900">
                {formatCurrency(option.bidAskSpread)} 
                <span className="text-xs text-gray-500 ml-1">
                  ({option.bidAskSpread >= 0.14 ? '15¢' : '10¢'} spread)
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Volume:</span>
              <div className="font-semibold text-gray-900">{option.volume.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Open Interest:</span>
              <div className="font-semibold text-gray-900">{option.openInterest?.toLocaleString() || 'N/A'}</div>
            </div>
            {orderType === 'LIMIT' && (
              <div>
                <span className="text-gray-600">Smart Pricing:</span>
                <div className="font-semibold text-blue-600">
                  Target {formatCurrency(calculateSmartPricing(option, action).expectedProfit)} profit
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trade Configuration */}
        <div className="space-y-4 mb-6">
          {/* Buy/Sell Toggle */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Action</label>
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setAction('buy')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                  action === 'buy'
                    ? 'bg-white text-green-700 shadow-sm border border-green-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Buy to Open
              </button>
              <button
                onClick={() => setAction('sell')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                  action === 'sell'
                    ? 'bg-white text-red-700 shadow-sm border border-red-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Sell to Open
              </button>
            </div>
          </div>

          {/* Number of Contracts */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Contracts</label>
            <input
              type="number"
              min="1"
              value={contracts}
              onChange={(e) => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Order Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => {
                const newOrderType = e.target.value as 'MARKET' | 'LIMIT';
                setOrderType(newOrderType);
                // Premium will be updated by the useEffect hook
              }}
              className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            >
              <option value="LIMIT">Limit Order</option>
              <option value="MARKET">Market Order</option>
            </select>
          </div>

          {/* Premium */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Premium per Contract ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={premium}
              onChange={(e) => setPremium(parseFloat(e.target.value) || 0)}
              disabled={orderType === 'MARKET'}
              className="w-full h-11 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-100"
            />
            {orderType === 'MARKET' && (
              <p className="text-xs text-gray-600 mt-1">Market orders use mid-price</p>
            )}
            {orderType === 'LIMIT' && option && (
              <p className="text-xs text-gray-600 mt-1">
                Smart pricing: {action === 'sell' ? 
                  `${option.bidAskSpread >= 0.14 ? '5¢' : '3¢'} below ask` : 
                  `${option.bidAskSpread >= 0.14 ? '5¢' : '3¢'} above bid`
                } for {option.bidAskSpread >= 0.14 ? '15¢' : '10¢'} spread
              </p>
            )}
          </div>
        </div>

        {/* Trade Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Trade Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Break Even:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(breakEven)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Profit:</span>
              <span className="font-semibold text-green-600">
                {typeof maxProfit === 'number' ? formatCurrency(maxProfit) : maxProfit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Loss:</span>
              <span className="font-semibold text-red-600">{formatCurrency(maxLoss)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || contracts <= 0 || premium <= 0}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors font-semibold border disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md ${
              action === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
            }`}
          >
            {isExecuting ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
