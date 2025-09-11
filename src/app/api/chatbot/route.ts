import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TradeEntry {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  optionType: 'call' | 'put';
  contracts: number;
  premium: number;
  strike: number;
  expiration: string;
  timestamp: Date;
  profitLoss?: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'trade' | 'system';
}

interface ChatbotRequest {
  message: string;
  context: {
    trades: TradeEntry[];
    totalPL: number;
    messageHistory: Message[];
  };
}

export async function POST(request: Request) {
  try {
    const { message, context }: ChatbotRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create system prompt for simple stock quantity counting
    const systemPrompt = `You are a simple stock quantity counter assistant. Your job is to help traders log stock symbols with dollar amounts quickly.

## Current Context:
- Total entries logged: ${context.trades.length}
- Current total: $${context.totalPL.toFixed(2)}

## Simple Logging Format:
Users will say things like:
- "SRPT $2" (SRPT with $2 amount)
- "AAPL $50" (AAPL with $50 amount)  
- "TSLA $25 profit" (TSLA with $25 amount)
- "NVDA $10 loss" (NVDA with -$10 amount)

## Response Guidelines:
- Keep responses very brief and friendly
- Confirm what you logged: "Logged SRPT +$2.00"
- Don't ask for additional details unless the format is completely unclear
- Focus on quick acknowledgment and running totals
- If you detect a trade, just confirm it was logged

## Your Role:
You're a simple counter, not a complex trading analyst. Keep it fast and simple!`;

    // Prepare conversation history for Claude
    const conversationHistory = context.messageHistory.slice(-6).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant' as const,
      content: msg.content
    }));

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      system: systemPrompt,
      messages: conversationHistory
    });

    const assistantResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Attempt to parse trade information from the user message
    const tradeData = parseTradeFromMessage(message);
    
    // If we detected a trade, also try to extract P/L information
    let profitLoss: number | undefined;
    
    if (tradeData) {
      const plMatch = message.match(/(?:profit|loss|p[&\/]?l|made|lost|gained)\s*:?\s*\$?([0-9,]+(?:\.[0-9]{2})?)/i);
      if (plMatch) {
        profitLoss = parseFloat(plMatch[1].replace(/,/g, ''));
        // If it mentions "loss" or "lost", make it negative
        if (/loss|lost/i.test(message)) {
          profitLoss = -Math.abs(profitLoss);
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      tradeDetected: !!tradeData,
      trade: tradeData ? {
        ...tradeData,
        profitLoss
      } : null
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function parseTradeFromMessage(message: string): Omit<TradeEntry, 'id' | 'timestamp'> | null {
  // Ultra-simple parsing: just symbol and dollar amount
  
  // Extract symbol (first all-caps word, 2-5 characters)
  const symbolMatch = message.match(/\b([A-Z]{2,5})\b/);
  if (!symbolMatch) return null;
  const symbol = symbolMatch[1];

  // Extract dollar amount (positive or negative)
  let amount = 0;
  const amountMatch = message.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    
    // Check for negative indicators
    if (/\b(loss|lost|down|negative|minus)\b/i.test(message)) {
      amount = -amount;
    }
  }
  
  // If no amount found, return null
  if (amount === 0) return null;

  return {
    symbol,
    amount,
    notes: message.trim()
  };
}

function getNextFriday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
  return nextFriday;
}
