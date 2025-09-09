interface TradierQuote {
  symbol: string;
  description: string;
  exch: string;
  type: string;
  last: number;
  change: number;
  change_percentage: number;
  volume: number;
  average_volume: number;
  last_volume: number;
  trade_date: number;
  prevclose: number;
  week_52_high: number;
  week_52_low: number;
  bid: number;
  bidsize: number;
  bidexch: string;
  bid_date: number;
  ask: number;
  asksize: number;
  askexch: string;
  ask_date: number;
  open: number;
  high: number;
  low: number;
}

interface TradierHistoricalDay {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradierIntradayBar {
  time: string;
  timestamp: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

interface TradierQuoteResponse {
  quotes: {
    quote: TradierQuote | TradierQuote[];
  };
}

interface TradierHistoryResponse {
  history: {
    day: TradierHistoricalDay[];
  };
}

interface TradierTimesalesResponse {
  series: {
    data: TradierIntradayBar[];
  };
}

export type Timeframe = '1min' | '5min' | '15min' | '30min' | '1hr' | '4hr' | '1day';

interface TimeframeConfig {
  label: string;
  apiInterval: string;
  isIntraday: boolean;
  daysOfData: number;
  requiresAggregation: boolean;
  aggregationMinutes?: number;
}

export const TIMEFRAME_CONFIGS: Record<Timeframe, TimeframeConfig> = {
  '1min': { label: '1m', apiInterval: '1min', isIntraday: true, daysOfData: 1, requiresAggregation: false },
  '5min': { label: '5m', apiInterval: '5min', isIntraday: true, daysOfData: 2, requiresAggregation: false },
  '15min': { label: '15m', apiInterval: '15min', isIntraday: true, daysOfData: 5, requiresAggregation: false },
  '30min': { label: '30m', apiInterval: '30min', isIntraday: true, daysOfData: 10, requiresAggregation: false },
  '1hr': { label: '1h', apiInterval: '1min', isIntraday: true, daysOfData: 15, requiresAggregation: true, aggregationMinutes: 60 },
  '4hr': { label: '4h', apiInterval: '1min', isIntraday: true, daysOfData: 30, requiresAggregation: true, aggregationMinutes: 240 },
  '1day': { label: '1D', apiInterval: 'daily', isIntraday: false, daysOfData: 180, requiresAggregation: false }
};

export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradierOption {
  symbol: string;
  description: string;
  exch: string;
  type: string;
  last: number;
  change: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
  bid: number;
  ask: number;
  underlying: string;
  strike: number;
  open_interest: number;
  contract_size: number;
  expiration_date: string;
  expiration_type: string;
  option_type: string;
  root_symbol: string;
}

export interface TradierOptionsChainResponse {
  options: {
    option: TradierOption[];
  };
}

export interface TradierExpirationResponse {
  expirations: {
    date: string[];
  };
}

export interface FilteredPutOption {
  symbol: string;
  description: string;
  strike: number;
  bid: number;
  ask: number;
  bidAskSpread: number;
  volume: number;
  openInterest: number;
  expirationDate: string;
  lastPrice: number;
  change: number;
  impliedVolatility?: number;
}

export interface FilteredCallOption {
  symbol: string;
  description: string;
  strike: number;
  bid: number;
  ask: number;
  bidAskSpread: number;
  volume: number;
  openInterest: number;
  expirationDate: string;
  lastPrice: number;
  change: number;
  impliedVolatility?: number;
}

export const STRIKE_RANGES = [
  { 
    value: 'tight', 
    label: '1%+ Away', 
    desc: 'Very close to current price',
    minPercentage: 1,
    isMinimumThreshold: true
  },
  { 
    value: 'moderate', 
    label: '3%+ Away', 
    desc: 'Standard distance (original)',
    minPercentage: 3,
    isMinimumThreshold: true
  },
  { 
    value: 'wide', 
    label: '5%+ Away', 
    desc: 'Conservative distance',
    minPercentage: 5,
    isMinimumThreshold: true
  },
  { 
    value: 'extended', 
    label: '10%+ Away', 
    desc: 'Deep out-of-the-money',
    minPercentage: 10,
    isMinimumThreshold: true
  }
] as const;

export const SPREAD_OPTIONS = [
  { value: 0.05, label: '$0.05', desc: 'Very tight spreads' },
  { value: 0.10, label: '$0.10', desc: 'Tight spreads' },
  { value: 0.15, label: '$0.15', desc: 'Standard spreads' },
  { value: 0.20, label: '$0.20', desc: 'Moderate spreads' },
  { value: 0.25, label: '$0.25', desc: 'Wide spreads' },
  { value: 0.30, label: '$0.30', desc: 'Wider spreads' },
  { value: 0.50, label: '$0.50', desc: 'Very wide spreads' }
] as const;

class TradierService {
  private apiKey: string;
  private baseUrl = 'https://api.tradier.com/v1';
  private requestCount = 0;  // Add request counter
  private startTime = Date.now();  // Add start time tracking

  constructor() {
    this.apiKey = process.env.TRADIER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('TRADIER_API_KEY environment variable is required');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}, retries = 3): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`🔗 Tradier API: ${url.toString()}`);

    // Track request stats
    this.requestCount++;
    if (this.requestCount % 50 === 0) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const requestsPerSecond = (this.requestCount / elapsed).toFixed(1);
      console.log(`📊 API Stats: ${this.requestCount} requests in ${elapsed.toFixed(0)}s (${requestsPerSecond} req/sec)`);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        });

        if (response.status === 400 && response.statusText.includes('Quota')) {
          console.warn(`⚠️ Quota violation on attempt ${attempt}/${retries}, waiting...`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
            continue;
          }
        }

        if (!response.ok) {
          throw new Error(`Tradier API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        if (attempt === retries) throw error;
        console.warn(`⚠️ API attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Add method to get API stats
  getApiStats() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return {
      totalRequests: this.requestCount,
      elapsedSeconds: elapsed,
      requestsPerSecond: this.requestCount / elapsed,
      startTime: new Date(this.startTime).toISOString(),
      estimatedDailyUsage: (this.requestCount / elapsed) * 86400 // Extrapolate to 24 hours
    };
  }

  // Add method to reset stats (useful for new screening sessions)
  resetApiStats() {
    this.requestCount = 0;
    this.startTime = Date.now();
    console.log('📊 API stats reset');
  }

  // Get current quote
  async getQuote(symbol: string): Promise<TradierQuote> {
    const response = await this.makeRequest<TradierQuoteResponse>('/markets/quotes', {
      symbols: symbol.toUpperCase()
    });

    const quote = Array.isArray(response.quotes.quote) 
      ? response.quotes.quote[0] 
      : response.quotes.quote;

    if (!quote) {
      throw new Error(`No quote data found for symbol: ${symbol}`);
    }

    return quote;
  }

  // Get daily historical data
  private async getDailyHistory(symbol: string, startDate: string, endDate: string): Promise<ChartCandle[]> {
    const response = await this.makeRequest<TradierHistoryResponse>('/markets/history', {
      symbol: symbol.toUpperCase(),
      start: startDate,
      end: endDate,
      session_filter: 'open'
    });

    const dailyData = response.history?.day || [];
    
    return dailyData
      .filter(day => day.open && day.high && day.low && day.close)
      .map(day => ({
        time: this.parseDateToTimestamp(day.date),
        open: Number(day.open),
        high: Number(day.high),
        low: Number(day.low),
        close: Number(day.close),
        volume: Number(day.volume || 0)
      }))
      .sort((a, b) => a.time - b.time);
  }

  // Get intraday data
  private async getIntradayData(symbol: string, interval: string, startDate: string, endDate: string): Promise<ChartCandle[]> {
    const response = await this.makeRequest<TradierTimesalesResponse>('/markets/timesales', {
      symbol: symbol.toUpperCase(),
      interval: interval,
      start: startDate,
      end: endDate,
      session_filter: 'open' // Only regular market hours
    });

    const intradayData = response.series?.data || [];
    
    console.log(`📊 Tradier ${interval} data: ${intradayData.length} bars`);
    console.log(`📅 First bar: ${intradayData[0]?.time} (${new Date(intradayData[0]?.timestamp * 1000).toLocaleString()})`);
    console.log(`📅 Last bar: ${intradayData[intradayData.length - 1]?.time} (${new Date(intradayData[intradayData.length - 1]?.timestamp * 1000).toLocaleString()})`);

    return intradayData
      .filter(bar => bar.open && bar.high && bar.low && (bar.close || bar.price))
      .map(bar => ({
        time: bar.timestamp, // Use Tradier's timestamp directly
        open: Number(bar.open),
        high: Number(bar.high),
        low: Number(bar.low),
        close: Number(bar.close || bar.price),
        volume: Number(bar.volume || 0)
      }))
      .sort((a, b) => a.time - b.time);
  }

  // Aggregate minute data into larger timeframes
  private aggregateCandles(candles: ChartCandle[], intervalMinutes: number): ChartCandle[] {
    if (candles.length === 0) return [];

    const aggregated: ChartCandle[] = [];
    const intervalSeconds = intervalMinutes * 60;

    // Group candles by time intervals
    const groups = new Map<number, ChartCandle[]>();

    for (const candle of candles) {
      // Round down to the nearest interval
      const intervalStart = Math.floor(candle.time / intervalSeconds) * intervalSeconds;
      
      if (!groups.has(intervalStart)) {
        groups.set(intervalStart, []);
      }
      groups.get(intervalStart)!.push(candle);
    }

    // Create aggregated candles
    for (const [intervalStart, groupCandles] of groups) {
      if (groupCandles.length === 0) continue;

      groupCandles.sort((a, b) => a.time - b.time);

      const aggregatedCandle: ChartCandle = {
        time: intervalStart,
        open: groupCandles[0].open,
        high: Math.max(...groupCandles.map(c => c.high)),
        low: Math.min(...groupCandles.map(c => c.low)),
        close: groupCandles[groupCandles.length - 1].close,
        volume: groupCandles.reduce((sum, c) => sum + c.volume, 0)
      };

      aggregated.push(aggregatedCandle);
    }

    return aggregated.sort((a, b) => a.time - b.time);
  }

  // Add market status helper
  private isMarketOpen(): { isOpen: boolean; status: string; nextOpen?: string } {
    const now = new Date();
    const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hour = etTime.getHours();
    const minute = etTime.getMinutes();
    const dayOfWeek = etTime.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { isOpen: false, status: "Weekend - Market Closed" };
    }
    
    // Check if market hours (9:30 AM - 4:00 PM ET)
    const marketStart = 9.5; // 9:30 AM
    const marketEnd = 16; // 4:00 PM
    const currentTime = hour + (minute / 60);
    
    if (currentTime >= marketStart && currentTime < marketEnd) {
      return { isOpen: true, status: "Market Open" };
    } else if (currentTime < marketStart) {
      return { isOpen: false, status: "Pre-Market - Market Opens at 9:30 AM ET" };
    } else {
      return { isOpen: false, status: "After Hours - Market Closed at 4:00 PM ET" };
    }
  }

  // Update getChartData method
  async getChartData(symbol: string, timeframe: Timeframe): Promise<ChartCandle[]> {
    const config = TIMEFRAME_CONFIGS[timeframe];
    if (!config) {
      throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    // Check market status
    const marketStatus = this.isMarketOpen();
    console.log(`🏪 Market Status: ${marketStatus.status}`);

    // Calculate date range with current time logging
    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - config.daysOfData);

    console.log(`🕐 Current local time: ${now.toISOString()}`);
    console.log(`🕐 Current ET time: ${now.toLocaleString("en-US", {timeZone: "America/New_York"})}`);

    // For intraday data, use precise current time; for daily data, use date only
    const startDateStr = config.isIntraday 
      ? this.formatDateTimeForTradier(startDate) 
      : this.formatDate(startDate);
    const endDateStr = config.isIntraday 
      ? this.formatDateTimeForTradier(endDate) 
      : this.formatDate(endDate);

    console.log(`📈 Fetching ${timeframe} data for ${symbol}: ${startDateStr} to ${endDateStr}`);

    let candles: ChartCandle[];

    if (config.isIntraday) {
      candles = await this.getIntradayData(symbol, config.apiInterval, startDateStr, endDateStr);
      
      if (config.requiresAggregation && config.aggregationMinutes) {
        console.log(`🔄 Aggregating ${candles.length} candles into ${config.aggregationMinutes}min intervals`);
        candles = this.aggregateCandles(candles, config.aggregationMinutes);
      }
    } else {
      candles = await this.getDailyHistory(symbol, startDateStr, endDateStr);
    }

    // Remove duplicates and ensure proper ordering
    candles = this.removeDuplicateTimestamps(candles);

    console.log(`✅ Final dataset: ${candles.length} ${timeframe} candles for ${symbol}`);
    
    if (candles.length > 0) {
      const firstTime = new Date(candles[0].time * 1000);
      const lastTime = new Date(candles[candles.length - 1].time * 1000);
      console.log(`📊 Time range: ${firstTime.toISOString()} to ${lastTime.toISOString()}`);
      console.log(`📊 Last candle ET: ${lastTime.toLocaleString("en-US", {timeZone: "America/New_York"})}`);
      
      if (marketStatus.isOpen) {
        console.log(`🕐 Minutes behind current time: ${Math.round((now.getTime() - lastTime.getTime()) / 60000)}`);
      } else {
        console.log(`🕐 Market is closed. Last data from market close.`);
      }
    }

    return candles;
  }

  // Format quote data for UI
  formatQuoteData(tradierQuote: TradierQuote) {
    return {
      symbol: tradierQuote.symbol,
      displayName: tradierQuote.description,
      price: tradierQuote.last,
      change: tradierQuote.change,
      changePercent: tradierQuote.change_percentage,
      volume: tradierQuote.volume,
      avgVolume: tradierQuote.average_volume,
      dayLow: tradierQuote.low,
      dayHigh: tradierQuote.high,
      previousClose: tradierQuote.prevclose,
      open: tradierQuote.open,
      fiftyTwoWeekLow: tradierQuote.week_52_low,
      fiftyTwoWeekHigh: tradierQuote.week_52_high,
      bid: tradierQuote.bid,
      ask: tradierQuote.ask,
      bidSize: tradierQuote.bidsize,
      askSize: tradierQuote.asksize,
      exchange: tradierQuote.exch,
      // Note: Fundamental data not available in basic quotes
      peRatio: null,
      marketCap: null,
      eps: null,
      dividendYield: null,
      beta: null
    };
  }

  // Enhanced expiration debugging
  async getOptionsExpirationsWithDebug(symbol: string): Promise<{ 
    expirations: string[], 
    debugInfo: {
      totalFound: number,
      raw: string[],
      formatted: Array<{date: string, daysFromNow: number, isValid: boolean}>
    }
  }> {
    console.log(`🔍 Fetching expirations for ${symbol}...`);
    
    const response = await this.makeRequest<TradierExpirationResponse>('/markets/options/expirations', {
      symbol: symbol.toUpperCase()
    });

    const rawExpirations = response.expirations?.date || [];
    const now = new Date();
    
    const formattedDebug = rawExpirations.map(expDate => {
      const expDateTime = new Date(expDate);
      const daysFromNow = Math.ceil((expDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isValid = !isNaN(expDateTime.getTime()) && daysFromNow >= 0;
      
      return {
        date: expDate,
        daysFromNow,
        isValid
      };
    });

    // Filter out invalid or expired dates
    const validExpirations = formattedDebug
      .filter(exp => exp.isValid)
      .map(exp => exp.date)
      .sort(); // Sort chronologically

    console.log(`📅 ${symbol} Expirations Debug:`);
    console.log(`   Total from API: ${rawExpirations.length}`);
    console.log(`   Valid (non-expired): ${validExpirations.length}`);
    console.log(`   Raw dates:`, rawExpirations);
    console.log(`   Valid dates:`, validExpirations);
    
    return {
      expirations: validExpirations,
      debugInfo: {
        totalFound: rawExpirations.length,
        raw: rawExpirations,
        formatted: formattedDebug
      }
    };
  }

  // Keep the original method for backward compatibility
  async getOptionsExpirations(symbol: string): Promise<string[]> {
    const result = await this.getOptionsExpirationsWithDebug(symbol);
    return result.expirations;
  }

  // Get options chain for a symbol and expiration
  async getOptionsChain(symbol: string, expiration: string): Promise<TradierOption[]> {
    const response = await this.makeRequest<TradierOptionsChainResponse>('/markets/options/chains', {
      symbol: symbol.toUpperCase(),
      expiration: expiration
    });

    return response.options?.option || [];
  }

  // Filter put options based on criteria
  async getFilteredPutOptions(
    symbol: string,
    expiration: string,
    exactSpreads: number[] = [0.15], // Changed to array
    minBid: number = 0.05,
    currentStockPrice?: number,
    strikeRange: 'tight' | 'moderate' | 'wide' | 'extended' = 'moderate'
  ): Promise<FilteredPutOption[]> {
    const options = await this.getOptionsChain(symbol, expiration);
    
    let stockPrice = currentStockPrice;
    if (!stockPrice) {
      const quote = await this.getQuote(symbol);
      stockPrice = quote.last;
    }
    
    const ranges = {
      tight: 1,
      moderate: 3,
      wide: 5,
      extended: 10
    };
    
    const minPercentage = ranges[strikeRange];
    
    const putOptions = options.filter((option: TradierOption) => 
      option.option_type === 'put'
    );

    const filteredPuts = putOptions
      .map((option: TradierOption) => {
        const bidAskSpread = option.ask - option.bid;
        return {
          symbol: option.symbol,
          description: option.description,
          strike: option.strike,
          bid: option.bid,
          ask: option.ask,
          bidAskSpread: Number(bidAskSpread.toFixed(2)),
          volume: option.volume,
          openInterest: option.open_interest,
          expirationDate: option.expiration_date,
          lastPrice: option.last,
          change: option.change
        };
      })
      .filter((option: FilteredPutOption) => {
        // Check if spread matches any of the selected spreads
        const roundedSpread = Number(option.bidAskSpread.toFixed(2));
        const spreadMatch = exactSpreads.some(targetSpread => {
          const roundedTarget = Number(targetSpread.toFixed(2));
          return roundedSpread === roundedTarget;
        });
        
        const bidMatch = option.bid >= minBid;
        
        const thresholdBelow = stockPrice * (1 - minPercentage / 100);
        const strikeMatch = option.strike <= thresholdBelow;
        
        const validData = option.bid > 0 && option.ask > 0;
        
        return spreadMatch && bidMatch && strikeMatch && validData;
      })
      .sort((a: FilteredPutOption, b: FilteredPutOption) => b.volume - a.volume);

    return filteredPuts;
  }

  // Filter call options based on criteria
  async getFilteredCallOptions(
    symbol: string,
    expiration: string,
    exactSpreads: number[] = [0.15], // Changed to array
    minBid: number = 0.05,
    currentStockPrice?: number,
    strikeRange: 'tight' | 'moderate' | 'wide' | 'extended' = 'moderate'
  ): Promise<FilteredCallOption[]> {
    const options = await this.getOptionsChain(symbol, expiration);
    
    let stockPrice = currentStockPrice;
    if (!stockPrice) {
      const quote = await this.getQuote(symbol);
      stockPrice = quote.last;
    }
    
    const ranges = {
      tight: 1,
      moderate: 3,
      wide: 5,
      extended: 10
    };
    
    const minPercentage = ranges[strikeRange];
    
    const callOptions = options.filter((option: TradierOption) => 
      option.option_type === 'call'
    );

    const filteredCalls = callOptions
      .map((option: TradierOption) => {
        const bidAskSpread = option.ask - option.bid;
        return {
          symbol: option.symbol,
          description: option.description,
          strike: option.strike,
          bid: option.bid,
          ask: option.ask,
          bidAskSpread: Number(bidAskSpread.toFixed(2)),
          volume: option.volume,
          openInterest: option.open_interest,
          expirationDate: option.expiration_date,
          lastPrice: option.last,
          change: option.change
        };
      })
      .filter((option: FilteredCallOption) => {
        // Check if spread matches any of the selected spreads
        const roundedSpread = Number(option.bidAskSpread.toFixed(2));
        const spreadMatch = exactSpreads.some(targetSpread => {
          const roundedTarget = Number(targetSpread.toFixed(2));
          return roundedSpread === roundedTarget;
        });
        
        const bidMatch = option.bid >= minBid;
        
        const thresholdAbove = stockPrice * (1 + minPercentage / 100);
        const strikeMatch = option.strike >= thresholdAbove;
        
        const validData = option.bid > 0 && option.ask > 0;
        
        return spreadMatch && bidMatch && strikeMatch && validData;
      })
      .sort((a: FilteredCallOption, b: FilteredCallOption) => b.volume - a.volume);

    return filteredCalls;
  }

  // Utility methods
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Precise method for intraday data using Tradier's expected format
  private formatDateTimeForTradier(date: Date): string {
    // Tradier expects YYYY-MM-DD HH:MM format in Eastern Time
    const easternTime = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const year = easternTime.getFullYear();
    const month = String(easternTime.getMonth() + 1).padStart(2, '0');
    const day = String(easternTime.getDate()).padStart(2, '0');
    const hours = String(easternTime.getHours()).padStart(2, '0');
    const minutes = String(easternTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  private parseDateToTimestamp(dateStr: string): number {
    return Math.floor(new Date(dateStr).getTime() / 1000);
  }

  private removeDuplicateTimestamps(candles: ChartCandle[]): ChartCandle[] {
    const seen = new Set<number>();
    const unique: ChartCandle[] = [];

    for (const candle of candles) {
      if (!seen.has(candle.time)) {
        seen.add(candle.time);
        unique.push(candle);
      }
    }

    return unique.sort((a, b) => a.time - b.time);
  }
}

export default TradierService; 
