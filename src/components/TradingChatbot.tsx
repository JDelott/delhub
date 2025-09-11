'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MicrophoneIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MicrophoneIcon as MicrophoneIconSolid } from '@heroicons/react/24/solid';
import { useTradeStore } from '@/store/tradeStore';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'trade' | 'system';
}


export default function TradingChatbot() {
  // Trade store
  const { trades, addTrade, getTradeStats } = useTradeStore();
  const tradeStats = getTradeStats();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your trade counter. Just say the symbol and dollar amount like 'SRPT $2' or 'AAPL $50' and I'll track your running totals!",
      sender: 'assistant',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening for longer phrases
      recognitionRef.current.interimResults = true; // Show interim results
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update input with interim results for visual feedback
        setInputValue(finalTranscript + interimTranscript);
        
        // If we have a final result, stop listening and send
        if (finalTranscript) {
          setIsListening(false);
          recognitionRef.current?.stop();
          // Auto-send the final transcribed message
          setTimeout(() => {
            // Call sendMessage directly with the transcript
            const content = finalTranscript.trim();
            if (!content) return;

            const userMessage: Message = {
              id: Date.now().toString(),
              content,
              sender: 'user',
              timestamp: new Date(),
              type: 'text'
            };

            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsLoading(true);

            // Process the message (simplified version)
            fetch('/api/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                message: content,
                context: {
                  trades: trades,
                  totalPL: tradeStats.totalAmount,
                  messageHistory: messages.slice(-10)
                }
              })
            }).then(response => response.json())
            .then(result => {
              console.log('🎤 Speech recognition API response:', result);
              if (result.success) {
                const assistantMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  content: result.response,
                  sender: 'assistant',
                  timestamp: new Date(),
                  type: result.tradeDetected ? 'trade' : 'text'
                };
                setMessages(prev => [...prev, assistantMessage]);
                if (result.trade) {
                  console.log('🎤🎯 Adding trade from speech:', result.trade);
                  addTrade(result.trade);
                } else {
                  console.log('🎤❌ No trade detected from speech');
                }
              }
            }).catch(error => {
              console.error('Chatbot error:', error);
            }).finally(() => {
              setIsLoading(false);
            });
          }, 100);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [addTrade, trades, tradeStats.totalAmount, messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Send whatever we have so far if there's content
      if (inputValue.trim()) {
        setTimeout(() => sendMessage(inputValue.trim()), 100);
      }
    }
  };

  const sendMessage = useCallback(async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content,
          context: {
            trades: trades,
            totalPL: tradeStats.totalAmount,
            messageHistory: messages.slice(-10) // Last 10 messages for context
          }
        })
      });

      const result = await response.json();
      
      console.log('🤖 Chatbot API response:', result);
      
      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.response,
          sender: 'assistant',
          timestamp: new Date(),
          type: result.tradeDetected ? 'trade' : 'text'
        };

        setMessages(prev => [...prev, assistantMessage]);

        // If a trade was detected, add it to our trades list
        if (result.trade) {
          console.log('🎯 Adding trade to store:', result.trade);
          addTrade(result.trade);
        } else {
          console.log('❌ No trade detected in response');
        }
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, trades, tradeStats.totalAmount, addTrade]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalTradeValue = () => {
    return trades.reduce((sum, trade) => sum + trade.amount, 0);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hi! I'm your trade counter. Just say the symbol and dollar amount like 'SRPT $2' or 'AAPL $50' and I'll track your running totals!",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'system'
      }
    ]);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleExpanded}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open trading assistant"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        
        {/* Trade counter badge */}
        {trades.length > 0 && (
          <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
            {trades.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Trade Counter</h3>
          <div className="text-blue-100 text-sm flex items-center gap-4">
            <span>{trades.length} entries</span>
            <span className={tradeStats.totalAmount >= 0 ? 'text-green-200' : 'text-red-200'}>
              {formatCurrency(tradeStats.totalAmount)} total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="text-white hover:text-blue-200 transition-colors p-1 text-xs bg-blue-800 hover:bg-blue-900 rounded px-2 py-1"
            aria-label="Clear chat"
          >
            Clear Chat
          </button>
          <button
            onClick={toggleExpanded}
            className="text-white hover:text-blue-200 transition-colors p-1"
            aria-label="Close trading assistant"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : message.type === 'trade'
                  ? 'bg-green-50 text-green-800 border border-green-200 rounded-bl-none'
                  : message.type === 'system'
                  ? 'bg-gray-50 text-gray-600 border border-gray-200 rounded-bl-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.content}
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? 'Listening... (click mic to stop)' : 'Type a message or use voice...'}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                isListening 
                  ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 animate-pulse'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600 focus:ring-gray-500'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? (
              <MicrophoneIconSolid className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Quick stats */}
        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>Total entries: {trades.length}</span>
          <span>Total: {formatCurrency(tradeStats.totalAmount)}</span>
        </div>
        
        {/* Listening indicator */}
        {isListening && (
          <div className="mt-2 flex items-center justify-center text-xs text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Recording... Click microphone to stop
          </div>
        )}
      </div>
    </div>
  );
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
