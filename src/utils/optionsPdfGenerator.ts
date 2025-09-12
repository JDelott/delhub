import { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';

export interface ScreenerResults {
  results: StockOptionsResult[];
  criteria: {
    exactSpread: number;
    minBid: number;
    symbolsScanned: number;
    successfulScans: number;
    maxStockPrice?: number;
    minAverageVolume?: number;
  };
  summary: {
    totalOptionsFound: number;
    stocksWithResults: number;
    stocksFiltered: number;
    stocksFilteredByVolume?: number;
    topPerformers: StockOptionsResult[];
  };
}

interface StockOptionsResult {
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

type OptionType = 'puts' | 'calls';

export async function generateOptionsPDF(
  screenerResults: ScreenerResults,
  optionType: OptionType,
  expirationFilter: string
): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Create the HTML content
    const htmlContent = createPDFHTML(screenerResults, optionType, expirationFilter);
    
    // Balanced PDF generation options
    const options = {
      margin: 10,
      filename: `options-screener-${optionType}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    // Generate and download the PDF
    await html2pdf().from(htmlContent).set(options).save();
    
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}

function createPDFHTML(
  screenerResults: ScreenerResults,
  optionType: OptionType,
  expirationFilter: string
): HTMLElement {
  // Create a temporary div for the PDF content
  const container = document.createElement('div');
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatDateTime = (): string => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles'
    });
  };

  // Balanced HTML with good sizing and spacing
  container.innerHTML = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      line-height: 1.4;
      font-size: 14px;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 6px;
      ">
        <h1 style="
          margin: 0 0 10px 0;
          font-size: 26px;
          font-weight: bold;
          text-align: center;
        ">Options Screener Results</h1>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        ">
          <div style="
            background: ${optionType === 'puts' ? 'rgba(234, 88, 12, 0.3)' : 'rgba(5, 150, 105, 0.3)'};
            border: 1px solid ${optionType === 'puts' ? '#ea580c' : '#059669'};
            color: ${optionType === 'puts' ? '#fdba74' : '#6ee7b7'};
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          ">
            ${optionType === 'puts' ? 'BEARISH STRATEGY' : 'BULLISH STRATEGY'}
          </div>
          
          <div style="
            font-size: 13px;
            color: #94a3b8;
          ">
            Generated: ${formatDateTime()} PT
          </div>
        </div>
      </div>

      <!-- Summary Grid -->
      <div style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${screenerResults.criteria.symbolsScanned}</div>
          <div style="font-size: 11px; color: #64748b;">Stocks Scanned</div>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #3b82f6; margin-bottom: 4px;">${screenerResults.summary.stocksWithResults}</div>
          <div style="font-size: 11px; color: #64748b;">With Results</div>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #8b5cf6; margin-bottom: 4px;">${screenerResults.summary.totalOptionsFound}</div>
          <div style="font-size: 11px; color: #64748b;">Total Options</div>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #22c55e; margin-bottom: 4px;">${screenerResults.criteria.successfulScans}</div>
          <div style="font-size: 11px; color: #64748b;">Successful Scans</div>
        </div>
      </div>

      <!-- Criteria -->
      <div style="
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 6px;
        font-size: 12px;
      ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <strong>Option Type:</strong> ${optionType === 'puts' ? 'Put Options (3% below stock)' : 'Call Options (3% above stock)'}<br>
            <strong>Exact Spread:</strong> ${formatCurrency(screenerResults.criteria.exactSpread)}<br>
            <strong>Min Bid:</strong> ${formatCurrency(screenerResults.criteria.minBid)}
          </div>
          <div>
            <strong>Max Stock Price:</strong> ${screenerResults.criteria.maxStockPrice ? formatCurrency(screenerResults.criteria.maxStockPrice) : 'No limit'}<br>
            <strong>Min Avg Volume:</strong> ${screenerResults.criteria.minAverageVolume ? (screenerResults.criteria.minAverageVolume / 1000000).toFixed(1) + 'M' : 'No minimum'}<br>
            <strong>Expiration Filter:</strong> ${expirationFilter === 'all' ? 'All' : expirationFilter === 'near' ? '≤30 days' : '>30 days'}
          </div>
        </div>
      </div>

      <!-- Results Title -->
      <h2 style="
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #334155;
        border-bottom: 2px solid #0ea5e9;
        padding-bottom: 5px;
      ">Matching ${optionType.charAt(0).toUpperCase() + optionType.slice(1)}</h2>

      <!-- Stock Results - Show ALL options for each stock -->
      ${screenerResults.results.map((result, index) => {
        const optionsToShow = optionType === 'puts' ? result.bestPutOptions : result.bestCallOptions;
        const totalOptionsFound = optionType === 'puts' ? result.totalPutOptionsFound : result.totalCallOptionsFound;
        
        return `
          <div style="
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 18px;
            page-break-inside: avoid;
          ">
            <!-- Stock Header -->
            <div style="
              background: #f1f5f9;
              padding: 12px 15px;
              border-bottom: 1px solid #e2e8f0;
            ">
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
                <h3 style="
                  margin: 0;
                  font-size: 16px;
                  color: #0f172a;
                ">${index + 1}. ${result.symbol}</h3>
                
                <div style="
                  font-size: 13px;
                  color: #475569;
                ">
                  Stock: ${result.stockPrice ? formatCurrency(result.stockPrice) : 'N/A'} | 
                  Vol: ${result.averageVolume ? (result.averageVolume / 1000000).toFixed(1) + 'M' : 'N/A'} | 
                  Total ${optionType}: ${totalOptionsFound} | 
                  Expirations: ${result.expirations.length}
                </div>
              </div>
            </div>
            
            <!-- Options Table - Show ALL options -->
            ${optionsToShow.length > 0 ? `
              <div style="padding: 15px;">
                <table style="
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 11px;
                ">
                  <thead>
                    <tr style="background: #334155; color: white;">
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">Strike</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">vs Stock</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">Bid</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">Ask</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">Spread</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">Volume</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #475569;">Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${optionsToShow.map((option, optionIndex) => {
                      const vsStock = result.stockPrice ? 
                        (optionType === 'puts' 
                          ? formatCurrency(result.stockPrice - option.strike)
                          : formatCurrency(option.strike - result.stockPrice)
                        ) : 'N/A';
                      
                      return `
                        <tr style="background: ${optionIndex % 2 === 0 ? '#f8fafc' : 'white'};">
                          <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${formatCurrency(option.strike)}</td>
                          <td style="padding: 8px; border: 1px solid #e2e8f0; color: ${optionType === 'puts' ? '#ef4444' : '#22c55e'};">${vsStock}</td>
                          <td style="padding: 8px; border: 1px solid #e2e8f0; color: #22c55e;">${formatCurrency(option.bid)}</td>
                          <td style="padding: 8px; border: 1px solid #e2e8f0; color: #ef4444;">${formatCurrency(option.ask)}</td>
                          <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #0ea5e9;">${formatCurrency(option.bidAskSpread)}</td>
                          <td style="padding: 8px; border: 1px solid #e2e8f0; color: #475569;">${option.volume.toLocaleString()}</td>
                          <td style="padding: 8px; border: 1px solid #e2e8f0; color: #475569;">${formatDate(option.expirationDate)}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div style="
                padding: 20px;
                text-align: center;
                color: #94a3b8;
                font-style: italic;
                font-size: 13px;
              ">
                No ${optionType} found matching criteria
              </div>
            `}
          </div>
        `;
      }).join('')}

      <!-- Footer -->
      <div style="
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: 11px;
        color: #64748b;
      ">
        Generated by PaperTrader AI Options Screener<br>
        ${formatDateTime()} PT
      </div>
    </div>
  `;

  return container;
}
