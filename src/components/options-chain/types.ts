import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';

export interface OptionsChainProps {
  className?: string;
}

export interface OptionsData {
  symbol: string;
  expiration: string;
  stockPrice?: number;
  criteria: {
    exactSpreads: number[];
    minBid: number;
    maxStrikeDifference?: number;
    strikeRange?: 'tight' | 'moderate' | 'wide' | 'extended';
  };
  putOptions: FilteredPutOption[];
  count: number;
}

export interface StockOptionsResult {
  symbol: string;
  success: boolean;
  error?: string;
  expirations: string[];
  bestPutOptions: FilteredPutOption[];
  bestCallOptions: FilteredCallOption[];
  totalPutOptionsFound: number;
  totalCallOptionsFound: number;
  stockPrice?: number;
  averageVolume?: number;
  priceFilterPassed?: boolean;
  volumeFilterPassed?: boolean;
}

export interface ScreenerResults {
  results: StockOptionsResult[];
  criteria: {
    exactSpreads: number[];
    minBid: number;
    symbolsScanned: number;
    successfulScans: number;
    maxStockPrice?: number;
    minAverageVolume?: number;
    strikeRange?: 'tight' | 'moderate' | 'wide' | 'extended';
  };
  summary: {
    totalOptionsFound: number;
    stocksWithResults: number;
    stocksFiltered: number;
    stocksFilteredByVolume?: number;
    topPerformers: StockOptionsResult[];
  };
}

export interface OptionsScreenerRequest {
  symbols?: string[];
  exactSpreads?: number[];
  minBid?: number;
  maxResults?: number;
  expirationFilter?: 'all' | 'near' | 'far';
  priceFilter?: 'all' | 'under50' | 'under25' | 'verified50';
  maxStockPrice?: number;
  minAverageVolume?: number;
  optionType?: 'puts' | 'calls' | 'both';
  strikeRange?: 'tight' | 'moderate' | 'wide' | 'extended';
}

export interface TradeModalState {
  isOpen: boolean;
  option: FilteredPutOption | FilteredCallOption | null;
  optionType: 'put' | 'call';
  symbol: string;
  stockPrice: number;
}

export interface BatchTradeItem {
  id: string;
  symbol: string;
  option: FilteredPutOption | FilteredCallOption;
  optionType: 'put' | 'call';
  stockPrice: number;
  action: 'buy' | 'sell';
  contracts: number;
  premium: number;
}

export interface BatchTradeModalState {
  isOpen: boolean;
  items: BatchTradeItem[];
}

export interface SectorFilter {
  value: string;
  label: string;
  desc: string;
  color: string;
  stocks: string[];
}

export interface VolumeFilter {
  value: number;
  label: string;
  desc: string;
  displayValue: string;
}

export type OptionType = 'puts' | 'calls';
export type ViewMode = 'single' | 'screener';
