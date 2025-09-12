import { TradeEntry, TradeStats, calculateCommission, calculateNetAmount } from '@/store/tradeStore';

export interface TradesPdfData {
  trades: TradeEntry[];
  stats: TradeStats;
}

export async function generateTradesPDF(
  tradesData: TradesPdfData
): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Create the HTML content
    const htmlContent = createTradesPDFHTML(tradesData);
    
    // PDF generation options
    const options = {
      margin: 10,
      filename: `trade-entries-${new Date().toISOString().split('T')[0]}.pdf`,
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
    console.error('Failed to generate trades PDF:', error);
    throw new Error('Failed to generate trades PDF report');
  }
}

function createTradesPDFHTML(tradesData: TradesPdfData): HTMLElement {
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

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
  };

  const formatDateOnly = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York'
    });
  };

  const getCurrentDateTime = (): string => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
  };

  // Sort trades by date (most recent first)
  const sortedTrades = [...tradesData.trades].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate win rate
  const winRate = tradesData.stats.totalTrades > 0 
    ? (tradesData.stats.positiveEntries / tradesData.stats.totalTrades * 100).toFixed(1)
    : '0.0';

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
        ">Trading Journal Report</h1>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        ">
          <div style="
            background: ${tradesData.stats.totalNetAmount >= 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            border: 1px solid ${tradesData.stats.totalNetAmount >= 0 ? '#3b82f6' : '#ef4444'};
            color: ${tradesData.stats.totalNetAmount >= 0 ? '#93c5fd' : '#fca5a5'};
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          ">
            ${tradesData.stats.totalNetAmount >= 0 ? 'NET PROFITABLE PERIOD' : 'NET LOSS PERIOD'}
          </div>
          
          <div style="
            font-size: 13px;
            color: #94a3b8;
          ">
            Generated: ${getCurrentDateTime()} ET
          </div>
        </div>
      </div>

      <!-- Summary Grid -->
      <div style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${tradesData.stats.totalTrades}</div>
          <div style="font-size: 11px; color: #64748b;">Total Trades</div>
        </div>
        <div style="background: ${tradesData.stats.totalAmount >= 0 ? '#f0fdf4' : '#fef2f2'}; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid ${tradesData.stats.totalAmount >= 0 ? '#dcfce7' : '#fecaca'};">
          <div style="font-size: 22px; font-weight: bold; color: ${tradesData.stats.totalAmount >= 0 ? '#22c55e' : '#ef4444'}; margin-bottom: 4px;">${formatCurrency(tradesData.stats.totalAmount)}</div>
          <div style="font-size: 11px; color: #64748b;">Gross P&L</div>
        </div>
        <div style="background: #fefce8; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #fef3c7;">
          <div style="font-size: 22px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${winRate}%</div>
          <div style="font-size: 11px; color: #64748b;">Win Rate</div>
        </div>
      </div>

      <!-- Commission & Net P&L Grid -->
      <div style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="background: ${tradesData.stats.totalNetAmount >= 0 ? '#eff6ff' : '#fef2f2'}; padding: 15px; border-radius: 6px; text-align: center; border: 2px solid ${tradesData.stats.totalNetAmount >= 0 ? '#3b82f6' : '#ef4444'};">
          <div style="font-size: 22px; font-weight: bold; color: ${tradesData.stats.totalNetAmount >= 0 ? '#3b82f6' : '#ef4444'}; margin-bottom: 4px;">${formatCurrency(tradesData.stats.totalNetAmount)}</div>
          <div style="font-size: 11px; color: #64748b; font-weight: bold;">Net P&L (After Commissions)</div>
        </div>
        <div style="background: #fff7ed; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #fed7aa;">
          <div style="font-size: 22px; font-weight: bold; color: #ea580c; margin-bottom: 4px;">${formatCurrency(tradesData.stats.totalCommissions)}</div>
          <div style="font-size: 11px; color: #64748b;">Total Commissions</div>
        </div>
        <div style="background: #f8f4ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e9e5ff;">
          <div style="font-size: 22px; font-weight: bold; color: #8b5cf6; margin-bottom: 4px;">${formatCurrency(tradesData.stats.averageNetAmount)}</div>
          <div style="font-size: 11px; color: #64748b;">Avg Net Per Trade</div>
        </div>
      </div>

      <!-- Performance Breakdown -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px solid #dcfce7;">
          <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">Winning Trades</h4>
          <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${tradesData.stats.positiveEntries}</div>
          <div style="font-size: 12px; color: #16a34a; margin-top: 4px;">
            ${tradesData.stats.totalTrades > 0 ? ((tradesData.stats.positiveEntries / tradesData.stats.totalTrades) * 100).toFixed(1) : '0'}% of total
          </div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca;">
          <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px;">Losing Trades</h4>
          <div style="font-size: 20px; font-weight: bold; color: #ef4444;">${tradesData.stats.negativeEntries}</div>
          <div style="font-size: 12px; color: #dc2626; margin-top: 4px;">
            ${tradesData.stats.totalTrades > 0 ? ((tradesData.stats.negativeEntries / tradesData.stats.totalTrades) * 100).toFixed(1) : '0'}% of total
          </div>
        </div>
      </div>

      <!-- Top Performing Symbols -->
      ${tradesData.stats.topSymbols.length > 0 ? `
        <div style="
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 6px;
        ">
          <h4 style="margin: 0 0 12px 0; color: #334155; font-size: 16px;">Top Performing Symbols</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            ${tradesData.stats.topSymbols.slice(0, 6).map((symbol, index) => `
              <div style="
                background: white;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
                <div>
                  <div style="font-weight: bold; color: #0f172a;">${symbol.symbol}</div>
                  <div style="font-size: 11px; color: #64748b;">${symbol.count} trades</div>
                </div>
                <div style="
                  font-weight: bold;
                  color: ${symbol.total >= 0 ? '#22c55e' : '#ef4444'};
                ">
                  ${formatCurrency(symbol.total)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Recent Trades Title -->
      <h2 style="
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #334155;
        border-bottom: 2px solid #0ea5e9;
        padding-bottom: 5px;
      ">Trade Entries (${sortedTrades.length} total)</h2>

      <!-- Trades Table -->
      ${sortedTrades.length > 0 ? `
        <div style="
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        ">
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          ">
            <thead>
              <tr style="background: #334155; color: white;">
                <th style="padding: 12px 8px; text-align: left; border-right: 1px solid #475569;">#</th>
                <th style="padding: 12px 8px; text-align: left; border-right: 1px solid #475569;">Symbol</th>
                <th style="padding: 12px 8px; text-align: left; border-right: 1px solid #475569;">Gross P&L</th>
                <th style="padding: 12px 8px; text-align: left; border-right: 1px solid #475569;">Commission</th>
                <th style="padding: 12px 8px; text-align: left; border-right: 1px solid #475569;">Net P&L</th>
                <th style="padding: 12px 8px; text-align: left; border-right: 1px solid #475569;">Date & Time</th>
                <th style="padding: 12px 8px; text-align: left;">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTrades.map((trade, index) => {
                const commission = calculateCommission(trade);
                const netAmount = calculateNetAmount(trade);
                return `
                <tr style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; ${netAmount >= 0 ? 'border-left: 4px solid #3b82f6;' : 'border-left: 4px solid #ef4444;'}">
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0; color: #64748b; font-weight: bold;">
                    ${index + 1}
                  </td>
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: ${netAmount >= 0 ? '#3b82f6' : '#ef4444'};
                      "></div>
                      <span style="font-weight: bold; color: #0f172a; font-size: 14px;">${trade.symbol}</span>
                    </div>
                  </td>
                  <td style="
                    padding: 10px 8px;
                    border-right: 1px solid #e2e8f0;
                    font-weight: bold;
                    color: ${trade.amount >= 0 ? '#22c55e' : '#ef4444'};
                    font-size: 14px;
                  ">
                    ${formatCurrency(trade.amount)}
                  </td>
                  <td style="
                    padding: 10px 8px;
                    border-right: 1px solid #e2e8f0;
                    color: #ea580c;
                    font-weight: bold;
                    font-size: 12px;
                  ">
                    ${formatCurrency(commission)}
                  </td>
                  <td style="
                    padding: 10px 8px;
                    border-right: 1px solid #e2e8f0;
                    font-weight: bold;
                    color: ${netAmount >= 0 ? '#3b82f6' : '#ef4444'};
                    font-size: 14px;
                  ">
                    ${formatCurrency(netAmount)}
                  </td>
                  <td style="padding: 10px 8px; border-right: 1px solid #e2e8f0; color: #475569;">
                    <div>${formatDateOnly(new Date(trade.timestamp))}</div>
                    <div style="font-size: 11px; color: #64748b;">
                      ${new Date(trade.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/New_York'
                      })} ET
                    </div>
                  </td>
                  <td style="padding: 10px 8px; color: #475569; font-style: ${trade.notes ? 'normal' : 'italic'};">
                    ${trade.notes || 'No notes'}
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div style="
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 30px;
          text-align: center;
          color: #64748b;
          font-style: italic;
          border-radius: 6px;
        ">
          No trade entries found
        </div>
      `}

      <!-- Footer -->
      <div style="
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: 11px;
        color: #64748b;
      ">
        Generated by PaperTrader AI Trading Journal<br>
        ${getCurrentDateTime()} ET
      </div>
    </div>
  `;

  return container;
}
