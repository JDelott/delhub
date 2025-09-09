import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';
import { OptionType, ScreenerResults, BatchTradeItem } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00.000Z');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

export const generateOptionId = (
  symbol: string, 
  option: FilteredPutOption | FilteredCallOption, 
  optionType: 'put' | 'call'
): string => {
  return `${symbol}_${optionType}_${option.strike}_${option.expirationDate}`;
};

export const generateCopyText = (
  screenerResults: ScreenerResults,
  optionType: OptionType,
  expirationFilter: 'all' | 'near' | 'far'
): string => {
  const formatDateTime = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
  };

  const formatOptionType = (type: OptionType) => {
    return type === 'puts' ? 'Put Options (3% below stock)' : 'Call Options (3% above stock)';
  };

  let copyText = `📊 OPTIONS SCREENER RESULTS - ${formatDateTime()} ET\n`;
  copyText += `═══════════════════════════════════════════════════\n\n`;
  
  // Summary
  copyText += `🎯 SCREENING CRITERIA:\n`;
  copyText += `• Option Type: ${formatOptionType(optionType)}\n`;
  copyText += `• Exact Spread: ${formatCurrency(screenerResults.criteria.exactSpread)}\n`;
  copyText += `• Min Bid: ${formatCurrency(screenerResults.criteria.minBid)}\n`;
  copyText += `• Max Stock Price: ${screenerResults.criteria.maxStockPrice ? formatCurrency(screenerResults.criteria.maxStockPrice) : 'No limit'}\n`;
  copyText += `• Min Avg Volume: ${screenerResults.criteria.minAverageVolume ? (screenerResults.criteria.minAverageVolume / 1000000).toFixed(1) + 'M' : 'No minimum'}\n`;
  copyText += `• Expiration Filter: ${expirationFilter === 'all' ? 'All' : expirationFilter === 'near' ? '≤30 days' : '>30 days'}\n\n`;

  copyText += `📈 SUMMARY:\n`;
  copyText += `• Stocks Scanned: ${screenerResults.criteria.symbolsScanned}\n`;
  copyText += `• Stocks with Results: ${screenerResults.summary.stocksWithResults}\n`;
  copyText += `• Total Options Found: ${screenerResults.summary.totalOptionsFound}\n`;
  if (screenerResults.summary.stocksFiltered > 0) {
    copyText += `• Filtered Out: ${screenerResults.summary.stocksFiltered} stocks\n`;
  }
  copyText += `\n`;

  // Individual results
  copyText += `🎯 MATCHING ${optionType.toUpperCase()}:\n`;
  copyText += `═══════════════════════════════════════════════════\n\n`;

  screenerResults.results.forEach((result, index) => {
    const optionsToShow = optionType === 'puts' ? result.bestPutOptions : result.bestCallOptions;
    const totalOptionsFound = optionType === 'puts' ? result.totalPutOptionsFound : result.totalCallOptionsFound;

    copyText += `${index + 1}. ${result.symbol}\n`;
    copyText += `   Stock Price: ${result.stockPrice ? formatCurrency(result.stockPrice) : 'N/A'}\n`;
    copyText += `   Avg Volume: ${result.averageVolume ? (result.averageVolume / 1000000).toFixed(1) + 'M' : 'N/A'}\n`;
    copyText += `   Total ${optionType}: ${totalOptionsFound}\n`;
    copyText += `   Expirations: ${result.expirations.length}\n\n`;

    if (optionsToShow.length > 0) {
      copyText += `   Top ${optionType}:\n`;
      copyText += `   ┌──────────┬─────────┬──────┬──────┬────────┬────────┬─────────────┐\n`;
      copyText += `   │  Strike  │vs Stock │ Bid  │ Ask  │ Spread │ Volume │ Expiration  │\n`;
      copyText += `   ├──────────┼─────────┼──────┼──────┼────────┼────────┼─────────────┤\n`;

      optionsToShow.forEach((option) => {
        const strikeStr = formatCurrency(option.strike).padEnd(8);
        const vsStockStr = result.stockPrice ? 
          (optionType === 'puts' 
            ? formatCurrency(result.stockPrice - option.strike)
            : formatCurrency(option.strike - result.stockPrice)
          ).padEnd(7) : 'N/A'.padEnd(7);
        const bidStr = formatCurrency(option.bid).padEnd(4);
        const askStr = formatCurrency(option.ask).padEnd(4);
        const spreadStr = formatCurrency(option.bidAskSpread).padEnd(6);
        const volumeStr = option.volume.toLocaleString().padEnd(6);
        const expStr = formatDate(option.expirationDate).padEnd(11);

        copyText += `   │ ${strikeStr} │ ${vsStockStr} │ ${bidStr} │ ${askStr} │ ${spreadStr} │ ${volumeStr} │ ${expStr} │\n`;
      });

      copyText += `   └──────────┴─────────┴──────┴──────┴────────┴────────┴─────────────┘\n\n`;
    } else {
      copyText += `   No ${optionType} found\n\n`;
    }
  });

  copyText += `\n📱 Generated by PaperTrader AI Options Screener\n`;
  copyText += `🕐 ${formatDateTime()} ET\n`;

  return copyText;
};
