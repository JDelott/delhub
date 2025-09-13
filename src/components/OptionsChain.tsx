'use client';

import { useCallback, useEffect } from 'react';
import OptionsTradeModal from './OptionsTradeModal';
import { usePortfolio } from '@/hooks/usePortfolio';
import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';

// Import refactored modules
import { OptionsChainProps } from './options-chain/types';
import { useOptionsChainState } from './options-chain/hooks/useOptionsChainState';
import { useOptionsData } from './options-chain/hooks/useOptionsData';
import { useOptionsBatchTrading } from './options-chain/hooks/useOptionsBatchTrading';
import { useOptionsTrading } from './options-chain/hooks/useOptionsTrading';
import { useOptionsExport } from './options-chain/hooks/useOptionsExport';

import OptionsChainHeader from './options-chain/components/OptionsChainHeader';
import ScreenerControls from './options-chain/components/ScreenerControls';
import SingleStockControls from './options-chain/components/SingleStockControls';
import ScreenerResults from './options-chain/components/ScreenerResults';
import SingleStockResults from './options-chain/components/SingleStockResults';
import BatchTradeModal from './options-chain/components/BatchTradeModal';
import LoadingState from './options-chain/components/LoadingState';
import EmptyState from './options-chain/components/EmptyState';
import ErrorDisplay from './options-chain/components/ErrorDisplay';
import SideNavigation from './SideNavigation';

export default function OptionsChain({ className = '' }: OptionsChainProps) {
  // Use custom hooks for state management
  const state = useOptionsChainState();
  const { refresh: refreshPortfolio } = usePortfolio();

  // Data fetching hooks
  const { fetchExpirations, fetchFilteredPuts, runScreener } = useOptionsData({
    setLoading: state.setLoading,
    setError: state.setError,
    setExpirations: state.setExpirations,
    setSelectedExpiration: state.setSelectedExpiration,
    setOptionsData: state.setOptionsData,
    setScreenerResults: state.setScreenerResults,
    setSelectedOptions: state.setSelectedOptions
  });

  // Batch trading hooks
  const batchTrading = useOptionsBatchTrading({
    batchModal: state.batchModal,
    setBatchModal: state.setBatchModal,
    selectedOptions: state.selectedOptions,
    setSelectedOptions: state.setSelectedOptions,
    screenerResults: state.screenerResults,
    optionType: state.optionType,
    setIsExecutingBatchTrade: state.setIsExecutingBatchTrade,
    setBatchTradeResults: state.setBatchTradeResults,
    refreshPortfolio
  });

  // Single options trading hooks
  const optionsTrading = useOptionsTrading({
    tradeModal: state.tradeModal,
    setTradeModal: state.setTradeModal,
    setIsExecutingTrade: state.setIsExecutingTrade,
    setTradeError: state.setTradeError,
    setTradeSuccess: state.setTradeSuccess,
    refreshPortfolio
  });

  // Export functionality hooks
  const { downloadPDFReport } = useOptionsExport({
    screenerResults: state.screenerResults,
    optionType: state.optionType,
    expirationFilter: state.expirationFilter
  });

  // Create wrapper functions to fix parameter order mismatches
  const handleOpenTradeModalForScreener = useCallback((
    symbol: string, 
    option: FilteredPutOption | FilteredCallOption, 
    optionType: 'put' | 'call', 
    stockPrice?: number
  ) => {
    // Call the original function with correct parameter order
    optionsTrading.openTradeModal(option, optionType, symbol, stockPrice || 0);
  }, [optionsTrading]);

  const handleOpenTradeModalForSingle = useCallback((
    option: FilteredPutOption | FilteredCallOption,
    optionType: 'put' | 'call',
    symbol: string,
    stockPrice: number
  ) => {
    // This one already has the correct parameter order
    optionsTrading.openTradeModal(option, optionType, symbol, stockPrice);
  }, [optionsTrading]);

  // Single stock form submission
  const handleSymbolSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchExpirations(state.symbol);
  }, [state.symbol, fetchExpirations]);

  // Auto-fetch puts when expiration changes in single stock mode
  useEffect(() => {
    if (state.viewMode === 'single' && state.selectedExpiration && state.symbol) {
      fetchFilteredPuts(state.symbol, state.selectedExpiration, state.selectedSpreads, state.minBid, state.strikeRange);
    }
  }, [state.viewMode, state.selectedExpiration, fetchFilteredPuts, state.symbol, state.selectedSpreads, state.minBid, state.strikeRange]);

  const handleRunScreener = useCallback(async (spreads?: number[]) => {
    // Use passed spreads or fall back to state spreads
    const spreadsToUse = spreads || state.selectedSpreads;
    console.log('OptionsChain handleRunScreener using spreads:', spreadsToUse);
    
    await runScreener(
      state.customSymbols,
      spreadsToUse,
      state.minBid,
      state.expirationFilter,
      state.priceFilter,
      state.maxStockPrice,
      state.minAverageVolume,
      state.optionType,
      state.sectorFilter,
      state.strikeRange
    );
  }, [
    runScreener,
    state.customSymbols,
    state.selectedSpreads,
    state.minBid,
    state.expirationFilter,
    state.priceFilter,
    state.maxStockPrice,
    state.minAverageVolume,
    state.optionType,
    state.sectorFilter,
    state.strikeRange
  ]);

  return (
    <div className={`flex min-h-screen bg-gray-50 ${className}`}>
      {/* Side Navigation */}
      <SideNavigation />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white text-gray-900">
        {/* Header */}
        <OptionsChainHeader
          optionType={state.optionType}
          setOptionType={state.setOptionType}
          selectedSpreadsCount={state.selectedSpreads.length}
          selectedOptionsCount={state.selectedOptions.size}
          viewMode={state.viewMode}
          setViewMode={state.setViewMode}
          onBatchTradeClick={batchTrading.openBatchTradeModal}
        />

      {/* Trade Success/Error Messages */}
      {(state.tradeSuccess || state.tradeError) && (
        <div className="mx-4 sm:mx-6 mt-4">
          {state.tradeSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{state.tradeSuccess}</p>
            </div>
          )}
          {state.tradeError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{state.tradeError}</p>
            </div>
          )}
        </div>
      )}

      {/* Controls Section */}
      <div className="px-4 sm:px-6 py-6 border-b border-gray-200 bg-white shadow-sm">
        {state.viewMode === 'screener' ? (
          <ScreenerControls
            customSymbols={state.customSymbols}
            setCustomSymbols={state.setCustomSymbols}
            expirationFilter={state.expirationFilter}
            setExpirationFilter={state.setExpirationFilter}
            priceFilter={state.priceFilter}
            setPriceFilter={state.setPriceFilter}
            sectorFilter={state.sectorFilter}
            setSectorFilter={state.setSectorFilter}
            maxStockPrice={state.maxStockPrice}
            setMaxStockPrice={state.setMaxStockPrice}
            minAverageVolume={state.minAverageVolume}
            setMinAverageVolume={state.setMinAverageVolume}
            selectedSpreads={state.selectedSpreads}
            setSelectedSpreads={state.setSelectedSpreads}
            minBid={state.minBid}
            setMinBid={state.setMinBid}
            strikeRange={state.strikeRange}
            setStrikeRange={state.setStrikeRange}
            loading={state.loading}
            onRunScreener={handleRunScreener}
            onClearFilters={() => {
              state.resetFilters();
              state.clearScreenerResults();
            }}
          />
        ) : (
          <SingleStockControls
            symbol={state.symbol}
            setSymbol={state.setSymbol}
            expirations={state.expirations}
            selectedExpiration={state.selectedExpiration}
            setSelectedExpiration={state.setSelectedExpiration}
            selectedSpreads={state.selectedSpreads}
            setSelectedSpreads={state.setSelectedSpreads}
            minBid={state.minBid}
            setMinBid={state.setMinBid}
            strikeRange={state.strikeRange}
            setStrikeRange={state.setStrikeRange}
            loading={state.loading}
            onSubmit={handleSymbolSubmit}
          />
        )}
      </div>

      {/* Error Display */}
      {state.error && <ErrorDisplay error={state.error} />}

      {/* Results */}
      <div className="flex-1 bg-gray-50">
        <div className="p-4 sm:p-6">
          {state.viewMode === 'screener' && state.screenerResults && (
            <ScreenerResults
              screenerResults={state.screenerResults}
              optionType={state.optionType}
              selectedOptions={state.selectedOptions}
              onToggleOptionSelection={batchTrading.toggleOptionSelection}
              onOpenTradeModal={handleOpenTradeModalForScreener}
              onDownloadPDF={downloadPDFReport}
            />
          )}

          {state.viewMode === 'single' && state.optionsData && (
            <SingleStockResults
              optionsData={state.optionsData}
              onOpenTradeModal={handleOpenTradeModalForSingle}
            />
          )}

          {/* Loading State */}
          {state.loading && (
            <LoadingState viewMode={state.viewMode} />
          )}

          {/* Empty State */}
          {!state.loading && !state.optionsData && !state.screenerResults && !state.error && (
            <EmptyState viewMode={state.viewMode} />
          )}
        </div>
      </div>

      {/* Options Trading Modal */}
      <OptionsTradeModal
        isOpen={state.tradeModal.isOpen}
        onClose={optionsTrading.closeTradeModal}
        option={state.tradeModal.option}
        optionType={state.tradeModal.optionType}
        symbol={state.tradeModal.symbol}
        stockPrice={state.tradeModal.stockPrice}
        onExecute={optionsTrading.executeOptionsTrade}
        isExecuting={state.isExecutingTrade}
      />

      {/* Batch Trade Modal */}
      <BatchTradeModal
        isOpen={state.batchModal.isOpen}
        items={state.batchModal.items}
        isExecuting={state.isExecutingBatchTrade}
        results={state.batchTradeResults}
        onClose={batchTrading.closeBatchTradeModal}
        onUpdateItem={batchTrading.updateBatchItem}
        onRemoveItem={batchTrading.removeBatchItem}
        onExecute={batchTrading.executeBatchTrades}
      />
      </div>
    </div>
  );
}
