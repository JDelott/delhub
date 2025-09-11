import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TradeEntry {
  id: string;
  symbol: string;
  amount: number; // Dollar amount (profit/loss)
  timestamp: Date;
  notes?: string;
}

export interface TradeStats {
  totalTrades: number;
  totalAmount: number;
  averageAmount: number;
  positiveEntries: number;
  negativeEntries: number;
  topSymbols: Array<{ symbol: string; total: number; count: number }>;
}

interface TradeStore {
  trades: TradeEntry[];
  addTrade: (trade: Omit<TradeEntry, 'id' | 'timestamp'>) => string;
  deleteTrade: (id: string) => void;
  getTradeStats: () => TradeStats;
  getTradesBySymbol: (symbol: string) => TradeEntry[];
  clearAllTrades: () => void;
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: [],

      addTrade: (tradeData) => {
        const id = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTrade: TradeEntry = {
          ...tradeData,
          id,
          timestamp: new Date(),
        };

        set((state) => ({
          trades: [...state.trades, newTrade],
        }));

        return id;
      },

      deleteTrade: (id) => {
        set((state) => ({
          trades: state.trades.filter((trade) => trade.id !== id),
        }));
      },

      getTradeStats: () => {
        const trades = get().trades;
        
        const totalTrades = trades.length;
        const totalAmount = trades.reduce((sum, trade) => sum + trade.amount, 0);
        const averageAmount = totalTrades > 0 ? totalAmount / totalTrades : 0;
        
        const positiveEntries = trades.filter((trade) => trade.amount > 0).length;
        const negativeEntries = trades.filter((trade) => trade.amount < 0).length;
        
        // Calculate top symbols by total amount and count
        const symbolTotals = trades.reduce((acc, trade) => {
          if (!acc[trade.symbol]) {
            acc[trade.symbol] = { total: 0, count: 0 };
          }
          acc[trade.symbol].total += trade.amount;
          acc[trade.symbol].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);
        
        const topSymbols = Object.entries(symbolTotals)
          .map(([symbol, data]) => ({ symbol, total: data.total, count: data.count }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        return {
          totalTrades,
          totalAmount,
          averageAmount,
          positiveEntries,
          negativeEntries,
          topSymbols,
        };
      },

      getTradesBySymbol: (symbol) => {
        return get().trades.filter((trade) => trade.symbol.toLowerCase() === symbol.toLowerCase());
      },

      clearAllTrades: () => {
        set({ trades: [] });
      },
    }),
    {
      name: 'trade-counter', // localStorage key
      // Only persist trades, not functions
      partialize: (state) => ({ trades: state.trades }),
    }
  )
);
