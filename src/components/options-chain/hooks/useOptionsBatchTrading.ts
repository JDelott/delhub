


import { useCallback, useRef } from 'react';
import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';
import { 
  BatchTradeModalState, 
  BatchTradeItem, 
  ScreenerResults, 
  OptionType 
} from '../types';
import { generateOptionId } from '../utils';

interface UseOptionsBatchTradingProps {
  batchModal: BatchTradeModalState;
  setBatchModal: (modal: BatchTradeModalState | ((prev: BatchTradeModalState) => BatchTradeModalState)) => void;
  selectedOptions: Set<string>;
  setSelectedOptions: (options: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  screenerResults: ScreenerResults | null;
  optionType: OptionType; // Keep this even if unused to match interface
  setIsExecutingBatchTrade: (executing: boolean) => void;
  setBatchTradeResults: (results: { successful: number; failed: number; errors: string[] } | null) => void;
  refreshPortfolio: () => Promise<void>;
}

export const useOptionsBatchTrading = ({
  batchModal,
  setBatchModal,
  selectedOptions,
  setSelectedOptions,
  screenerResults,
  optionType, // Keep this to avoid interface mismatch
  setIsExecutingBatchTrade,
  setBatchTradeResults,
  refreshPortfolio
}: UseOptionsBatchTradingProps) => {
  
  // Use ref to track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleOptionSelection = useCallback((symbol: string, option: FilteredPutOption | FilteredCallOption, optionType: 'put' | 'call') => {
    const optionId = generateOptionId(symbol, option, optionType);
    
    setSelectedOptions((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  }, [setSelectedOptions]);

  const openBatchTradeModal = useCallback(() => {
    if (!screenerResults) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const items: BatchTradeItem[] = [];
    
    selectedOptions.forEach(optionId => {
      // Fix the parsing order: symbol_type_strike_expiration
      const [symbol, type, strike, expiration] = optionId.split('_');
      
      for (const result of screenerResults.results) {
        if (result.symbol === symbol) {
          const options = type === 'put' ? result.bestPutOptions : result.bestCallOptions;
          const option = options.find((opt: FilteredPutOption | FilteredCallOption) => 
            opt.strike.toString() === strike && opt.expirationDate === expiration
          );
          
          if (option) {
            items.push({
              id: optionId,
              symbol,
              option,
              optionType: type as 'put' | 'call',
              stockPrice: result.stockPrice || 0,
              action: 'sell', // Default to sell for scalping strategy
              contracts: 1,
              premium: Math.max(0.01, option.ask - 0.05) // 5 cents below ask
            });
          }
          break;
        }
      }
    });

    console.log('🔍 Debug batch modal:', {
      selectedOptionsCount: selectedOptions.size,
      selectedOptions: Array.from(selectedOptions),
      itemsCreated: items.length,
      items: items.map(item => ({ symbol: item.symbol, strike: item.option.strike, type: item.optionType }))
    });

    setBatchModal({
      isOpen: true,
      items
    });
  }, [screenerResults, selectedOptions, setBatchModal]);

  const closeBatchTradeModal = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setBatchModal({
      isOpen: false,
      items: []
    });
    
    // Clear results when closing modal
    setBatchTradeResults(null);
    setIsExecutingBatchTrade(false);
  }, [setBatchModal, setBatchTradeResults, setIsExecutingBatchTrade]);

  const updateBatchItem = useCallback((itemId: string, updates: Partial<BatchTradeItem>) => {
    setBatchModal((prev: BatchTradeModalState) => ({
      ...prev,
      items: prev.items.map((item: BatchTradeItem) => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  }, [setBatchModal]);

  const removeBatchItem = useCallback((itemId: string) => {
    setBatchModal((prev: BatchTradeModalState) => ({
      ...prev,
      items: prev.items.filter((item: BatchTradeItem) => item.id !== itemId)
    }));
  }, [setBatchModal]);

  const executeBatchTrades = useCallback(async () => {
    if (!batchModal.items.length) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsExecutingBatchTrade(true);
    setBatchTradeResults(null); // Clear previous results

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Store current state to avoid stale closures
    const currentItems = [...batchModal.items];
    const allSells = currentItems.every(item => item.action === 'sell');
    const allBuys = currentItems.every(item => item.action === 'buy');

    for (const item of currentItems) {
      try {
        const requestBody = {
          action: item.action,
          symbol: item.symbol,
          optionSymbol: `${item.symbol}_${item.option.expirationDate}_${item.optionType.toUpperCase()}_${item.option.strike}`,
          optionType: item.optionType,
          strike: item.option.strike,
          expiration: item.option.expirationDate,
          contracts: item.contracts,
          premium: item.premium
        };

        const response = await fetch('/api/options/trade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`${item.symbol}: ${result.error || 'Unknown error'}`);
        }

        // Small delay between trades to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.failed++;
        results.errors.push(`${item.symbol}: ${error instanceof Error ? error.message : 'Network error'}`);
      }
    }

    setBatchTradeResults(results);
    setIsExecutingBatchTrade(false);

    try {
      // Refresh portfolio data
      await refreshPortfolio();
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    }

    if (results.failed === 0) {
      setSelectedOptions(new Set());
      
      if (allSells) {
        // After successful sells, automatically set up buy-backs
        const buyBackItems = currentItems.map(item => ({
          ...item,
          action: 'buy' as const,
          premium: Math.max(0.01, item.premium - 0.05) // 5 cents lower for buy-back
        }));
        
        setBatchModal(prev => ({
          ...prev,
          items: buyBackItems
        }));
        
        setBatchTradeResults(null); // Clear results to show the new buy-back setup
        
      } else if (allBuys) {
        // After successful buy-backs, show completion and close after delay
        timeoutRef.current = setTimeout(() => {
          closeBatchTradeModal();
        }, 3000);
      }
    }
    // If there were failures, don't auto-transition
  }, [
    batchModal.items,
    setIsExecutingBatchTrade,
    setBatchTradeResults,
    refreshPortfolio,
    setSelectedOptions,
    setBatchModal,
    closeBatchTradeModal
  ]);

  return {
    toggleOptionSelection,
    openBatchTradeModal,
    closeBatchTradeModal,
    updateBatchItem,
    removeBatchItem,
    executeBatchTrades
  };
};
