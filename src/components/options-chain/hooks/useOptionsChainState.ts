


import { useState } from 'react';
import {
  OptionsData,
  ScreenerResults,
  TradeModalState,
  BatchTradeModalState,
  OptionType,
  ViewMode
} from '../types';

export const useOptionsChainState = () => {
  // View and option type states
  const [viewMode, setViewMode] = useState<ViewMode>('screener');
  const [optionType, setOptionType] = useState<OptionType>('puts');
  
  // Single stock mode states
  const [symbol, setSymbol] = useState('');
  const [expirations, setExpirations] = useState<string[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState('');
  const [optionsData, setOptionsData] = useState<OptionsData | null>(null);
  
  // Screener mode states
  const [screenerResults, setScreenerResults] = useState<ScreenerResults | null>(null);
  const [customSymbols, setCustomSymbols] = useState('');
  const [expirationFilter, setExpirationFilter] = useState<'all' | 'near' | 'far'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under50' | 'under25' | 'verified50'>('under50');
  const [maxStockPrice, setMaxStockPrice] = useState<number>(50);
  const [minAverageVolume, setMinAverageVolume] = useState<number>(1000000);
  
  // Common states
  const [selectedSpreads, setSelectedSpreads] = useState<number[]>([0.15]); // Changed to array with default
  const [minBid, setMinBid] = useState(0.05);
  const [strikeRange, setStrikeRange] = useState<'tight' | 'moderate' | 'wide' | 'extended'>('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  
  // Trading states
  const [tradeModal, setTradeModal] = useState<TradeModalState>({
    isOpen: false,
    option: null,
    optionType: 'put',
    symbol: '',
    stockPrice: 0
  });
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);

  // Batch trading states
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [batchModal, setBatchModal] = useState<BatchTradeModalState>({
    isOpen: false,
    items: []
  });
  const [isExecutingBatchTrade, setIsExecutingBatchTrade] = useState(false);
  const [batchTradeResults, setBatchTradeResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  return {
    // View states
    viewMode, setViewMode,
    optionType, setOptionType,
    
    // Single stock states
    symbol, setSymbol,
    expirations, setExpirations,
    selectedExpiration, setSelectedExpiration,
    optionsData, setOptionsData,
    
    // Screener states
    screenerResults, setScreenerResults,
    customSymbols, setCustomSymbols,
    expirationFilter, setExpirationFilter,
    priceFilter, setPriceFilter,
    maxStockPrice, setMaxStockPrice,
    minAverageVolume, setMinAverageVolume,
    
    // Common states
    selectedSpreads, setSelectedSpreads, // Changed from exactSpread
    minBid, setMinBid,
    strikeRange, setStrikeRange,
    loading, setLoading,
    error, setError,
    sectorFilter, setSectorFilter,
    
    // Trading states
    tradeModal, setTradeModal,
    isExecutingTrade, setIsExecutingTrade,
    tradeSuccess, setTradeSuccess,
    tradeError, setTradeError,
    
    // Batch trading states
    selectedOptions, setSelectedOptions,
    batchModal, setBatchModal,
    isExecutingBatchTrade, setIsExecutingBatchTrade,
    batchTradeResults, setBatchTradeResults
  };
};
