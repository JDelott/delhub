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
    const systemPrompt = `You are a simple trade counter assistant. Your job is to help traders log stock symbols with dollar amounts quickly.

## Current Context:
- Total entries logged: ${context.trades.length}
- Current total: $${context.totalPL.toFixed(2)}

## Simple Logging Format:
Users will say things like:
- "SRPT $2" (SRPT with $2 amount)
- "AAPL $50" (AAPL with $50 amount)  
- "TSLA $25 profit" (TSLA with $25 amount)
- "NVDA $10 loss" (NVDA with -$10 amount)
- "BAX $100 3 contracts" (BAX with $100, 3 contracts)
- "SRPT $50 16 cent commission" (SRPT with $50, $0.16 commission per contract)

## Commission Handling:
- Default: $0.16 per contract, 2 contracts (total $0.32 commission)
- Users can specify different rates: "20 cent commission" or "0.20 commission"
- Users can specify contract count: "3 contracts" or "5x"
- Show both gross and net amounts when confirming trades

## Response Guidelines:
- Keep responses very brief and friendly
- Confirm what you logged with net amount: "Logged SRPT +$2.00 gross, +$1.68 net (after $0.32 commission)"
- Don't ask for additional details unless the format is completely unclear
- Focus on quick acknowledgment and running totals
- If you detect a trade, just confirm it was logged

## Your Role:
You're a simple counter, not a complex trading analyst. Keep it fast and simple!`;

    // Prepare conversation history for Claude
    const conversationHistory = context.messageHistory.slice(-6).map(msg => ({
      role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content
    }));

    // Add current message
    conversationHistory.push({
      role: 'user' as const,
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
  commissionRate?: number;
  contractCount?: number;
}

function parseTradeFromMessage(message: string): SimpleTradeEntry | null {
  console.log('🔍 Parsing message:', message);
  
  // First, try to fix common voice transcription patterns
  let cleanedMessage = message;
  
  // Fix common letter sound confusions
  const letterSoundFixes: Record<string, string> = {
    // "B" often gets transcribed as other sounds
    'dax': 'BAX',  // "D A X" when trying to say "B A X"
    'bax': 'BAX',  // Sometimes it gets it right
    'vax': 'BAX',  // "V" sound confusion
    'pax': 'BAX',  // "P" sound confusion
    // Add other common confusions
    'see': 'C',
    'bee': 'B', 
    'dee': 'D',
    'pee': 'P',
    'tee': 'T'
  };
  
  // Apply letter sound fixes
  for (const [wrong, correct] of Object.entries(letterSoundFixes)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    cleanedMessage = cleanedMessage.replace(regex, correct);
  }
  
  // Pattern 1: "srpt4" -> "SRPT $4" (symbol followed immediately by number)
  const voicePattern1 = cleanedMessage.match(/\b([A-Za-z]{2,5})(\d+(?:\.\d{1,2})?)\b/);
  if (voicePattern1) {
    const [, symbol, amount] = voicePattern1;
    cleanedMessage = cleanedMessage.replace(voicePattern1[0], `${symbol} $${amount}`);
    console.log('🎤 Fixed voice transcription (pattern 1):', cleanedMessage);
  }
  
  // Pattern 2: Spaced out letters with number - handle 2-5 letter symbols
  // "b a x 5" -> "BAX $5", "s r p t 4" -> "SRPT $4", "b a x $4" -> "BAX $4"
  const spacedLetterPatterns = [
    // 3 letters with optional $ and spaces: "b a x $4", "b a x 5", "b a x $ 4"
    /\b([a-z])\s+([a-z])\s+([a-z])(?:\s+\$?\s*(\d+(?:\.\d{1,2})?))\b/i,
    // 4 letters: "s r p t 4", "s r p t $4"
    /\b([a-z])\s+([a-z])\s+([a-z])\s+([a-z])(?:\s+\$?\s*(\d+(?:\.\d{1,2})?))\b/i,
    // 5 letters: "a a p l e 50", "a a p l e $50"
    /\b([a-z])\s+([a-z])\s+([a-z])\s+([a-z])\s+([a-z])(?:\s+\$?\s*(\d+(?:\.\d{1,2})?))\b/i,
    // 2 letters: "g e $5", "g e 5"  
    /\b([a-z])\s+([a-z])(?:\s+\$?\s*(\d+(?:\.\d{1,2})?))\b/i
  ];
  
  for (const pattern of spacedLetterPatterns) {
    const match = cleanedMessage.match(pattern);
    if (match) {
      const amount = match[match.length - 1]; // Last item is amount
      const letters = match.slice(1, -1).filter(Boolean); // All except the last (amount), remove nulls
      const symbol = letters.join('').toUpperCase();
      cleanedMessage = cleanedMessage.replace(match[0], `${symbol} $${amount}`);
      console.log('🎤 Fixed spaced letters pattern:', cleanedMessage);
      break;
    }
  }
  
  // Pattern 2b: Handle spaced letters WITHOUT amount (like "b a x" alone)
  // Then look for amount elsewhere in message
  const spacedLettersOnly = cleanedMessage.match(/\b([a-z])\s+([a-z])(?:\s+([a-z]))?(?:\s+([a-z]))?(?:\s+([a-z]))?\b/i);
  if (spacedLettersOnly && !cleanedMessage.includes('$')) {
    const letters = spacedLettersOnly.slice(1).filter(Boolean); // Remove nulls
    const symbol = letters.join('').toUpperCase();
    
    // Look for amount separately in the message
    const amountInMessage = cleanedMessage.match(/\$?(\d+(?:\.\d{1,2})?)/);
    if (amountInMessage) {
      cleanedMessage = `${symbol} $${amountInMessage[1]}`;
      console.log('🎤 Fixed spaced letters + separate amount:', cleanedMessage);
    }
  }
  
  // Pattern 3: "SYMBOL NUMBER" -> "SYMBOL $NUMBER" (simple format without dollars)
  const simplePattern = cleanedMessage.match(/\b([A-Za-z]{2,5})\s+(\d+(?:\.\d{1,2})?)\b/);
  if (simplePattern && !cleanedMessage.includes('$')) {
    const [, symbol, amount] = simplePattern;
    cleanedMessage = cleanedMessage.replace(simplePattern[0], `${symbol} $${amount}`);
    console.log('🎤 Fixed simple format:', cleanedMessage);
  }
  
  // Pattern 4: "apple 50" or "tesla 25" -> "AAPL $50", "TSLA $25" (company names)
  const companyMappings: Record<string, string> = {
    'apple': 'AAPL',
    'tesla': 'TSLA', 
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'amazon': 'AMZN',
    'meta': 'META',
    'nvidia': 'NVDA'
  };
  
  for (const [company, symbol] of Object.entries(companyMappings)) {
    const companyPattern = new RegExp(`\\b${company}\\s+(\\d+(?:\\.\\d{1,2})?)\\b`, 'i');
    const match = cleanedMessage.match(companyPattern);
    if (match) {
      cleanedMessage = cleanedMessage.replace(match[0], `${symbol} $${match[1]}`);
      console.log('🎤 Fixed company name transcription:', cleanedMessage);
      break;
    }
  }
  
  // Extract symbol (case insensitive, 2-5 characters)
  const symbolMatch = cleanedMessage.match(/\b([A-Za-z]{2,5})\b/);
  if (!symbolMatch) {
    console.log('❌ No symbol found');
    return null;
  }
  const symbol = symbolMatch[1].toUpperCase();
  console.log('✅ Found symbol:', symbol);

  // Extract dollar amount (positive or negative)
  let amount = 0;
  
  // First try to match explicit dollar amounts like $5, $10.50
  const explicitAmountMatch = cleanedMessage.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
  if (explicitAmountMatch) {
    amount = parseFloat(explicitAmountMatch[1]);
    console.log('✅ Found explicit amount:', amount);
    
    // Check for negative indicators
    if (/\b(loss|lost|down|negative|minus)\b/i.test(cleanedMessage)) {
      amount = -amount;
      console.log('📉 Made amount negative:', amount);
    }
  } else {
    // Try to match written amounts like "a dollar", "5 dollars", "ten dollars"
    const writtenAmountMatch = cleanedMessage.match(/\b(?:a\s+dollar|(\d+(?:\.\d{1,2})?)\s+dollars?|one\s+dollar|two\s+dollars?|three\s+dollars?|four\s+dollars?|five\s+dollars?|ten\s+dollars?)\b/i);
    if (writtenAmountMatch) {
      if (cleanedMessage.includes('a dollar') || cleanedMessage.includes('one dollar')) {
        amount = 1;
      } else if (cleanedMessage.includes('two dollar')) {
        amount = 2;
      } else if (cleanedMessage.includes('three dollar')) {
        amount = 3;
      } else if (cleanedMessage.includes('four dollar')) {
        amount = 4;
      } else if (cleanedMessage.includes('five dollar')) {
        amount = 5;
      } else if (cleanedMessage.includes('ten dollar')) {
        amount = 10;
      } else if (writtenAmountMatch[1]) {
        amount = parseFloat(writtenAmountMatch[1]);
      }
      console.log('✅ Found written amount:', amount);
      
      // Check for negative indicators
      if (/\b(loss|lost|down|negative|minus)\b/i.test(cleanedMessage)) {
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

  // Extract commission info if mentioned, otherwise use defaults
  let commissionRate = 0.16; // Default $0.16 per contract
  let contractCount = 2; // Default 2 contracts
  
  // Look for commission rate mentions like "0.16 commission" or "16 cent commission"
  const commissionMatch = cleanedMessage.match(/(?:(\d+(?:\.\d{1,2})?)\s*(?:cent|cents|commission))|(?:\$?(\d+(?:\.\d{1,2})?)\s*commission)/i);
  if (commissionMatch) {
    const commValue = parseFloat(commissionMatch[1] || commissionMatch[2]);
    if (commValue < 5) { // If less than 5, assume it's dollars
      commissionRate = commValue;
    } else { // Otherwise assume it's cents, convert to dollars
      commissionRate = commValue / 100;
    }
    console.log('✅ Found commission rate:', commissionRate);
  }
  
  // Look for contract count mentions like "3 contracts" or "5x"
  const contractMatch = cleanedMessage.match(/(?:(\d+)\s*(?:contracts?|x))|(?:(\d+)\s*(?:contract|contracts))/i);
  if (contractMatch) {
    contractCount = parseInt(contractMatch[1] || contractMatch[2]);
    console.log('✅ Found contract count:', contractCount);
  }

  const tradeData = {
    symbol,
    amount,
    notes: message.trim(), // Keep original message for notes
    commissionRate,
    contractCount
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
