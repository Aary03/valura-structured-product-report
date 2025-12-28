# AI Investment Insights - Quick Reference 🚀

## What It Does
Combines **GPT-4** + **Real-Time FMP Market Data** to provide intelligent investment analysis for each underlying in structured products.

## Key Features

### 1. LIVE Market Intelligence 🔴
- **Current Price & Changes**: Live quotes, volume, day range
- **52-Week Context**: Position in range, distance from highs/lows
- **Technical Indicators**: Moving averages, momentum
- **Insider Activity**: Recent buys/sells, sentiment
- **Institutional Ownership**: Position changes, smart money moves
- **Valuation Metrics**: P/E, PEG, Price/Book, EV/EBITDA
- **Financial Health**: Margins, debt, ROE, liquidity
- **Growth Rates**: Revenue, earnings, EPS trends

### 2. AI-Generated Insights
- **Quick Take**: One-sentence assessment
- **3 Key Strengths**: Based on real-time data
- **3 Considerations**: Current risks to monitor
- **Suited For**: Investor profile match

### 3. Interactive Q&A
- Pre-loaded quick questions
- Custom question input
- AI fetches **fresh data** for each answer
- Examples:
  - "What are the biggest risks right now?"
  - "How volatile is this stock?"
  - "Is the current price attractive?"
  - "What if the stock drops 15%?"

## Data Sources

### FMP API Endpoints Used
1. `/quote` - Live price data
2. `/key-metrics-ttm` - Valuation metrics
3. `/ratios-ttm` - Financial ratios
4. `/insider-trading/statistics` - Insider activity
5. `/institutional-ownership/symbol-positions-summary` - Institutional holdings
6. `/stock-price-change` - Price history
7. `/financial-growth` - Growth metrics
8. `/news/stock` - Recent news

### OpenAI API
- **Model**: GPT-4o-mini
- **Temperature**: 0.4
- **Max Tokens**: 400 (insights), 200 (Q&A)

## Technical Architecture

```
User loads report
    ↓
CompanyDescriptionCard mounts
    ↓
Fetch market intelligence (8 FMP endpoints in parallel)
    ↓
Format data for AI context
    ↓
Call GPT-4 with comprehensive prompt
    ↓
Display insights in AIInsightsCard
    ↓
[User clicks "Ask AI"]
    ↓
Fetch fresh market data
    ↓
Call GPT-4 with question + updated context
    ↓
Display answer
```

## Files

### Core Services
- **`src/services/marketIntelligence.ts`** - Fetches real-time market data
- **`src/services/aiInsights.ts`** - GPT-4 integration & prompt engineering

### UI Components
- **`src/components/report/AIInsightsCard.tsx`** - Display component
- **`src/components/report/CompanyDescriptionCard.tsx`** - Container
- **`src/components/report/CompanyDescriptions.tsx`** - Multi-card wrapper

### Integration Points
- **`ReverseConvertibleReport.tsx`** - RC product integration
- **`CapitalProtectedParticipationReport.tsx`** - CPPN product integration

## Usage

### In Report Component
```typescript
<CompanyDescriptions 
  summaries={summaries} 
  productType="RC"          // or "CPPN"
  barrierPct={terms.barrier}
/>
```

### Standalone (if needed)
```typescript
import { generateInvestmentInsights } from './services/aiInsights';

const insights = await generateInvestmentInsights({
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  description: '...',
  sector: 'Technology',
  industry: 'Consumer Electronics',
  performancePct: 5.2,
  distanceToBarrier: 30.5,
  productType: 'RC',
  barrierPct: 0.7,
  // ... other params
});
```

## Performance

### Speed Optimizations
- **Parallel API calls**: All FMP requests run simultaneously
- **Efficient model**: GPT-4o-mini for cost/speed balance
- **Graceful degradation**: Works even if some data unavailable

### Cost Management
- ~$0.001 per insight generation
- ~$0.0005 per Q&A response
- Caching opportunities for future optimization

## Error Handling

### Graceful Failures
- If FMP API fails → Returns minimal MarketIntelligence object
- If OpenAI fails → Returns null, component shows nothing
- If partial data → AI works with available information

### User Experience
- Loading states: "Generating AI insights..." / "Analyzing real-time market data..."
- No error messages to users (silent degradation)
- LIVE indicator shows data is fresh

## Best Practices

### For Users
1. Read AI insights AFTER reviewing raw data
2. Use Q&A to clarify specific concerns
3. Consider insights as supplementary, not primary DD
4. Click multiple quick questions to build understanding

### For Developers
1. Monitor API costs and usage
2. Consider caching for repeated symbols
3. Handle API failures gracefully
4. Keep prompts focused and specific
5. Test with various company types (growth, value, high-vol, low-vol)

## Competitive Advantages

✅ **Only platform** with GPT-4 + real-time data for structured products  
✅ **Institutional-grade** analysis democratized  
✅ **Interactive** not just informational  
✅ **Always current** - refreshes on every load  
✅ **Multi-dimensional** - technical + fundamental + sentiment  

## What Makes It Smart

### Context Awareness
- Knows product structure (RC vs CPPN)
- Understands barrier levels
- Calculates risk relative to current volatility
- Considers time to maturity (if available)

### Market Awareness
- Uses LIVE prices, not EOD
- Factors in insider/institutional moves
- References technical position
- Considers recent events

### Adaptive Intelligence
- Different analysis for growth vs value stocks
- Adjusts for high vs low volatility
- Factors in sector performance
- Considers company size and liquidity

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Insights not loading | Check FMP API key, OpenAI key |
| Slow generation | FMP API may be slow, check network |
| Generic insights | Check that market data is flowing through |
| Q&A not working | Verify OpenAI API key, check console |
| LIVE indicator not showing | Check CSS for success/success-light colors |

## Future Enhancements
See `AI_INSIGHTS_FEATURE.md` for roadmap.

---

**Status**: 🔴 LIVE  
**Version**: 2.0 (Enhanced with real-time data)  
**Last Updated**: Dec 2025




