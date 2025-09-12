import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TradeEntry {
  id: string;
  symbol: string;
  amount: number; // Dollar amount (profit/loss) - this is gross profit before commissions
  timestamp: Date;
  notes?: string;
  commissionRate?: number; // Commission per contract (e.g., 0.16)
  contractCount?: number; // Number of contracts (for calculating total commission)
}

export interface TradeStats {
  totalTrades: number;
  totalAmount: number; // Gross total (before commissions)
  totalNetAmount: number; // Net total (after commissions)
  totalCommissions: number; // Total commissions paid
  averageAmount: number;
  averageNetAmount: number;
  positiveEntries: number;
  negativeEntries: number;
  topSymbols: Array<{ symbol: string; total: number; netTotal: number; count: number; totalCommissions: number }>;
}

// Helper function to calculate commission for a trade
export const calculateCommission = (trade: TradeEntry): number => {
  const rate = trade.commissionRate ?? 0.16; // Default to $0.16 per contract
  const contracts = trade.contractCount ?? 2; // Default to 2 contracts
  return rate * contracts;
};

// Helper function to calculate net amount (after commission)
export const calculateNetAmount = (trade: TradeEntry): number => {
  return trade.amount - calculateCommission(trade);
};

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
        const totalCommissions = trades.reduce((sum, trade) => sum + calculateCommission(trade), 0);
        const totalNetAmount = trades.reduce((sum, trade) => sum + calculateNetAmount(trade), 0);
        
        const averageAmount = totalTrades > 0 ? totalAmount / totalTrades : 0;
        const averageNetAmount = totalTrades > 0 ? totalNetAmount / totalTrades : 0;
        
        const positiveEntries = trades.filter((trade) => calculateNetAmount(trade) > 0).length;
        const negativeEntries = trades.filter((trade) => calculateNetAmount(trade) < 0).length;
        
        // Calculate top symbols by total amount and count
        const symbolTotals = trades.reduce((acc, trade) => {
          if (!acc[trade.symbol]) {
            acc[trade.symbol] = { total: 0, netTotal: 0, count: 0, totalCommissions: 0 };
          }
          acc[trade.symbol].total += trade.amount;
          acc[trade.symbol].netTotal += calculateNetAmount(trade);
          acc[trade.symbol].totalCommissions += calculateCommission(trade);
          acc[trade.symbol].count += 1;
          return acc;
        }, {} as Record<string, { total: number; netTotal: number; count: number; totalCommissions: number }>);
        
        const topSymbols = Object.entries(symbolTotals)
          .map(([symbol, data]) => ({ 
            symbol, 
            total: data.total, 
            netTotal: data.netTotal,
            count: data.count,
            totalCommissions: data.totalCommissions
          }))
          .sort((a, b) => b.netTotal - a.netTotal)
          .slice(0, 10);

        return {
          totalTrades,
          totalAmount,
          totalNetAmount,
          totalCommissions,
          averageAmount,
          averageNetAmount,
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
