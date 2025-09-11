# Trading Chatbot Feature

A sophisticated AI-powered chatbot that helps you log and track your options trades using natural language and speech-to-text functionality.

## Features

### 🤖 AI-Powered Trade Logging
- **Natural Language Processing**: Describe your trades in plain English
- **Claude AI Integration**: Uses Anthropic's Claude for intelligent trade parsing
- **Smart Pattern Recognition**: Automatically extracts trade details from conversational input

### 🎤 Speech-to-Text
- **Voice Commands**: Log trades hands-free using voice input
- **Real-time Transcription**: Automatic speech recognition with visual feedback
- **Cross-browser Support**: Works with modern browsers supporting Web Speech API

### 📊 Comprehensive Trade Tracking
- **Persistent Storage**: All trades saved locally using Zustand with persistence
- **Profit/Loss Tracking**: Automatic P/L calculations and running totals
- **Trade Statistics**: Win rate, average wins/losses, premium tracking
- **Position Management**: Track open vs closed positions

### 💼 Portfolio Integration
- **Sync to Portfolio**: Optional integration with existing portfolio system
- **Database Storage**: Trades can be synced to your PostgreSQL database
- **Position Matching**: Links chatbot trades with portfolio positions

## Components

### Core Components
- **`TradingChatbot.tsx`** - Main chatbot UI with expandable design
- **`TradeDashboard.tsx`** - Comprehensive trade analytics dashboard
- **`tradeStore.ts`** - Zustand store for trade state management

### API Endpoints
- **`/api/chatbot`** - Claude AI integration for trade parsing and chat

### Services
- **`chatbot-portfolio-sync.ts`** - Portfolio integration service

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root:

```env
# Anthropic Claude API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Existing variables
TRADIER_API_KEY=your_tradier_api_key_here
DATABASE_URL=your_database_url_here
```

### 2. Get Anthropic API Key
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Add it to your `.env.local` file

### 3. Dependencies
All required dependencies are already installed:
- `@anthropic-ai/sdk` - Claude AI integration
- `@heroicons/react` - UI icons
- `zustand` - State management

### 4. Browser Compatibility
For speech-to-text functionality, ensure your browser supports:
- Web Speech API (Chrome, Edge, Safari)
- Microphone permissions

## Usage Examples

### Text-Based Trade Logging
```
"I bought 5 SPY calls at $3.50"
"Sold 10 AAPL puts for $2.25 each"
"Picked up some TSLA 250 calls at 4.50"
"Closed my QQQ position for $180 profit"
```

### Voice Commands
1. Click the microphone button in the chatbot
2. Speak your trade naturally
3. The system will transcribe and process automatically

### Supported Trade Patterns
- **Actions**: buy, bought, sell, sold, closed, picked up, grabbed
- **Symbols**: Any stock ticker (SPY, AAPL, TSLA, etc.)
- **Option Types**: calls, puts
- **Quantities**: Number of contracts
- **Premiums**: Price per contract
- **Strike Prices**: Optional strike price
- **Profit/Loss**: "made $500", "lost $200", "profit: $1000"

## Dashboard Features

### Trade Statistics
- Total trades logged
- Overall profit/loss
- Win rate percentage
- Average win/loss amounts
- Premium collected vs paid

### Position Tracking
- Open positions list
- Recent trades table
- Trade history with timestamps
- P/L status for each trade

### Data Management
- Export trade data
- Clear all trades (with confirmation)
- Persistent local storage

## Integration with Existing System

### Portfolio Sync
The chatbot can optionally sync trades to your existing portfolio system:

```typescript
// Enable portfolio sync in API calls
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: content,
    context: { /* ... */ },
    syncToPortfolio: true // Enable sync
  })
});
```

### Database Schema
Trades are converted to your existing portfolio format:
- Symbol format: `SYMBOL-STRIKE-TYPE-EXPIRATION`
- Shares: Number of contracts
- Price: Premium × 100 (per-share basis)
- Strategy: Tagged as 'CHATBOT_TRADE'

## Customization

### Styling
The chatbot uses Tailwind CSS with a professional color palette [[memory:8496398]]. Colors can be customized in the component files.

### AI Behavior
Modify the system prompt in `/api/chatbot/route.ts` to adjust Claude's behavior:
- Trade parsing sensitivity
- Response tone and style
- Additional context or rules

### Trade Patterns
Extend the `parseTradeFromMessage` function to recognize additional trade patterns or terminology.

## Troubleshooting

### Speech Recognition Issues
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome recommended)
- Verify HTTPS connection (required for microphone access)

### API Errors
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient credits
- Monitor console for detailed error messages

### Trade Parsing Issues
- Use clear, specific language
- Include all required details (symbol, action, quantity, price)
- Check the dashboard to verify trades were logged correctly

## Future Enhancements

### Planned Features
- Real-time option pricing integration
- Advanced trade analytics and insights
- Export to CSV/Excel functionality
- Trade alerts and notifications
- Integration with multiple brokers

### Customization Options
- Custom trade categories/tags
- Automated trade matching (opening/closing pairs)
- Advanced P/L calculations with time decay
- Integration with options Greeks

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Test with simple trade examples first
4. Check the dashboard for logged trades

The chatbot is designed to be intuitive and forgiving - it will ask for clarification if trade details are unclear or missing.
