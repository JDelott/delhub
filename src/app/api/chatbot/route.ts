import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


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
    trades: SimpleTradeEntry[];
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

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      tradeDetected: !!tradeData,
      trade: tradeData
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Simple trade entry interface that matches the store
interface SimpleTradeEntry {
  symbol: string;
  amount: number;
  notes?: string;
}

function parseTradeFromMessage(message: string): SimpleTradeEntry | null {
  console.log('🔍 Parsing message:', message);
  
  // Extract symbol (case insensitive, 2-5 characters)
  const symbolMatch = message.match(/\b([A-Za-z]{2,5})\b/);
  if (!symbolMatch) {
    console.log('❌ No symbol found');
    return null;
  }
  const symbol = symbolMatch[1].toUpperCase();
  console.log('✅ Found symbol:', symbol);

  // Extract dollar amount (positive or negative)
  let amount = 0;
  
  // First try to match explicit dollar amounts like $5, $10.50
  const explicitAmountMatch = message.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
  if (explicitAmountMatch) {
    amount = parseFloat(explicitAmountMatch[1]);
    console.log('✅ Found explicit amount:', amount);
    
    // Check for negative indicators
    if (/\b(loss|lost|down|negative|minus)\b/i.test(message)) {
      amount = -amount;
      console.log('📉 Made amount negative:', amount);
    }
  } else {
    // Try to match written amounts like "a dollar", "5 dollars", "ten dollars"
    const writtenAmountMatch = message.match(/\b(?:a\s+dollar|(\d+(?:\.\d{1,2})?)\s+dollars?|one\s+dollar|two\s+dollars?|three\s+dollars?|four\s+dollars?|five\s+dollars?|ten\s+dollars?)\b/i);
    if (writtenAmountMatch) {
      if (message.includes('a dollar') || message.includes('one dollar')) {
        amount = 1;
      } else if (message.includes('two dollar')) {
        amount = 2;
      } else if (message.includes('three dollar')) {
        amount = 3;
      } else if (message.includes('four dollar')) {
        amount = 4;
      } else if (message.includes('five dollar')) {
        amount = 5;
      } else if (message.includes('ten dollar')) {
        amount = 10;
      } else if (writtenAmountMatch[1]) {
        amount = parseFloat(writtenAmountMatch[1]);
      }
      console.log('✅ Found written amount:', amount);
      
      // Check for negative indicators
      if (/\b(loss|lost|down|negative|minus)\b/i.test(message)) {
        amount = -amount;
        console.log('📉 Made amount negative:', amount);
      }
    } else {
      console.log('❌ No amount found');
    }
  }
  
  // If no amount found, return null
  if (amount === 0) {
    console.log('❌ Amount is zero, returning null');
    return null;
  }

  const tradeData = {
    symbol,
    amount,
    notes: message.trim()
  };
  
  console.log('🎯 Parsed trade data:', tradeData);
  return tradeData;
}

function getNextFriday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
  return nextFriday;
}
