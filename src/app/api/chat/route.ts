import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { postgresService } from '@/lib/postgres-service';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory }: ChatRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get trading analytics data for context
    const tradingContext = await getTradingContext();

    // Create system prompt with trading context
    const systemPrompt = `You are DelHub Assistant, a professional trading analytics AI assistant. You help traders analyze their performance, understand market patterns, and make informed trading decisions.

## Your Capabilities:
- Analyze trading performance and provide insights
- Answer questions about options trading strategies
- Help interpret trading data and analytics
- Provide market analysis and trading advice
- Explain trading concepts and terminology

## Current Trading Context:
${tradingContext}

## Guidelines:
- Be professional, knowledgeable, and helpful
- Use data from the user's actual trading performance when available
- Provide actionable insights and recommendations
- Explain complex trading concepts in understandable terms
- Always consider risk management in your advice
- If you don't have specific data, acknowledge it and provide general guidance

## DelHub Branding:
- You represent DelHub, a sophisticated options trading platform
- Maintain a professional yet approachable tone
- Focus on empowering traders with data-driven insights`;

    // Prepare conversation history for Claude
    const messages = conversationHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message
    messages.push({
      role: 'user' as const,
      content: message
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages
    });

    const assistantResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function getTradingContext(): Promise<string> {
  try {
    // Check database connection
    const isConnected = await postgresService.testConnection();
    if (!isConnected) {
      return "Trading data is currently unavailable - database connection failed.";
    }

    // Get recent trading data
    const [
      recentSummaries,
      monthlyPerformance,
      topSymbols
    ] = await Promise.all([
      postgresService.getDailySummaries(undefined, undefined, 30), // Last 30 days
      postgresService.getMonthlyPerformance(6), // Last 6 months
      postgresService.getTopSymbols(10) // Top 10 symbols
    ]);

    if (recentSummaries.length === 0) {
      return "No trading data available yet. The user hasn't logged any trading sessions to the database.";
    }

    // Calculate overall statistics
    const totalDays = recentSummaries.length;
    const totalTrades = recentSummaries.reduce((sum, day) => sum + day.total_trades, 0);
    const totalAmount = recentSummaries.reduce((sum, day) => sum + parseFloat(day.total_amount.toString()), 0);
    const totalGains = recentSummaries.reduce((sum, day) => sum + parseFloat(day.total_gains.toString()), 0);
    const totalLosses = recentSummaries.reduce((sum, day) => sum + parseFloat(day.total_losses.toString()), 0);
    const avgDailyAmount = totalDays > 0 ? totalAmount / totalDays : 0;
    const winRate = recentSummaries.length > 0 ? 
      recentSummaries.filter(day => parseFloat(day.total_amount.toString()) > 0).length / recentSummaries.length * 100 : 0;

    // Get best and worst days
    const bestDay = recentSummaries.reduce((best, day) => 
      parseFloat(day.total_amount.toString()) > parseFloat(best.total_amount.toString()) ? day : best, 
      recentSummaries[0]
    );
    
    const worstDay = recentSummaries.reduce((worst, day) => 
      parseFloat(day.total_amount.toString()) < parseFloat(worst.total_amount.toString()) ? day : worst, 
      recentSummaries[0]
    );

    // Format context
    let context = `## User's Trading Performance Data:

### Overall Statistics (Last ${totalDays} days):
- Total Trading Days: ${totalDays}
- Total Trades: ${totalTrades}
- Total P&L: $${totalAmount.toFixed(2)}
- Average Daily P&L: $${avgDailyAmount.toFixed(2)}
- Win Rate: ${winRate.toFixed(1)}%
- Total Gains: $${totalGains.toFixed(2)}
- Total Losses: $${totalLosses.toFixed(2)}
- Risk/Reward Ratio: ${totalLosses > 0 ? (totalGains / totalLosses).toFixed(2) : '∞'}

### Best Trading Day:
- Date: ${new Date(bestDay.trade_date).toLocaleDateString()}
- P&L: $${parseFloat(bestDay.total_amount.toString()).toFixed(2)}
- Trades: ${bestDay.total_trades}

### Worst Trading Day:
- Date: ${new Date(worstDay.trade_date).toLocaleDateString()}
- P&L: $${parseFloat(worstDay.total_amount.toString()).toFixed(2)}
- Trades: ${worstDay.total_trades}`;

    // Add top symbols if available
    if (topSymbols.length > 0) {
      context += `\n\n### Top Performing Symbols:`;
      topSymbols.slice(0, 5).forEach((symbol, index) => {
        context += `\n${index + 1}. ${symbol.symbol}: $${parseFloat(symbol.total_amount.toString()).toFixed(2)} (${symbol.total_trades} trades over ${symbol.days_traded} days)`;
      });
    }

    // Add recent performance trend
    if (recentSummaries.length >= 5) {
      const recentDays = recentSummaries.slice(0, 5);
      context += `\n\n### Recent Performance (Last 5 days):`;
      recentDays.forEach(day => {
        const date = new Date(day.trade_date).toLocaleDateString();
        const amount = parseFloat(day.total_amount.toString());
        context += `\n- ${date}: $${amount.toFixed(2)} (${day.total_trades} trades)`;
      });
    }

    // Add monthly performance if available
    if (monthlyPerformance.length > 0) {
      context += `\n\n### Monthly Performance:`;
      monthlyPerformance.slice(0, 3).forEach(month => {
        const monthName = new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        context += `\n- ${monthName}: $${parseFloat(month.total_amount.toString()).toFixed(2)} (${month.trading_days} days, ${month.total_trades} trades)`;
      });
    }

    return context;

  } catch (error) {
    console.error('Error getting trading context:', error);
    return "Trading data is currently unavailable due to a system error.";
  }
}
