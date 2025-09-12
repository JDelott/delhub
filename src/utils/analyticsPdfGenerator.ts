interface AnalyticsData {
  overview: {
    totalDays: number;
    totalTrades: number;
    totalAmount: number;
    avgDailyAmount: number;
    totalGains: number;
    totalLosses: number;
    winRate: number;
    bestDay: any;
    worstDay: any;
  };
  recentSummaries: any[];
  monthlyPerformance: any[];
  topSymbols: any[];
}

export async function generateAnalyticsPDF(
  analyticsData: AnalyticsData
): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Create the HTML content
    const htmlContent = createAnalyticsPDFHTML(analyticsData);
    
    // PDF generation options
    const options = {
      margin: 10,
      filename: `delhub-analytics-${new Date().toISOString().split('T')[0]}.pdf`,
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
    console.error('Failed to generate analytics PDF:', error);
    throw new Error('Failed to generate analytics PDF report');
  }
}

function createAnalyticsPDFHTML(analyticsData: AnalyticsData): HTMLElement {
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (monthString: string): string => {
    return new Date(monthString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
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
        ">DelHub Analytics Report</h1>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        ">
          <div style="
            background: ${analyticsData.overview.totalAmount >= 0 ? 'rgba(5, 150, 105, 0.3)' : 'rgba(234, 88, 12, 0.3)'};
            border: 1px solid ${analyticsData.overview.totalAmount >= 0 ? '#059669' : '#ea580c'};
            color: ${analyticsData.overview.totalAmount >= 0 ? '#6ee7b7' : '#fdba74'};
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          ">
            ${analyticsData.overview.totalAmount >= 0 ? 'PROFITABLE PERIOD' : 'LOSS PERIOD'}
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
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      ">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${analyticsData.overview.totalDays}</div>
          <div style="font-size: 11px; color: #64748b;">Trading Days</div>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 22px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${analyticsData.overview.totalTrades.toLocaleString()}</div>
          <div style="font-size: 11px; color: #64748b;">Total Trades</div>
        </div>
        <div style="background: ${analyticsData.overview.totalAmount >= 0 ? '#f0fdf4' : '#fef2f2'}; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid ${analyticsData.overview.totalAmount >= 0 ? '#dcfce7' : '#fecaca'};">
          <div style="font-size: 22px; font-weight: bold; color: ${analyticsData.overview.totalAmount >= 0 ? '#22c55e' : '#ef4444'}; margin-bottom: 4px;">${formatCurrency(analyticsData.overview.totalAmount)}</div>
          <div style="font-size: 11px; color: #64748b;">Total P&L</div>
        </div>
        <div style="background: #fefce8; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #fef3c7;">
          <div style="font-size: 22px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${analyticsData.overview.winRate.toFixed(1)}%</div>
          <div style="font-size: 11px; color: #64748b;">Win Rate</div>
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
          <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">Total Gains</h4>
          <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${formatCurrency(analyticsData.overview.totalGains)}</div>
          <div style="font-size: 12px; color: #16a34a; margin-top: 4px;">
            Average Daily: ${formatCurrency(analyticsData.overview.avgDailyAmount)}
          </div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca;">
          <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px;">Total Losses</h4>
          <div style="font-size: 20px; font-weight: bold; color: #ef4444;">${formatCurrency(analyticsData.overview.totalLosses)}</div>
          <div style="font-size: 12px; color: #dc2626; margin-top: 4px;">
            Risk/Reward: ${analyticsData.overview.totalLosses > 0 ? (analyticsData.overview.totalGains / analyticsData.overview.totalLosses).toFixed(2) : '∞'}
          </div>
        </div>
      </div>

      <!-- Top Performing Symbols -->
      ${analyticsData.topSymbols.length > 0 ? `
        <div style="
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 6px;
        ">
          <h4 style="margin: 0 0 12px 0; color: #334155; font-size: 16px;">Top Performing Symbols</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
            ${analyticsData.topSymbols.slice(0, 6).map((symbol, index) => `
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
                  <div style="font-size: 11px; color: #64748b;">${symbol.total_trades} trades • ${symbol.days_traded} days</div>
                </div>
                <div style="
                  font-weight: bold;
                  color: ${(typeof symbol.total_amount === 'number' ? symbol.total_amount : parseFloat(symbol.total_amount || '0')) >= 0 ? '#22c55e' : '#ef4444'};
                ">
                  ${formatCurrency(typeof symbol.total_amount === 'number' ? symbol.total_amount : parseFloat(symbol.total_amount || '0'))}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Best & Worst Days -->
      ${analyticsData.overview.bestDay && analyticsData.overview.worstDay ? `
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        ">
          <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px solid #dcfce7;">
            <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">🏆 Best Trading Day</h4>
            <div style="font-size: 16px; font-weight: bold; color: #22c55e; margin-bottom: 4px;">
              ${formatCurrency(typeof analyticsData.overview.bestDay.total_amount === 'number' ? analyticsData.overview.bestDay.total_amount : parseFloat(analyticsData.overview.bestDay.total_amount || '0'))}
            </div>
            <div style="font-size: 12px; color: #16a34a;">
              ${formatDate(analyticsData.overview.bestDay.trade_date)} • ${analyticsData.overview.bestDay.total_trades} trades
            </div>
          </div>
          <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca;">
            <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px;">⚠️ Worst Trading Day</h4>
            <div style="font-size: 16px; font-weight: bold; color: #ef4444; margin-bottom: 4px;">
              ${formatCurrency(typeof analyticsData.overview.worstDay.total_amount === 'number' ? analyticsData.overview.worstDay.total_amount : parseFloat(analyticsData.overview.worstDay.total_amount || '0'))}
            </div>
            <div style="font-size: 12px; color: #dc2626;">
              ${formatDate(analyticsData.overview.worstDay.trade_date)} • ${analyticsData.overview.worstDay.total_trades} trades
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Recent Daily Performance -->
      ${analyticsData.recentSummaries.length > 0 ? `
        <div style="
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 20px;
        ">
          <h4 style="
            margin: 0;
            padding: 15px;
            background: #334155;
            color: white;
            font-size: 16px;
          ">Recent Daily Performance (Last ${Math.min(analyticsData.recentSummaries.length, 10)} days)</h4>
          
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          ">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Date</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">P&L</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Trades</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Avg/Trade</th>
              </tr>
            </thead>
            <tbody>
              ${analyticsData.recentSummaries.slice(0, 10).map((day, index) => `
                <tr style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; ${(typeof day.total_amount === 'number' ? day.total_amount : parseFloat(day.total_amount || '0')) >= 0 ? 'border-left: 4px solid #22c55e;' : 'border-left: 4px solid #ef4444;'}">
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: ${(typeof day.total_amount === 'number' ? day.total_amount : parseFloat(day.total_amount || '0')) >= 0 ? '#22c55e' : '#ef4444'};
                      "></div>
                      <span style="font-weight: bold;">${formatDate(day.trade_date)}</span>
                    </div>
                  </td>
                  <td style="
                    padding: 10px 8px;
                    border-bottom: 1px solid #e2e8f0;
                    font-weight: bold;
                    color: ${(typeof day.total_amount === 'number' ? day.total_amount : parseFloat(day.total_amount || '0')) >= 0 ? '#22c55e' : '#ef4444'};
                  ">
                    ${formatCurrency(typeof day.total_amount === 'number' ? day.total_amount : parseFloat(day.total_amount || '0'))}
                  </td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569;">
                    ${day.total_trades}
                  </td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569;">
                    ${formatCurrency(typeof day.average_amount === 'number' ? day.average_amount : parseFloat(day.average_amount || '0'))}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: 11px;
        color: #64748b;
      ">
        Generated by DelHub Trading Analytics<br>
        ${getCurrentDateTime()} ET
      </div>
    </div>
  `;

  return container;
}
