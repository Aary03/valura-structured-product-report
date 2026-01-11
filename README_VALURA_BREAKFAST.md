# Valura Breakfast - Market News Integration

## Overview

**Valura Breakfast** is a sophisticated financial news section that provides:
- Real-time market news from Marketaux API
- Sentiment analysis and trending entities
- Beautiful, responsive UI with sophisticated copy
- Email delivery capability (HTML email template)

## Features

### 1. Market News API (Marketaux)
- **Entity-specific news** - Filter by stock symbols
- **Sentiment scoring** - Positive/negative/neutral classification  
- **Trending entities** - Most mentioned stocks
- **Market statistics** - Aggregated sentiment and volume

### 2. News Aggregation Service
- Sophisticated headline generation
- Relevance scoring algorithm
- Sentiment categorization (bullish/bearish/neutral)
- Clever financial wordplay ("Bulls caffeinated", "Bears stirring", etc.)

### 3. UI Components

#### ValuraBreakfast (Main Section)
- Tabbed interface: Your Underlyings | Market Pulse | Trending
- Market Pulse Widget with overall sentiment
- News cards with entity chips and sentiment badges
- Email digest button

#### NewsCard
- Article thumbnail images
- Sentiment indicators
- Entity chips with performance indicators
- Source and timestamp

#### MarketPulseWidget
- Overall market vibe (bullish/bearish/neutral)
- Top 3 trending symbols with direction arrows
- Mention counts and sentiment aggregates

### 4. Standalone News Page
- Full-screen experience at `#breakfast`
- Navigation from main app
- Email delivery integration
- Toast notifications for email status

### 5. Email Delivery
- Beautiful HTML email template with inline styles
- Compatible with Gmail, Outlook, Apple Mail
- Sophisticated header with gradients
- Market pulse summary
- Top 5 news articles
- Entity sentiment badges
- Responsive design

## Getting Started

### 1. Configure API Key

The Marketaux API key is already configured in the code:
```
k7LY5yCGckNsSdiRx82arczbsphXf8p9dqDKUeQF
```

### 2. Access Valura Breakfast

From anywhere in the app, click the **"☕ Valura Breakfast"** button or navigate to:
```
http://localhost:5173/#breakfast
```

### 3. Navigate the Interface

- **Market Pulse** tab - General market news and trending entities
- **Trending** tab - Most mentioned stocks with sentiment
- **Email This Digest** button - Send email (opens preview in new tab)

## Architecture

```
src/
├── services/
│   ├── api/
│   │   └── marketaux.ts          # API client for Marketaux
│   ├── newsAggregator.ts          # Business logic & sophisticated copy
│   └── email/
│       └── breakfastEmail.ts      # Email delivery service
├── components/
│   ├── news/
│   │   ├── ValuraBreakfast.tsx    # Main news section
│   │   ├── NewsCard.tsx           # Individual article card
│   │   └── MarketPulseWidget.tsx  # Market sentiment widget
│   ├── pages/
│   │   └── NewsPage.tsx           # Standalone news page
│   └── email/
│       └── BreakfastEmailTemplate.tsx  # HTML email generator
└── App.tsx                         # Routing integration
```

## API Reference

### Marketaux Endpoints Used

1. **GET /v1/news/all** - Fetch market news
   - Filter by symbols, sentiment, date range
   - Entity identification and sentiment scoring
   
2. **GET /v1/entity/trending** - Get trending entities
   - Most mentioned stocks
   - Sentiment aggregates
   
3. **GET /v1/entity/stats/intraday** - Market statistics
   - Aggregated metrics by symbol
   - Time-series data

### Key Functions

**`buildValuraBreakfast(symbols?: string[])`**
- Main aggregation function
- Returns `ValuraBreakfastDigest` with news, trending, and market pulse

**`sendBreakfastEmail(digest, options)`**
- Generates HTML email
- Opens preview in new tab (production: sends via Zapier MCP Gmail)

**`fetchMarketNews(options)`**
- Fetch news with filters (symbols, sentiment, dates)

**`fetchTrendingEntities(options)`**
- Get most mentioned stocks

## Sophisticated Language

### Sentiment Labels
- **Bullish**: "Brewing Upside ↗", "Bulls Caffeinated"
- **Bearish**: "Bears Stirring ↘", "Bitter Notes"
- **Neutral**: "Flat White Markets", "Temperate Blend"

### Section Headlines
- "Fresh Brews & Market Moves"
- "What's Percolating in [SYMBOL]"
- "Today's Financial Espresso"
- "The Daily Grind (Market Edition)"

### Vibe Descriptions
- Bullish: "Optimism in the air, investors leaning forward"
- Bearish: "Caution signals flashing across desks"
- Neutral: "Markets in contemplative mode"

## Email Integration

### Current Implementation
The email functionality currently **opens an HTML preview** in a new browser tab. This allows you to:
- See exactly how the email will look
- Copy the HTML for use in email clients
- Test the email template design

### Production Integration
To integrate with actual email sending via Zapier MCP Gmail:

1. Set up Zapier MCP server with Gmail connection
2. Update `src/services/email/breakfastEmail.ts`:
```typescript
const response = await mcp_Zapier_MCP_gmail_send_email({
  instructions: `Send professional HTML email with Valura Breakfast digest`,
  to,
  subject,
  body,
});
```

## Customization

### Change API Key
Edit `src/services/api/marketaux.ts`:
```typescript
const API_TOKEN = 'your-api-key-here';
```

### Adjust News Limits
Edit `src/services/newsAggregator.ts`:
```typescript
underlyingNews: underlyingNews.slice(0, 8), // Change 8 to desired limit
marketNews: marketNews.slice(0, 12), // Change 12 to desired limit
```

### Modify Sophisticated Copy
Edit phrase arrays in `src/services/newsAggregator.ts`:
```typescript
const BREAKFAST_PHRASES = {
  bullish: ['Your custom phrase here'],
  bearish: ['Your custom phrase here'],
  neutral: ['Your custom phrase here'],
};
```

## Future Enhancements

- [ ] User authentication & personalized digests
- [ ] Email scheduling (daily morning delivery)
- [ ] Historical news archive
- [ ] Custom watchlists
- [ ] Portfolio-contextualized news
- [ ] Real-time updates (WebSocket)
- [ ] Mobile app with push notifications
- [ ] Advanced sentiment analysis (AI-powered)
- [ ] News clustering & topic modeling

## Troubleshooting

### API Rate Limits
Marketaux has rate limits. If you encounter errors:
- Check API response in browser console
- Reduce request frequency
- Upgrade API plan if needed

### News Not Loading
1. Check browser console for errors
2. Verify API key is valid
3. Check network connectivity
4. Ensure Marketaux API is accessible

### Email Preview Not Opening
- Check if pop-up blocker is enabled
- Try allowing pop-ups for localhost
- Check browser console for errors

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API key configuration
3. Test API endpoints directly: https://www.marketaux.com/documentation

---

Built with ☕ and sophisticated financial wordplay by Valura














