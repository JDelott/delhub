


import { useCallback } from 'react';
import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';
import { TradeModalState } from '../types';
import { OptionsTradeData } from '../../OptionsTradeModal';

interface UseOptionsTradingProps {
  tradeModal: TradeModalState;
  setTradeModal: (modal: TradeModalState) => void;
  setIsExecutingTrade: (executing: boolean) => void;
  setTradeError: (error: string | null) => void;
  setTradeSuccess: (success: string | null) => void;
  refreshPortfolio: () => Promise<void>;
}

export const useOptionsTrading = ({
  tradeModal,
  setTradeModal,
  setIsExecutingTrade,
  setTradeError,
  setTradeSuccess,
  refreshPortfolio
}: UseOptionsTradingProps) => {

  const openTradeModal = useCallback((
    option: FilteredPutOption | FilteredCallOption,
    optionType: 'put' | 'call',
    symbol: string,
    stockPrice: number
  ) => {
    setTradeModal({
      isOpen: true,
      option,
      optionType,
      symbol,
      stockPrice
    });
    setTradeError(null);
    setTradeSuccess(null);
  }, [setTradeModal, setTradeError, setTradeSuccess]);

  const closeTradeModal = useCallback(() => {
    setTradeModal({
      isOpen: false,
      option: null,
      optionType: 'put',
      symbol: '',
      stockPrice: 0
    });
    setTradeError(null);
    setTradeSuccess(null);
  }, [setTradeModal, setTradeError, setTradeSuccess]);

  const executeOptionsTrade = useCallback(async (tradeData: OptionsTradeData) => {
    if (!tradeModal.option || !tradeModal.symbol) return;

    setIsExecutingTrade(true);
    setTradeError(null);

    try {
      const optionSymbol = `${tradeModal.symbol}_${tradeModal.option.expirationDate.replace(/-/g, '')}_${tradeModal.optionType.toUpperCase()}_${tradeModal.option.strike}`;
      
      const requestBody = {
        action: tradeData.action,
        symbol: tradeModal.symbol,
        optionSymbol,
        optionType: tradeModal.optionType,
        strike: tradeModal.option.strike,
        expiration: tradeModal.option.expirationDate,
        contracts: tradeData.contracts,
        premium: tradeData.premium,
        orderType: tradeData.orderType
      };

      console.log('🚀 Executing options trade:', requestBody);

      const response = await fetch('/api/options/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Options trade failed');
      }

      setTradeSuccess(
        `${tradeData.action.toUpperCase()} ${tradeData.contracts} ${tradeModal.optionType} contract${tradeData.contracts > 1 ? 's' : ''} executed successfully!`
      );
      
      // Refresh portfolio data
      await refreshPortfolio();
      
      // Close modal after short delay
      setTimeout(() => {
        closeTradeModal();
      }, 2000);

    } catch (error) {
      console.error('Options trade execution error:', error);
      setTradeError(error instanceof Error ? error.message : 'Trade execution failed');
    } finally {
      setIsExecutingTrade(false);
    }
  }, [tradeModal, setIsExecutingTrade, setTradeError, setTradeSuccess, refreshPortfolio, closeTradeModal]);

  return {
    openTradeModal,
    closeTradeModal,
    executeOptionsTrade
  };
};
