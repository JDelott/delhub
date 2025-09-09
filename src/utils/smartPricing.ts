import { FilteredPutOption, FilteredCallOption } from '../lib/tradier-service';

export interface SmartPricingResult {
  price: number;
  expectedProfit: number;
  spreadType: '10-cent' | '15-cent';
}

/**
 * Calculates smart pricing for options based on bid-ask spread
 * For selling puts: 5¢ below ask (15¢ spread) or 3¢ below ask (10¢ spread)
 * For buying puts: 5¢ above bid (15¢ spread) or 3¢ above bid (10¢ spread)
 * Target profit: 5¢ on 15¢ spreads, 4¢ on 10¢ spreads
 */
export function calculateSmartPricing(
  option: FilteredPutOption | FilteredCallOption,
  action: 'buy' | 'sell'
): SmartPricingResult {
  const spread = option.bidAskSpread;
  const is15CentSpread = spread >= 0.14; // Allow slight tolerance for 15¢ spreads
  const spreadType = is15CentSpread ? '15-cent' : '10-cent';
  
  let price: number;
  let expectedProfit: number;
  
  if (action === 'sell') {
    // Selling: price below ask
    if (is15CentSpread) {
      price = Math.max(0.01, option.ask - 0.05); // 5¢ below ask, minimum 1¢
      expectedProfit = 0.05; // Target 5¢ profit
    } else {
      price = Math.max(0.01, option.ask - 0.03); // 3¢ below ask, minimum 1¢
      expectedProfit = 0.04; // Target 4¢ profit
    }
  } else {
    // Buying: price above bid
    if (is15CentSpread) {
      price = option.bid + 0.05; // 5¢ above bid
      expectedProfit = 0.05; // Target 5¢ profit
    } else {
      price = option.bid + 0.03; // 3¢ above bid
      expectedProfit = 0.04; // Target 4¢ profit
    }
  }
  
  // Round to nearest cent
  price = Math.round(price * 100) / 100;
  
  return {
    price,
    expectedProfit,
    spreadType
  };
}

/**
 * Determines if an option has a 15-cent or 10-cent spread
 */
export function getSpreadType(bidAskSpread: number): '10-cent' | '15-cent' {
  return bidAskSpread >= 0.14 ? '15-cent' : '10-cent';
}

/**
 * Gets the recommended pricing offset based on spread and action
 */
export function getPricingOffset(spreadType: '10-cent' | '15-cent', action: 'buy' | 'sell'): number {
  if (action === 'sell') {
    return spreadType === '15-cent' ? -0.05 : -0.03; // Below ask for selling
  } else {
    return spreadType === '15-cent' ? 0.05 : 0.03; // Above bid for buying
  }
}
