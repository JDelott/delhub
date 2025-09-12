interface AnalyticsData {
  overview: {
    totalDays: number;
    totalTrades: number;
    totalAmount: number;
    avgDailyAmount: number;
    totalGains: number;
    totalLosses: number;
    totalCommissions?: number;
    totalNetAmount?: number;
    avgDailyNetAmount?: number;
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
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
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
    // Handle both ISO dates (2025-09-11T07:00:00.000Z) and simple dates (2025-09-11)
    const date = dateString.includes('T') 
      ? new Date(dateString) 
      : new Date(dateString + 'T12:00:00');
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
  };

  const formatMonth = (monthString: string): string => {
    // Handle both ISO dates and simple dates
    const date = monthString.includes('T') 
      ? new Date(monthString) 
      : new Date(monthString + 'T12:00:00');
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
  };

  const getCurrentDateTime = (): string => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles'
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
          text-align: center;
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 8px;
        ">
          ${analyticsData.overview.totalDays === 1 
            ? `Single Day Analysis • ${analyticsData.recentSummaries.length > 0 ? formatDate(analyticsData.recentSummaries[0].trade_date) : 'Current Period'}`
            : `${analyticsData.overview.totalDays} Day Period • ${analyticsData.recentSummaries.length > 0 ? formatDate(analyticsData.recentSummaries[analyticsData.recentSummaries.length - 1].trade_date) + ' - ' + formatDate(analyticsData.recentSummaries[0].trade_date) : 'Multi-Day Analysis'}`
          }
        </div>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        ">
          <div style="
            background: ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? 'rgba(5, 150, 105, 0.3)' : 'rgba(234, 88, 12, 0.3)'};
            border: 1px solid ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? '#059669' : '#ea580c'};
            color: ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? '#6ee7b7' : '#fdba74'};
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          ">
            ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? 'NET PROFITABLE PERIOD' : 'NET LOSS PERIOD'}
          </div>
          
          <div style="
            font-size: 13px;
            color: #94a3b8;
          ">
            Generated: ${getCurrentDateTime()} PT
          </div>
        </div>
      </div>

      <!-- Summary Grid -->
      <div style="
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin-bottom: 20px;
        page-break-inside: avoid;
      ">
        <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 20px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${analyticsData.overview.totalDays}</div>
          <div style="font-size: 10px; color: #64748b;">Trading Days</div>
        </div>
        <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 20px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${analyticsData.overview.totalTrades.toLocaleString()}</div>
          <div style="font-size: 10px; color: #64748b;">Total Trades</div>
        </div>
        <div style="background: ${analyticsData.overview.totalAmount >= 0 ? '#f0fdf4' : '#fef2f2'}; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid ${analyticsData.overview.totalAmount >= 0 ? '#dcfce7' : '#fecaca'};">
          <div style="font-size: 20px; font-weight: bold; color: ${analyticsData.overview.totalAmount >= 0 ? '#22c55e' : '#ef4444'}; margin-bottom: 4px;">${formatCurrency(analyticsData.overview.totalAmount)}</div>
          <div style="font-size: 10px; color: #64748b;">Gross P&L</div>
        </div>
        <div style="background: ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? '#f0fdf4' : '#fef2f2'}; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? '#dcfce7' : '#fecaca'}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size: 20px; font-weight: bold; color: ${(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount) >= 0 ? '#22c55e' : '#ef4444'}; margin-bottom: 4px;">${formatCurrency(analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount)}</div>
          <div style="font-size: 10px; color: #64748b; font-weight: bold;">Net P&L</div>
        </div>
        <div style="background: #fefce8; padding: 12px; border-radius: 6px; text-align: center; border: 1px solid #fef3c7;">
          <div style="font-size: 20px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${analyticsData.overview.winRate.toFixed(1)}%</div>
          <div style="font-size: 10px; color: #64748b;">Win Rate</div>
        </div>
      </div>

      <!-- Commission Analysis -->
      ${analyticsData.overview.totalCommissions ? `
        <div style="
          background: #fef7ec;
          border: 1px solid #fed7aa;
          padding: 12px;
          margin-bottom: 20px;
          border-radius: 6px;
          text-align: center;
          page-break-inside: avoid;
        ">
          <div style="font-size: 14px; color: #ea580c; font-weight: bold; margin-bottom: 6px;">Commission Analysis</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div>
              <div style="font-size: 16px; font-weight: bold; color: #ea580c;">${formatCurrency(analyticsData.overview.totalCommissions)}</div>
              <div style="font-size: 10px; color: #9a3412;">Total Commissions</div>
            </div>
            <div>
              <div style="font-size: 16px; font-weight: bold; color: #ea580c;">${formatCurrency(analyticsData.overview.totalAmount - (analyticsData.overview.totalNetAmount || analyticsData.overview.totalAmount))}</div>
              <div style="font-size: 10px; color: #9a3412;">Commission Impact</div>
            </div>
            <div>
              <div style="font-size: 16px; font-weight: bold; color: #ea580c;">${formatCurrency((analyticsData.overview.totalCommissions || 0) / analyticsData.overview.totalTrades)}</div>
              <div style="font-size: 10px; color: #9a3412;">Avg per Trade</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Additional Metrics -->
      <div style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
        page-break-inside: avoid;
      ">
        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e0e7ff;">
          <div style="font-size: 16px; font-weight: bold; color: #0ea5e9; margin-bottom: 4px;">${formatCurrency(analyticsData.overview.avgDailyNetAmount || analyticsData.overview.avgDailyAmount)}</div>
          <div style="font-size: 11px; color: #64748b;">Avg Daily Net P&L</div>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #dcfce7;">
          <div style="font-size: 16px; font-weight: bold; color: #22c55e; margin-bottom: 4px;">${formatCurrency(analyticsData.overview.totalGains)}</div>
          <div style="font-size: 11px; color: #64748b;">Total Gains</div>
        </div>
        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #fecaca;">
          <div style="font-size: 16px; font-weight: bold; color: #ef4444; margin-bottom: 4px;">${formatCurrency(Math.abs(analyticsData.overview.totalLosses))}</div>
          <div style="font-size: 11px; color: #64748b;">Total Losses</div>
        </div>
      </div>

      <!-- Performance Breakdown -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
        page-break-inside: avoid;
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
          page-break-inside: avoid;
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
          page-break-inside: avoid;
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

      <!-- Monthly Performance -->
      ${analyticsData.monthlyPerformance.length > 0 ? `
        <div style="
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 20px;
          page-break-inside: avoid;
          page-break-before: auto;
        ">
          <h4 style="
            margin: 0;
            padding: 15px;
            background: #334155;
            color: white;
            font-size: 16px;
          ">Monthly Performance</h4>
          
          <div style="padding: 15px;">
            ${analyticsData.monthlyPerformance.slice(0, 6).map((month, index) => {
              const netAmount = month.total_net_amount || month.total_amount;
              const commissions = month.total_commissions || 0;
              return `
                <div style="
                  background: ${netAmount >= 0 ? '#f0f9ff' : '#fef2f2'};
                  border-left: 4px solid ${netAmount >= 0 ? '#3b82f6' : '#ef4444'};
                  padding: 12px;
                  margin-bottom: ${index < analyticsData.monthlyPerformance.slice(0, 6).length - 1 ? '8px' : '0'};
                  border-radius: 4px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <div style="
                      font-weight: bold;
                      color: #0f172a;
                      margin-bottom: 4px;
                    ">${formatMonth(month.month)}</div>
                    <div style="
                      font-size: 12px;
                      color: #64748b;
                    ">${month.trading_days} days • ${month.total_trades.toLocaleString()} trades • ${formatCurrency(commissions)} commissions</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="margin-bottom: 2px;">
                      <span style="font-size: 10px; color: #64748b;">Gross: </span>
                      <span style="
                        font-size: 12px;
                        font-weight: bold;
                        color: ${month.total_amount >= 0 ? '#22c55e' : '#ef4444'};
                      ">${formatCurrency(month.total_amount)}</span>
                    </div>
                    <div>
                      <span style="font-size: 10px; color: #64748b;">Net: </span>
                      <span style="
                        font-size: 16px;
                        font-weight: bold;
                        color: ${netAmount >= 0 ? '#3b82f6' : '#ef4444'};
                      ">${formatCurrency(netAmount)}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
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
          page-break-inside: avoid;
          page-break-before: auto;
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
              ${analyticsData.recentSummaries.slice(0, 10).map((day, index) => {
                const netAmount = day.total_net_amount ?? day.total_amount;
                const commissions = day.total_commissions ?? 0;
                return `
                  <tr style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; ${netAmount >= 0 ? 'border-left: 4px solid #3b82f6;' : 'border-left: 4px solid #ef4444;'}">
                    <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="
                          width: 8px;
                          height: 8px;
                          border-radius: 50%;
                          background: ${netAmount >= 0 ? '#3b82f6' : '#ef4444'};
                        "></div>
                        <span style="font-weight: bold;">${formatDate(day.trade_date)}</span>
                        <span style="font-size: 10px; color: #64748b;">• ${formatCurrency(commissions)} comm</span>
                      </div>
                    </td>
                    <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">
                      <div style="text-align: right;">
                        <div style="margin-bottom: 2px;">
                          <span style="font-size: 10px; color: #64748b;">Gross: </span>
                          <span style="
                            font-size: 12px;
                            font-weight: bold;
                            color: ${day.total_amount >= 0 ? '#22c55e' : '#ef4444'};
                          ">${formatCurrency(typeof day.total_amount === 'number' ? day.total_amount : parseFloat(day.total_amount || '0'))}</span>
                        </div>
                        <div>
                          <span style="font-size: 10px; color: #64748b;">Net: </span>
                          <span style="
                            font-size: 14px;
                            font-weight: bold;
                            color: ${netAmount >= 0 ? '#3b82f6' : '#ef4444'};
                          ">${formatCurrency(typeof netAmount === 'number' ? netAmount : parseFloat(netAmount?.toString() || '0'))}</span>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: center;">
                      ${day.total_trades}
                    </td>
                    <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: center;">
                      ${formatCurrency(typeof day.average_net_amount === 'number' ? day.average_net_amount : parseFloat(day.average_net_amount?.toString() || day.average_amount?.toString() || '0'))}
                    </td>
                  </tr>
                `;
              }).join('')}
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
        ${getCurrentDateTime()} PT
      </div>
    </div>
  `;

  return container;
}
