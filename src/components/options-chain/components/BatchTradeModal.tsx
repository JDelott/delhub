'use client';

import { BatchTradeItem } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { useState } from 'react';

interface TieredPricingConfig {
  enabled: boolean;
  firstTarget: {
    price: number;
    percentage: number;
    profitPerShare: number;
  };
  secondTarget: {
    price: number;
    percentage: number;
    profitPerShare: number;
  };
  breakevenTarget: {
    price: number;
    percentage: number;
  };
}

interface BatchTradeModalProps {
  isOpen: boolean;
  items: BatchTradeItem[];
  isExecuting: boolean;
  results: { successful: number; failed: number; errors: string[] } | null;
  onClose: () => void;
  onUpdateItem: (itemId: string, updates: Partial<BatchTradeItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onExecute: () => void;
}

export default function BatchTradeModal({
  isOpen,
  items,
  isExecuting,
  results,
  onClose,
  onUpdateItem,
  onRemoveItem,
  onExecute
}: BatchTradeModalProps) {
  const [tieredPricing, setTieredPricing] = useState<TieredPricingConfig>({
    enabled: false,
    firstTarget: {
      price: 0,
      percentage: 50,
      profitPerShare: 0.05
    },
    secondTarget: {
      price: 0,
      percentage: 30,
      profitPerShare: 0.02
    },
    breakevenTarget: {
      price: 0,
      percentage: 20
    }
  });

  if (!isOpen) return null;

  // Strategy helper functions
  const getOptimalSellPrice = (item: BatchTradeItem) => {
    // Sell at 5 cents below ask (ask - 0.05)
    return Math.max(0.01, item.option.ask - 0.05);
  };

  const getOptimalBuyBackPrice = (sellPrice: number) => {
    // Buy back at 5 cents lower than sell price
    return Math.max(0.01, sellPrice - 0.05);
  };

  const applyScalpStrategy = (item: BatchTradeItem) => {
    const optimalSellPrice = getOptimalSellPrice(item);
    onUpdateItem(item.id, { 
      action: 'sell',
      premium: optimalSellPrice
    });
  };

  const applyBuyBackStrategy = (item: BatchTradeItem) => {
    const currentSellPrice = item.premium;
    const buyBackPrice = getOptimalBuyBackPrice(currentSellPrice);
    onUpdateItem(item.id, { 
      action: 'buy',
      premium: buyBackPrice
    });
  };

  const calculateProfitPotential = (item: BatchTradeItem) => {
    if (item.action === 'sell') {
      const sellPrice = item.premium;
      const buyBackPrice = getOptimalBuyBackPrice(sellPrice);
      return (sellPrice - buyBackPrice) * item.contracts * 100;
    }
    return 0;
  };

  // Tiered pricing calculations
  const calculateTieredPricingTargets = (item: BatchTradeItem) => {
    if (!tieredPricing.enabled) return null;
    
    // Use the ask price as the entry point (where you sell)
    const entryPrice = item.option.ask;
    // First target: 5 cents below ask
    const firstTargetPrice = entryPrice - 0.05;
    // Second target: 8 cents below ask (5 + 3)
    const secondTargetPrice = entryPrice - 0.08;
    // Breakeven: at the ask price (where you sold)
    const breakevenPrice = entryPrice;
    
    const totalContracts = item.contracts;
    const firstTargetContracts = Math.floor(totalContracts * (tieredPricing.firstTarget.percentage / 100));
    const secondTargetContracts = Math.floor(totalContracts * (tieredPricing.secondTarget.percentage / 100));
    const breakevenContracts = totalContracts - firstTargetContracts - secondTargetContracts;

    return {
      entryPrice,
      firstTarget: {
        price: firstTargetPrice,
        contracts: firstTargetContracts,
        profit: firstTargetContracts * 0.05 * 100 // 5 cents profit per share
      },
      secondTarget: {
        price: secondTargetPrice,
        contracts: secondTargetContracts,
        profit: secondTargetContracts * 0.02 * 100 // 2 cents profit per share
      },
      breakeven: {
        price: breakevenPrice,
        contracts: breakevenContracts,
        profit: 0
      },
      totalProfit: (firstTargetContracts * 0.05 * 100) + 
                   (secondTargetContracts * 0.02 * 100)
    };
  };

  const applyTieredPricingStrategy = () => {
    items.forEach(item => {
      const targets = calculateTieredPricingTargets(item);
      if (targets) {
        // Set the first target price as the initial sell price
        onUpdateItem(item.id, {
          action: 'sell',
          premium: targets.firstTarget.price
        });
      }
    });
  };

  const totalTieredProfitPotential = items.reduce((sum, item) => {
    const targets = calculateTieredPricingTargets(item);
    return sum + (targets?.totalProfit || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              Batch Options Trading - Advanced Strategy
            </h2>
            <p className="text-sm text-slate-400">
              {tieredPricing.enabled 
                ? "Tiered Pricing Strategy: Multiple profit targets with risk management" 
                : items.every(item => item.action === 'sell') 
                ? "Phase 1: Sell puts 5¢ below ask to collect premium" 
                : items.every(item => item.action === 'buy')
                ? "Phase 2: Buy back puts 5¢ lower to complete scalp"
                : "Mixed: Configure your scalping strategy"}
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

        {/* Tiered Pricing Strategy Configuration */}
        <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-slate-200">Tiered Pricing Strategy</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tieredPricing.enabled}
                  onChange={(e) => setTieredPricing(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300">Enable Tiered Pricing</span>
              </label>
            </div>
            {tieredPricing.enabled && (
              <button
                onClick={applyTieredPricingStrategy}
                className="px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/30 rounded-md text-xs font-medium transition-all duration-200"
                disabled={isExecuting}
              >
                Apply to All Positions
              </button>
            )}
          </div>

          {tieredPricing.enabled && (
            <div className="grid grid-cols-3 gap-4">
              {/* First Target */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-orange-400">First Target (50%)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-400">Profit per Share</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={tieredPricing.firstTarget.profitPerShare}
                      onChange={(e) => setTieredPricing(prev => ({
                        ...prev,
                        firstTarget: {
                          ...prev.firstTarget,
                          profitPerShare: parseFloat(e.target.value) || 0.05
                        }
                      }))}
                      className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-slate-100 text-xs"
                      disabled={isExecuting}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Target: +{formatCurrency(tieredPricing.firstTarget.profitPerShare)} per share
                  </div>
                </div>
              </div>

              {/* Second Target */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-400">Second Target (30%)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-400">Profit per Share</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={tieredPricing.secondTarget.profitPerShare}
                      onChange={(e) => setTieredPricing(prev => ({
                        ...prev,
                        secondTarget: {
                          ...prev.secondTarget,
                          profitPerShare: parseFloat(e.target.value) || 0.02
                        }
                      }))}
                      className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-slate-100 text-xs"
                      disabled={isExecuting}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Target: +{formatCurrency(tieredPricing.secondTarget.profitPerShare)} per share
                  </div>
                </div>
              </div>

              {/* Breakeven Target */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-400">Breakeven Exit (20%)</h4>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">
                    Exit remaining position at breakeven to cut losses
                  </div>
                  <div className="text-xs text-slate-500">
                    Target: $0.00 profit (breakeven)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tiered Pricing Summary */}
          {tieredPricing.enabled && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Total Tiered Profit Potential:</span>
                <span className="text-lg font-bold text-violet-400">
                  {formatCurrency(totalTieredProfitPotential)}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Based on {items.length} positions with tiered exit strategy
              </div>
            </div>
          )}
        </div>

        {/* Strategy Quick Actions */}
        {items.length > 0 && !tieredPricing.enabled && (
          <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">
                <strong>Quick Strategy Setup:</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => items.forEach(item => applyScalpStrategy(item))}
                  className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-md text-xs font-medium transition-all duration-200"
                  disabled={isExecuting}
                >
                  Setup All Sells (5¢ below ask)
                </button>
                <button
                  onClick={() => items.forEach(item => applyBuyBackStrategy(item))}
                  className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-md text-xs font-medium transition-all duration-200"
                  disabled={isExecuting}
                >
                  Setup All Buy-Backs (5¢ lower)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Results Display */}
        {results && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <h3 className="text-lg font-medium text-slate-200 mb-3">Batch Execution Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {results.successful}
                </div>
                <div className="text-sm text-slate-400">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {results.failed}
                </div>
                <div className="text-sm text-slate-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {results.successful + results.failed}
                </div>
                <div className="text-sm text-slate-400">Total</div>
              </div>
            </div>
            
            {results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-400 mb-2">Errors:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.errors.map((error, idx) => (
                    <div key={idx} className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Batch Items Table */}
        {items.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/50">
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-left py-2">Strike & Type</th>
                    <th className="text-left py-2">Bid-Ask Spread</th>
                    <th className="text-left py-2">Action</th>
                    <th className="text-left py-2">Contracts</th>
                    <th className="text-left py-2">Premium</th>
                    <th className="text-left py-2">Profit Potential</th>
                    <th className="text-left py-2">Total</th>
                    {tieredPricing.enabled && <th className="text-left py-2">Tiered Targets</th>}
                    <th className="text-center py-2">Strategy</th>
                    <th className="text-center py-2">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const profitPotential = calculateProfitPotential(item);
                    const optimalSellPrice = getOptimalSellPrice(item);
                    const buyBackPrice = getOptimalBuyBackPrice(item.premium);
                    const tieredTargets = calculateTieredPricingTargets(item);
                    
                    return (
                      <tr key={item.id} className="border-b border-slate-800/30 last:border-b-0">
                        <td className="py-2 text-slate-100 font-medium">
                          {item.symbol}
                        </td>
                        <td className="py-2 text-slate-300">
                          <div>{formatCurrency(item.option.strike)} {item.optionType.toUpperCase()}</div>
                          <div className="text-xs text-slate-500">{formatDate(item.option.expirationDate)}</div>
                        </td>
                        <td className="py-2 text-slate-300">
                          <div className="text-xs">
                            <span className="text-green-400">{formatCurrency(item.option.bid)}</span>
                            <span className="text-slate-500"> - </span>
                            <span className="text-red-400">{formatCurrency(item.option.ask)}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Spread: {formatCurrency(item.option.bidAskSpread)}
                          </div>
                        </td>
                        <td className="py-2">
                          <select
                            value={item.action}
                            onChange={(e) => onUpdateItem(item.id, { action: e.target.value as 'buy' | 'sell' })}
                            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-slate-100 text-xs"
                            disabled={isExecuting}
                          >
                            <option value="sell">SELL</option>
                            <option value="buy">BUY</option>
                          </select>
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.contracts}
                            onChange={(e) => onUpdateItem(item.id, { contracts: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-16 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-slate-100 text-xs"
                            disabled={isExecuting}
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.premium}
                            onChange={(e) => onUpdateItem(item.id, { premium: parseFloat(e.target.value) || 0.01 })}
                            className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-slate-100 text-xs"
                            disabled={isExecuting}
                          />
                          {item.action === 'sell' && !tieredPricing.enabled && (
                            <div className="text-xs text-slate-500 mt-1">
                              Optimal: {formatCurrency(optimalSellPrice)}
                            </div>
                          )}
                        </td>
                        <td className="py-2">
                          {tieredPricing.enabled && tieredTargets ? (
                            <div className="text-violet-400 font-medium">
                              {formatCurrency(tieredTargets.totalProfit)}
                            </div>
                          ) : item.action === 'sell' && profitPotential > 0 ? (
                            <div className="text-green-400 font-medium">
                              {formatCurrency(profitPotential)}
                            </div>
                          ) : null}
                          {item.action === 'sell' && !tieredPricing.enabled && (
                            <div className="text-xs text-slate-500">
                              Buy back @ {formatCurrency(buyBackPrice)}
                            </div>
                          )}
                        </td>
                        <td className="py-2 text-slate-300 font-medium">
                          <div className={item.action === 'buy' ? 'text-red-400' : 'text-green-400'}>
                            {item.action === 'buy' ? '-' : '+'}{formatCurrency(item.contracts * item.premium * 100)}
                          </div>
                        </td>
                        {tieredPricing.enabled && (
                          <td className="py-2">
                            {tieredTargets && (
                              <div className="text-xs space-y-1">
                                <div className="text-orange-400">
                                  T1: {formatCurrency(tieredTargets.firstTarget.price)} ({tieredTargets.firstTarget.contracts})
                                </div>
                                <div className="text-green-400">
                                  T2: {formatCurrency(tieredTargets.secondTarget.price)} ({tieredTargets.secondTarget.contracts})
                                </div>
                                <div className="text-blue-400">
                                  BE: {formatCurrency(tieredTargets.breakeven.price)} ({tieredTargets.breakeven.contracts})
                                </div>
                              </div>
                            )}
                          </td>
                        )}
                        <td className="py-2 text-center">
                          <div className="flex gap-1">
                            {!tieredPricing.enabled ? (
                              <>
                                <button
                                  onClick={() => applyScalpStrategy(item)}
                                  className="px-2 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded text-xs"
                                  disabled={isExecuting}
                                  title="Set optimal sell price"
                                >
                                  Sell
                                </button>
                                <button
                                  onClick={() => applyBuyBackStrategy(item)}
                                  className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs"
                                  disabled={isExecuting}
                                  title="Set buy-back price"
                                >
                                  Buy
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  const targets = calculateTieredPricingTargets(item);
                                  if (targets) {
                                    onUpdateItem(item.id, {
                                      action: 'sell',
                                      premium: targets.firstTarget.price
                                    });
                                  }
                                }}
                                className="px-2 py-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded text-xs"
                                disabled={isExecuting}
                                title="Set tiered pricing targets"
                              >
                                Tier
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            disabled={isExecuting}
                            title="Remove from batch"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Enhanced Batch Summary */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                {tieredPricing.enabled ? 'Tiered Pricing Strategy Summary' : 'Scalping Strategy Summary'}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">
                    {items.length}
                  </div>
                  <div className="text-xs text-slate-400">Total Positions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">
                    {items.filter(item => item.action === 'sell').length}
                  </div>
                  <div className="text-xs text-slate-400">Sell Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {items.filter(item => item.action === 'buy').length}
                  </div>
                  <div className="text-xs text-slate-400">Buy-Back Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-violet-400">
                    {formatCurrency(
                      tieredPricing.enabled 
                        ? totalTieredProfitPotential
                        : items.filter(item => item.action === 'sell')
                            .reduce((sum, item) => sum + calculateProfitPotential(item), 0)
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {tieredPricing.enabled ? 'Tiered Profit Potential' : 'Total Profit Potential'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Premium Collected (Sells):</span>
                    <span className="font-bold text-green-400">
                      {formatCurrency(
                        items
                          .filter(item => item.action === 'sell')
                          .reduce((sum, item) => sum + (item.contracts * item.premium * 100), 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Buy-Back Cost:</span>
                    <span className="font-bold text-red-400">
                      {formatCurrency(
                        items
                          .filter(item => item.action === 'buy')
                          .reduce((sum, item) => sum + (item.contracts * item.premium * 100), 0)
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                  <span className="text-slate-300 font-medium">Net Position:</span>
                  <span className="font-bold text-slate-100">
                    {formatCurrency(
                      items.reduce((sum, item) => {
                        const cost = item.contracts * item.premium * 100;
                        return sum + (item.action === 'sell' ? cost : -cost);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors font-medium border border-slate-600/50"
                disabled={isExecuting}
              >
                Cancel
              </button>
              <button
                onClick={onExecute}
                disabled={isExecuting || items.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg transition-colors font-medium border border-violet-500/50 disabled:border-slate-600/50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {tieredPricing.enabled 
                      ? "Executing Tiered Strategy..." 
                      : items.every(item => item.action === 'sell') 
                      ? "Executing Sell Orders..." 
                      : "Executing Buy-Back Orders..."}
                  </div>
                ) : (
                  tieredPricing.enabled 
                    ? `Execute Tiered Strategy (${items.length} positions)`
                    : items.every(item => item.action === 'sell') 
                    ? `Sell ${items.length} Put Options (Phase 1)`
                    : items.every(item => item.action === 'buy')
                    ? `Buy Back ${items.length} Put Options (Phase 2)`
                    : `Execute ${items.length} Scalp Trades`
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Trades Selected</h3>
            <p className="text-slate-500">
              Select options from the screener results to set up your trading strategy.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
