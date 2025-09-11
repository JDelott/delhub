


import { useOptionsStore } from '@/store/optionsStore';

export const useOptionsChainState = () => {
  // Get all state and actions from the persistent store
  const store = useOptionsStore();

  return {
    // View states
    viewMode: store.viewMode,
    setViewMode: store.setViewMode,
    optionType: store.optionType,
    setOptionType: store.setOptionType,
    
    // Single stock states
    symbol: store.symbol,
    setSymbol: store.setSymbol,
    expirations: store.expirations,
    setExpirations: store.setExpirations,
    selectedExpiration: store.selectedExpiration,
    setSelectedExpiration: store.setSelectedExpiration,
    optionsData: store.optionsData,
    setOptionsData: store.setOptionsData,
    
    // Screener states
    screenerResults: store.screenerResults,
    setScreenerResults: store.setScreenerResults,
    customSymbols: store.customSymbols,
    setCustomSymbols: store.setCustomSymbols,
    expirationFilter: store.expirationFilter,
    setExpirationFilter: store.setExpirationFilter,
    priceFilter: store.priceFilter,
    setPriceFilter: store.setPriceFilter,
    maxStockPrice: store.maxStockPrice,
    setMaxStockPrice: store.setMaxStockPrice,
    minAverageVolume: store.minAverageVolume,
    setMinAverageVolume: store.setMinAverageVolume,
    
    // Common states
    selectedSpreads: store.selectedSpreads,
    setSelectedSpreads: store.setSelectedSpreads,
    minBid: store.minBid,
    setMinBid: store.setMinBid,
    strikeRange: store.strikeRange,
    setStrikeRange: store.setStrikeRange,
    loading: store.loading,
    setLoading: store.setLoading,
    error: store.error,
    setError: store.setError,
    sectorFilter: store.sectorFilter,
    setSectorFilter: store.setSectorFilter,
    
    // Trading states
    tradeModal: store.tradeModal,
    setTradeModal: store.setTradeModal,
    isExecutingTrade: store.isExecutingTrade,
    setIsExecutingTrade: store.setIsExecutingTrade,
    tradeSuccess: store.tradeSuccess,
    setTradeSuccess: store.setTradeSuccess,
    tradeError: store.tradeError,
    setTradeError: store.setTradeError,
    
    // Batch trading states
    selectedOptions: store.selectedOptions,
    setSelectedOptions: store.setSelectedOptions,
    batchModal: store.batchModal,
    setBatchModal: store.setBatchModal,
    isExecutingBatchTrade: store.isExecutingBatchTrade,
    setIsExecutingBatchTrade: store.setIsExecutingBatchTrade,
    batchTradeResults: store.batchTradeResults,
    setBatchTradeResults: store.setBatchTradeResults,
    
    // Utility actions
    clearScreenerResults: store.clearScreenerResults,
    resetFilters: store.resetFilters
  };
};
