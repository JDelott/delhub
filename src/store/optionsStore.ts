import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ScreenerResults,
  OptionsData,
  TradeModalState,
  BatchTradeModalState,
  OptionType,
  ViewMode
} from '@/components/options-chain/types';

/**
 * Persistent Options Store
 * 
 * This store maintains the state of the options screener and single stock analysis.
 * Key features:
 * - Persists screener results, filter settings, and view preferences across navigation
 * - Non-persistent states: loading, errors, modal states, and trading execution states
 * - Uses localStorage with key 'options-screener' for persistence
 * - Automatically restores state when returning to the options screener page
 */

export interface OptionsScreenerState {
  // View and option type states
  viewMode: ViewMode;
  optionType: OptionType;
  
  // Single stock mode states
  symbol: string;
  expirations: string[];
  selectedExpiration: string;
  optionsData: OptionsData | null;
  
  // Screener mode states
  screenerResults: ScreenerResults | null;
  customSymbols: string;
  expirationFilter: 'all' | 'near' | 'far';
  priceFilter: 'all' | 'under50' | 'under25' | 'verified50';
  maxStockPrice: number;
  minAverageVolume: number;
  
  // Common states
  selectedSpreads: number[];
  minBid: number;
  strikeRange: 'tight' | 'moderate' | 'wide' | 'extended';
  sectorFilter: string;
  
  // Trading states (these don't need persistence)
  tradeModal: TradeModalState;
  isExecutingTrade: boolean;
  tradeSuccess: string | null;
  tradeError: string | null;
  
  // Batch trading states (these don't need persistence)
  selectedOptions: Set<string>;
  batchModal: BatchTradeModalState;
  isExecutingBatchTrade: boolean;
  batchTradeResults: {
    successful: number;
    failed: number;
    errors: string[];
  } | null;
  
  // Loading and error states (these don't need persistence)
  loading: boolean;
  error: string | null;
}

interface OptionsStore extends OptionsScreenerState {
  // Actions for view states
  setViewMode: (viewMode: ViewMode) => void;
  setOptionType: (optionType: OptionType) => void;
  
  // Actions for single stock states
  setSymbol: (symbol: string) => void;
  setExpirations: (expirations: string[]) => void;
  setSelectedExpiration: (selectedExpiration: string) => void;
  setOptionsData: (optionsData: OptionsData | null) => void;
  
  // Actions for screener states
  setScreenerResults: (screenerResults: ScreenerResults | null) => void;
  setCustomSymbols: (customSymbols: string) => void;
  setExpirationFilter: (expirationFilter: 'all' | 'near' | 'far') => void;
  setPriceFilter: (priceFilter: 'all' | 'under50' | 'under25' | 'verified50') => void;
  setMaxStockPrice: (maxStockPrice: number) => void;
  setMinAverageVolume: (minAverageVolume: number) => void;
  
  // Actions for common states
  setSelectedSpreads: (selectedSpreads: number[]) => void;
  setMinBid: (minBid: number) => void;
  setStrikeRange: (strikeRange: 'tight' | 'moderate' | 'wide' | 'extended') => void;
  setSectorFilter: (sectorFilter: string) => void;
  
  // Actions for trading states (non-persistent)
  setTradeModal: (tradeModal: TradeModalState) => void;
  setIsExecutingTrade: (isExecutingTrade: boolean) => void;
  setTradeSuccess: (tradeSuccess: string | null) => void;
  setTradeError: (tradeError: string | null) => void;
  
  // Actions for batch trading states (non-persistent)
  setSelectedOptions: (selectedOptions: Set<string>) => void;
  setBatchModal: (batchModal: BatchTradeModalState) => void;
  setIsExecutingBatchTrade: (isExecutingBatchTrade: boolean) => void;
  setBatchTradeResults: (batchTradeResults: {
    successful: number;
    failed: number;
    errors: string[];
  } | null) => void;
  
  // Actions for loading and error states (non-persistent)
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility actions
  clearScreenerResults: () => void;
  resetFilters: () => void;
}

export const useOptionsStore = create<OptionsStore>()(
  persist(
    (set) => ({
      // Initial state
      viewMode: 'screener',
      optionType: 'puts',
      
      // Single stock mode states
      symbol: '',
      expirations: [],
      selectedExpiration: '',
      optionsData: null,
      
      // Screener mode states
      screenerResults: null,
      customSymbols: '',
      expirationFilter: 'all',
      priceFilter: 'under50',
      maxStockPrice: 50,
      minAverageVolume: 1000000,
      
      // Common states
      selectedSpreads: [0.15],
      minBid: 0.05,
      strikeRange: 'moderate',
      sectorFilter: 'all',
      
      // Trading states (non-persistent defaults)
      tradeModal: {
        isOpen: false,
        option: null,
        optionType: 'put',
        symbol: '',
        stockPrice: 0
      },
      isExecutingTrade: false,
      tradeSuccess: null,
      tradeError: null,
      
      // Batch trading states (non-persistent defaults)
      selectedOptions: new Set(),
      batchModal: {
        isOpen: false,
        items: []
      },
      isExecutingBatchTrade: false,
      batchTradeResults: null,
      
      // Loading and error states (non-persistent defaults)
      loading: false,
      error: null,
      
      // Actions for view states
      setViewMode: (viewMode) => set({ viewMode }),
      setOptionType: (optionType) => set({ optionType }),
      
      // Actions for single stock states
      setSymbol: (symbol) => set({ symbol }),
      setExpirations: (expirations) => set({ expirations }),
      setSelectedExpiration: (selectedExpiration) => set({ selectedExpiration }),
      setOptionsData: (optionsData) => set({ optionsData }),
      
      // Actions for screener states
      setScreenerResults: (screenerResults) => set({ screenerResults }),
      setCustomSymbols: (customSymbols) => set({ customSymbols }),
      setExpirationFilter: (expirationFilter) => set({ expirationFilter }),
      setPriceFilter: (priceFilter) => set({ priceFilter }),
      setMaxStockPrice: (maxStockPrice) => set({ maxStockPrice }),
      setMinAverageVolume: (minAverageVolume) => set({ minAverageVolume }),
      
      // Actions for common states
      setSelectedSpreads: (selectedSpreads) => set({ selectedSpreads }),
      setMinBid: (minBid) => set({ minBid }),
      setStrikeRange: (strikeRange) => set({ strikeRange }),
      setSectorFilter: (sectorFilter) => set({ sectorFilter }),
      
      // Actions for trading states (non-persistent)
      setTradeModal: (tradeModal) => set({ tradeModal }),
      setIsExecutingTrade: (isExecutingTrade) => set({ isExecutingTrade }),
      setTradeSuccess: (tradeSuccess) => set({ tradeSuccess }),
      setTradeError: (tradeError) => set({ tradeError }),
      
      // Actions for batch trading states (non-persistent)
      setSelectedOptions: (selectedOptions) => set({ selectedOptions }),
      setBatchModal: (batchModal) => set({ batchModal }),
      setIsExecutingBatchTrade: (isExecutingBatchTrade) => set({ isExecutingBatchTrade }),
      setBatchTradeResults: (batchTradeResults) => set({ batchTradeResults }),
      
      // Actions for loading and error states (non-persistent)
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Utility actions
      clearScreenerResults: () => set({ screenerResults: null, selectedOptions: new Set() }),
      resetFilters: () => set({
        customSymbols: '',
        expirationFilter: 'all',
        priceFilter: 'under50',
        maxStockPrice: 50,
        minAverageVolume: 1000000,
        selectedSpreads: [0.15],
        minBid: 0.05,
        strikeRange: 'moderate',
        sectorFilter: 'all'
      }),
    }),
    {
      name: 'options-screener', // localStorage key
      // Only persist the states that should survive navigation
      partialize: (state) => ({
        viewMode: state.viewMode,
        optionType: state.optionType,
        
        // Single stock states
        symbol: state.symbol,
        expirations: state.expirations,
        selectedExpiration: state.selectedExpiration,
        optionsData: state.optionsData,
        
        // Screener states
        screenerResults: state.screenerResults,
        customSymbols: state.customSymbols,
        expirationFilter: state.expirationFilter,
        priceFilter: state.priceFilter,
        maxStockPrice: state.maxStockPrice,
        minAverageVolume: state.minAverageVolume,
        
        // Common states
        selectedSpreads: state.selectedSpreads,
        minBid: state.minBid,
        strikeRange: state.strikeRange,
        sectorFilter: state.sectorFilter,
      }),
    }
  )
);
