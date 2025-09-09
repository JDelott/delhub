export interface StockContext {
  symbol: string;
  displayName: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  peRatio?: number;
  beta?: number;
}

// New interfaces for technical indicator context
export interface TechnicalIndicatorValues {
  rsi?: {
    current: number;
    signal: 'oversold' | 'overbought' | 'neutral';
    trend: 'rising' | 'falling' | 'sideways';
  };
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  bollingerBands?: {
    position: 'above_upper' | 'below_lower' | 'middle' | 'unknown';
    squeeze: boolean;
    bandWidth: number;
  };
}

export interface TechnicalIndicatorContext {
  indicators: TechnicalIndicatorValues;
  activeIndicators: string[];
  timeframe: string;
  analysisTimestamp: string;
}

// New interfaces for chart pattern analysis
export interface ChartPattern {
  type: 'reversal' | 'continuation' | 'indecisive';
  pattern: string;
  confidence: number;
  description: string;
  tradingImplication: string;
  targetPrice?: number;
  stopLoss?: number;
  timeHorizon: 'short-term' | 'medium-term' | 'long-term';
}

export interface PatternAnalysis {
  patterns: ChartPattern[];
  overallAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  symbol: string;
  timeframe: string;
  analysisTimestamp: string;
  rawAnalysis?: string;
}

export interface EnhancedStockContext extends StockContext {
  technicalIndicators?: TechnicalIndicatorContext;
  patternAnalysis?: PatternAnalysis;
}

// OODA Framework Types for Stock Comparison
export interface OODAObservation {
  symbol: string;
  stockData: EnhancedStockContext;
  marketMetrics: {
    performance: {
      ytd: number;
      oneYear: number;
      threeMonth: number;
    };
    valuation: {
      peRatio?: number;
      marketCap?: number;
      beta?: number;
    };
    momentum: {
      rsiSignal?: 'oversold' | 'overbought' | 'neutral';
      trend: 'bullish' | 'bearish' | 'neutral';
      volume: 'high' | 'normal' | 'low';
    };
  };
  riskFactors: string[];
  keyStrengths: string[];
}

export interface OODAOrientation {
  relativePerformance: {
    winner: string;
    performanceGap: number;
    category: 'price' | 'momentum' | 'valuation' | 'risk';
  }[];
  correlationAnalysis: {
    correlation: number;
    divergencePoints: string[];
  };
  sectorContext: {
    sector: string;
    industryTrends: string[];
    competitivePosition: 'leader' | 'challenger' | 'follower';
  };
}

export interface OODADecision {
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  primaryPick: string;
  confidence: number;
  reasoning: string[];
  alternativeScenarios: {
    bullCase: string;
    bearCase: string;
    baseCase: string;
  };
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface OODAAction {
  strategy: {
    type: 'momentum' | 'value' | 'swing' | 'options' | 'pairs';
    description: string;
  };
  entryStrategy: {
    targetPrice: number;
    entryMethod: 'market' | 'limit' | 'scaled' | 'breakout';
    positionSize: number;
    maxRisk: number;
  };
  riskManagement: {
    stopLoss: number;
    takeProfits: number[];
    maxDrawdown: number;
  };
  alternatives: {
    optionsStrategy?: {
      type: 'covered_calls' | 'cash_secured_puts' | 'spreads';
      strikes: number[];
      expiration: string;
      premium: number;
    };
    hedging?: {
      method: 'inverse_etf' | 'puts' | 'sector_hedge';
      allocation: number;
    };
  };
  timeline: {
    review: string;
    exit: string;
    rebalance: string;
  };
}

export interface StockComparison {
  symbols: string[];
  observe: OODAObservation[];
  orient: OODAOrientation;
  decide: OODADecision;
  act: OODAAction;
  comparisonType: 'vs' | 'best_of' | 'sector_leaders';
  analysisTimestamp: string;
  marketContext: {
    regime: 'bull' | 'bear' | 'sideways';
    volatility: 'low' | 'normal' | 'high';
    sector: string;
  };
}

export interface ComparisonRequest {
  symbols: string[];
  analysisType: 'fundamental' | 'technical' | 'comprehensive';
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  strategy: 'growth' | 'value' | 'momentum' | 'income';
}
