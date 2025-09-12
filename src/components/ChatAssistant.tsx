'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm DelHub Assistant, your AI-powered trading analytics companion. I can help you analyze your trading performance, understand market patterns, and provide insights based on your actual trading data.\n\nHow can I assist you with your trading today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages
        }),
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.response,
          timestamp: result.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const suggestedPrompts = [
    "What are my best performing symbols?",
    "What's my current win rate this week?",
    "Calculate today's commissions at $0.32 per trade"
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      {/* Subtle branding in corner */}
      <div className="absolute top-4 left-4 z-10">
        <div className="text-xs text-gray-400 font-medium tracking-wide">
          DelHub AI Assistant
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {messages.map((message, index) => (
          <div key={index} className={`group ${message.role === 'user' ? 'bg-gray-50 -mx-6 px-6 py-6' : ''}`}>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-white font-semibold text-sm">U</span>
                ) : (
                  <SparklesIcon className="h-5 w-5 text-white" />
                )}
              </div>
              
              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {message.role === 'user' ? 'You' : 'DelHub Assistant'}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="group">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    DelHub Assistant
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>
      </div>


      {/* Input */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 pb-6 relative">
          {/* Input Container */}
          <div className="relative bg-white rounded-3xl border border-gray-200 shadow-sm">
            {/* Quick Actions Dropdown - Overlays above */}
            {showQuickActions && (
              <div className="absolute bottom-full mb-2 left-0 right-0 p-3 bg-white rounded-xl border border-gray-200 shadow-lg z-10">
                <div className="grid grid-cols-1 gap-1">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSuggestedPrompt(prompt);
                        setShowQuickActions(false);
                      }}
                      className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-all duration-150"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-stretch h-12">
              {/* Plus Button */}
              <div className="flex items-center justify-center w-12">
                <button
                  type="button"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Text Input */}
              <div className="flex-1 flex items-center">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  className="w-full bg-transparent text-base resize-none focus:outline-none placeholder-gray-500 min-h-[24px] max-h-32 leading-6"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              
              {/* Send Button */}
              <div className="flex items-center justify-center w-12">
                {inputValue.trim() && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:text-gray-300 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-3 text-xs text-gray-500">
            DelHub can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}
