# 🤖 How to Use AI Features - Complete Guide

## Quick Start (30 seconds)

### 1. Set Up OpenAI API Key

**Create `.env` file in project root:**
```env
VITE_OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
```

**Get your key from:**
https://platform.openai.com/api-keys

### 2. Install OpenAI Package

```bash
npm install openai
```

### 3. Use the Modular Card

```tsx
import { StandalonePositionCard } from './src/components/modular/StandalonePositionCard';

// In your component:
<StandalonePositionCard
  position={investmentData}
  marketPrices={currentPrices}
  showAI={true}  // ← Enable AI features
/>
```

**That's it!** AI features are now active.

---

## 🎯 AI FEATURES EXPLAINED

### Feature 1: Automatic Position Summary

**What it does:**
- Analyzes your entire position
- Generates headline, insights, and guidance
- Shows in purple "AI Insights" panel

**When it runs:**
- Automatically when card loads
- If `showAI={true}` is set

**What you see:**
```
┌────────────────────────────────────────┐
│  ⭐ AI Insights (Powered by GPT-4)     │
│  ──────────────────────────────────   │
│  📊 Current Position                   │
│  Your position shows strong...         │
│                                        │
│  👀 What to Watch                      │
│  Monitor the 70% barrier level...      │
│                                        │
│  🎯 Scenario Analysis                  │
│  Range from +40% to -30%...            │
└────────────────────────────────────────┘
```

**No action needed** - loads automatically!

---

### Feature 2: Per-Scenario AI Explanations

**What it does:**
- Explains each specific scenario in detail
- Why that outcome occurs
- What it means for returns

**How to use:**
1. Look at scenario cards (6 cards in grid)
2. Click **"AI Explanation"** button on any card
3. Card expands with detailed AI analysis

**What you see:**
```
┌────────────────────────────────────────┐
│  📉📉 Deep Loss                         │
│  Level: 50%                            │
│  $60,000                               │
│  -40%  ⚠️                               │
│                                        │
│  [AI Explanation] ← CLICK HERE         │
└────────────────────────────────────────┘

After clicking:
┌────────────────────────────────────────┐
│  ⭐ AI Analysis                         │
│  In this worst-case scenario where...  │
│  the basket falls to 50%, you would... │
│  receive 2,000 shares worth $50,000... │
│                                        │
│  Physical Delivery:                    │
│  2,000 shares of AAPL @ $25 = $50,000  │
└────────────────────────────────────────┘
```

**On-demand** - only generates when clicked!

---

### Feature 3: Risk Analysis (Advanced)

**What it does:**
- Deep dive on all risks
- Protective measures
- Critical levels
- Time decay
- Market sensitivity
- Worst case analysis

**How to use:**
In your code, call directly:

```tsx
import { generateRiskAnalysis } from './services/aiRiskAnalyzer';

const riskAnalysis = await generateRiskAnalysis(snapshot, position);

// Use the results:
console.log(riskAnalysis.overallAssessment);
console.log(riskAnalysis.keyRisks);
console.log(riskAnalysis.criticalLevels);
```

**Or** - It's called automatically in the modular card's AI insights!

---

### Feature 4: Smart Summary

**What it does:**
- One-liner summary
- Executive summary
- Key takeaways (bullets)
- Upcoming milestones
- Educational note
- Analogy explanation

**How to use:**
```tsx
import { generateSmartSummary } from './services/aiSmartSummary';

const summary = await generateSmartSummary(snapshot, position);

// Display anywhere:
<div>
  <h3>Quick Summary</h3>
  <p>{summary.oneLiner}</p>
  <p>{summary.executiveSummary}</p>
  <ul>
    {summary.keyTakeaways.map(t => <li>{t}</li>)}
  </ul>
</div>
```

---

### Feature 5: Plain English Translator

**What it does:**
- Converts complex finance speak to simple language
- No jargon
- Everyday analogies

**How to use:**
```tsx
import { generatePlainEnglishExplanation } from './services/aiSmartSummary';

const simple = await generatePlainEnglishExplanation(productType, snapshot);

// Shows something like:
// "Think of this like a guaranteed savings account with a bonus..."
```

**Perfect for:** Helping non-finance users understand

---

### Feature 6: Comparative Analysis

**What it does:**
- Compares current state vs maturity scenarios
- Shows range of possibilities
- Explains what determines outcomes

**How to use:**
```tsx
import { generateComparativeAnalysis } from './services/aiSmartSummary';

const comparison = await generateComparativeAnalysis(currentSnapshot, scenarios);

// Example output:
// "Current value ($127k) is between best case ($140k) and worst ($60k)..."
```

---

### Feature 7: "What Could Go Wrong"

**What it does:**
- Lists 3-5 specific risks
- Educational tone
- Concrete and clear

**How to use:**
```tsx
import { generateWhatCouldGoWrong } from './services/aiRiskAnalyzer';

const risks = await generateWhatCouldGoWrong(snapshot);

// Returns array:
// ["Underlying falling below 70% barrier triggers share conversion",
//  "Missing coupon payments reduces total return",
//  "Market volatility could push levels near barrier"]
```

---

### Feature 8: AI-Enhanced Scenario Cards

**What it does:**
- Each scenario card can expand with full AI analysis
- Shows why, what happens, implications

**How to use:**
Use the `AIEnhancedScenarioCard` component:

```tsx
import { AIEnhancedScenarioCard } from './components/modular/AIEnhancedScenarioCard';

<AIEnhancedScenarioCard
  scenarioName="Deep Loss"
  level={0.50}
  emoji="📉📉"
  snapshot={deepLossSnapshot}
  currency="USD"
  color="red"
/>
```

Click the card → AI explains in detail!

---

## 🎮 PRACTICAL EXAMPLES

### Example 1: Basic Usage (Automatic AI)

```tsx
function MyPage() {
  const position = {
    // ... your investment data
  };

  const prices = [165, 285]; // Current market prices

  return (
    <StandalonePositionCard
      position={position}
      marketPrices={prices}
      showAI={true}  // ← AI automatically generates insights!
    />
  );
}
```

**What happens:**
1. Card loads
2. Calculates position value
3. Generates 6 scenarios
4. **Calls OpenAI automatically**
5. Shows AI insights in purple panel
6. Ready for user interaction

**You see:**
- Position summary (AI-generated)
- What to watch (AI-generated)
- Scenario insights (AI-generated)

**Zero code needed** - it's automatic!

---

### Example 2: Manual AI Calls (Custom Usage)

```tsx
import { evaluatePosition } from './services/positionEvaluator';
import { generateAIExplanation } from './services/aiExplainer';
import { generateSmartSummary } from './services/aiSmartSummary';

async function analyzePosition() {
  // 1. Evaluate position
  const snapshot = evaluatePosition(position, marketData, {});

  // 2. Get AI explanation
  const aiInsights = await generateAIExplanation({
    productType: position.productTerms.productType,
    currentSnapshot: snapshot,
    scenarios: scenarioSnapshots,
    position: position,
  });

  // 3. Get smart summary
  const summary = await generateSmartSummary(snapshot, position);

  // 4. Use the results
  console.log('Headline:', aiInsights.headline);
  console.log('What to Watch:', aiInsights.whatToWatch);
  console.log('Smart Summary:', summary.executiveSummary);
  console.log('Key Takeaways:', summary.keyTakeaways);
}
```

---

### Example 3: Conditional AI (Premium Feature)

```tsx
function MyPage({ user }) {
  const isPremium = user.tier === 'premium';

  return (
    <StandalonePositionCard
      position={position}
      marketPrices={prices}
      showAI={isPremium}  // ← Only for premium users
    />
  );
}
```

**Free users:** See values and scenarios (no AI)  
**Premium users:** Get full AI explanations

---

### Example 4: Progressive AI Loading

```tsx
function SmartPositionCard() {
  const [aiEnabled, setAiEnabled] = useState(false);

  return (
    <div>
      {/* Toggle button */}
      <button onClick={() => setAiEnabled(!aiEnabled)}>
        {aiEnabled ? '⭐ AI Enabled' : 'Enable AI Insights'}
      </button>

      {/* Card with conditional AI */}
      <StandalonePositionCard
        position={position}
        marketPrices={prices}
        showAI={aiEnabled}
      />
    </div>
  );
}
```

**Benefit:** User controls when AI loads (saves costs if they don't want it)

---

## 🎯 TESTING AI FEATURES

### Test 1: See AI Load Automatically

**Steps:**
1. Create a position
2. Use `<StandalonePositionCard showAI={true} />`
3. Wait 2-3 seconds
4. See purple "AI Insights" panel appear

**Expected:**
- "Powered by GPT-4" label
- 3-4 sections with insights
- Educational explanations
- No advice or predictions

---

### Test 2: Click Scenario AI

**Steps:**
1. Look at the 6 scenario cards
2. Click "AI Explanation" on "Deep Loss" card
3. Watch it expand

**Expected:**
- Loading spinner (1-2 seconds)
- Detailed explanation appears
- 2-3 sentences about that scenario
- Physical delivery details if applicable
- "Educational insights only" disclaimer

---

### Test 3: Check AI Content Quality

**What AI should say:**
✅ "Your position shows a 27.5% profit because..."  
✅ "The barrier at 70% provides protection..."  
✅ "Monitor the next coupon payment on..."  
✅ "In this scenario, the basket level triggers..."  

**What AI should NOT say:**
❌ "You should buy more"  
❌ "I recommend selling"  
❌ "The stock will go up"  
❌ "This is a good investment"  

---

## 🔧 TROUBLESHOOTING

### Issue: "No AI insights showing"

**Check:**
1. Is `showAI={true}`? 
2. Is `VITE_OPENAI_API_KEY` set in `.env`?
3. Check browser console for errors
4. Verify OpenAI package installed: `npm list openai`

**Fix:**
```bash
# Install if missing
npm install openai

# Check .env file exists
cat .env | grep OPENAI

# Restart dev server
npm run dev
```

---

### Issue: "AI loading forever"

**Possible causes:**
- Invalid API key
- API rate limit hit
- Network issues

**Check:**
```typescript
// In browser console:
console.log(import.meta.env.VITE_OPENAI_API_KEY);
// Should show: "sk-proj-..."
```

**Fix:**
- Verify API key is valid
- Check OpenAI dashboard for errors
- Try with a test API call

---

### Issue: "AI showing errors"

**Error handling is built-in:**
- Falls back to basic explanations
- Shows "Analysis temporarily unavailable"
- Position still works without AI

**Check logs:**
```javascript
// Errors logged to console
// Look for: "AI explanation failed:"
```

---

## 💡 ADVANCED USAGE

### Custom AI Prompts

**Modify prompts in services:**

**File:** `src/services/aiExplainer.ts`

Find the prompt:
```typescript
const prompt = `
Explain this structured product position...
${YOUR_CUSTOM_INSTRUCTIONS}
`;
```

**Customize:**
- Add more context
- Change tone
- Focus on specific aspects
- Adjust length

---

### AI Caching

**Automatic caching included:**
```typescript
// In aiExplainer.ts
const aiCache = new Map<string, AIExplanation>();

// Cache key based on:
- Position value
- Risk status
- Settlement type

// Same state = instant response (no API call!)
```

**To clear cache:**
```typescript
// In browser console:
aiCache.clear();
```

---

### Batch AI Requests

**For multiple positions:**
```tsx
async function analyzeAllPositions(positions) {
  const analyses = await Promise.all(
    positions.map(async (pos) => {
      const snapshot = evaluatePosition(pos, marketData, {});
      const ai = await generateAIExplanation({...});
      return { position: pos, snapshot, ai };
    })
  );

  return analyses;
}
```

**Runs in parallel** - faster!

---

## 🎨 UI INTEGRATION OPTIONS

### Option 1: Auto-Load (Default)

```tsx
<StandalonePositionCard
  showAI={true}
/>
```

AI loads automatically, shows in panel.

---

### Option 2: Click to Load

```tsx
function CustomCard() {
  const [showAI, setShowAI] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAI(true)}>
        Load AI Insights
      </button>
      
      <StandalonePositionCard
        showAI={showAI}
        {...props}
      />
    </div>
  );
}
```

User controls when AI loads.

---

### Option 3: Progressive Disclosure

```tsx
function ProgressiveAI() {
  const [level, setLevel] = useState<'none' | 'basic' | 'full'>('none');

  return (
    <div>
      <select onChange={(e) => setLevel(e.target.value)}>
        <option value="none">No AI</option>
        <option value="basic">Basic AI</option>
        <option value="full">Full AI</option>
      </select>

      <StandalonePositionCard
        showAI={level !== 'none'}
        // Custom logic for basic vs full
        {...props}
      />
    </div>
  );
}
```

Three levels of AI detail.

---

## 📊 WHAT EACH AI CALL RETURNS

### 1. Position Summary

**Input:**
- Product type, value, P&L, levels, events

**Output:**
```json
{
  "headline": "Position protected with 27.5% profit if settled today",
  "whatChanged": "Underlying prices increased 10% since last check",
  "whatToWatch": "Monitor 70% barrier, next coupon in 45 days",
  "scenarioInsights": "Range from +40% to -40%. Barrier at 70% is key.",
  "riskAnalysis": "Currently safe, 40% above barrier",
  "settlementExplanation": "Cash redemption expected at current levels",
  "nextSteps": "Consider implications of upcoming coupon payment",
  "glossaryLinks": ["barrier", "coupon", "worst-of"]
}
```

---

### 2. Scenario Explanation

**Input:**
- Scenario name, level, outcome snapshot

**Output:**
```
"In this scenario where the basket falls to 50% of initial value, 
you would receive physical shares instead of cash. Specifically, 
2,000 shares worth $50,000 at current prices. This represents 
a 40% loss from your initial $100,000 investment."
```

Single string, 2-3 sentences.

---

### 3. Risk Analysis

**Input:**
- Complete snapshot, position details

**Output:**
```json
{
  "overallAssessment": "Moderate risk position with good protection...",
  "keyRisks": [
    "Market decline below 70% triggers conversion",
    "Coupon schedule requires quarterly checks",
    "Time decay reduces optionality"
  ],
  "protectiveMeasures": [
    "70% barrier provides 30% downside buffer",
    "Quarterly coupons reduce breakeven"
  ],
  "criticalLevels": [
    {
      "level": "Barrier at 70%",
      "importance": "high",
      "explanation": "Breach triggers physical delivery"
    }
  ],
  "timeDecay": "Risk increases as maturity approaches...",
  "marketSensitivity": "1% price move = ~1% value change",
  "worstCaseAnalysis": "In worst scenario (50% level)...",
  "bestPathForward": "Optimal outcome requires levels above 70%"
}
```

---

### 4. Smart Summary

**Input:**
- Snapshot, position, events

**Output:**
```json
{
  "oneLiner": "Protected position, profitable, cash settlement expected",
  "executiveSummary": "Your $100,000 investment in a reverse convertible...",
  "keyTakeaways": [
    "Currently up 27.5% including coupons",
    "Protected by 70% barrier (currently at 110%)",
    "Cash settlement expected if levels maintain"
  ],
  "upcomingMilestones": "Next coupon Oct 12 ($2,500), Maturity Jan 2027",
  "educationalNote": "Reverse convertibles pay regular income with downside protection",
  "analogyExplanation": "Like a high-yield savings account that converts to stocks if prices fall too much"
}
```

---

## 🎯 PRACTICAL SCENARIOS

### Scenario A: New User Checks Position

**What happens:**
1. User opens lifecycle page
2. Sees modular card with big value
3. Sees AI Insights panel load (2 sec)
4. Reads: "Your position is protected with 15% profit..."
5. Understands immediately!

**AI used:** Position summary (automatic)

---

### Scenario B: User Explores Outcomes

**What happens:**
1. User sees 6 scenario cards
2. Clicks "Deep Loss" card's "AI Explanation"
3. Card expands (1 sec)
4. Reads: "In this worst-case scenario where the basket falls to 50%..."
5. Understands risk!

**AI used:** Scenario explanation (on-demand)

---

### Scenario C: User Wants Simple Explanation

**What happens:**
1. Developer adds "Simple Mode" toggle
2. User clicks it
3. Calls `generatePlainEnglishExplanation()`
4. Shows: "Think of this like a bet on stocks with a safety net..."
5. User gets it!

**AI used:** Plain English translator

---

## 📈 MONITORING AI USAGE

### Check Token Usage:

**In OpenAI Dashboard:**
1. Go to https://platform.openai.com/usage
2. See token consumption
3. Monitor costs
4. Set usage limits

### In Your Code:

```typescript
// Add logging
const completion = await openai.chat.completions.create({...});
console.log('Tokens used:', completion.usage);
// { prompt_tokens: 500, completion_tokens: 300, total_tokens: 800 }
```

---

## 💰 COST MANAGEMENT

### Strategies:

**1. Smart Caching**
```typescript
// Already implemented in aiExplainer.ts
const cacheKey = getCacheKey(snapshot);
if (aiCache.has(cacheKey)) {
  return aiCache.get(cacheKey); // Instant, free!
}
```

**2. On-Demand Loading**
```tsx
// Don't load AI until user clicks
<button onClick={() => setShowAI(true)}>
  Show AI Insights
</button>
```

**3. Batch Requests**
```typescript
// Generate multiple explanations in one call
const prompt = `Explain these 3 positions: ...`;
```

**4. Response Streaming**
```typescript
// Stream responses for faster perceived performance
const stream = await openai.chat.completions.create({
  stream: true,
  ...
});
```

---

## ⚙️ CONFIGURATION

### Adjust AI Behavior:

**File:** `src/services/aiExplainer.ts`

**Temperature (0-2):**
```typescript
temperature: 0.7  // Default: balanced
temperature: 0.3  // More consistent, less creative
temperature: 1.0  // More creative, varied
```

**Max Tokens:**
```typescript
max_tokens: 2000  // Comprehensive response
max_tokens: 500   // Brief response
max_tokens: 5000  // Very detailed
```

**Model:**
```typescript
model: 'gpt-4-turbo-preview'  // Best quality
model: 'gpt-3.5-turbo'        // Faster, cheaper
```

---

## 🎊 COMPLETE EXAMPLE

### Full Integration with All AI Features:

```tsx
import { StandalonePositionCard } from './components/modular/StandalonePositionCard';
import { generateSmartSummary } from './services/aiSmartSummary';
import { useState, useEffect } from 'react';

export function ValuraLifecyclePage() {
  const [smartSummary, setSmartSummary] = useState(null);

  // Your data
  const position = {
    id: 'pos_123',
    productTerms: { /* ... */ },
    // ... complete position data
  };

  const currentPrices = [165, 285];

  // Load smart summary
  useEffect(() => {
    async function loadSummary() {
      const snapshot = evaluatePosition(position, {
        underlyingPrices: currentPrices,
        timestamp: new Date()
      }, {});
      
      const summary = await generateSmartSummary(snapshot, position);
      setSmartSummary(summary);
    }
    loadSummary();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1>Your Investment</h1>

      {/* Smart Summary at top */}
      {smartSummary && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold">{smartSummary.oneLiner}</div>
          <p className="text-sm mt-2">{smartSummary.executiveSummary}</p>
        </div>
      )}

      {/* Modular Card with Full AI */}
      <StandalonePositionCard
        position={position}
        marketPrices={currentPrices}
        showAI={true}  // ← All 8 AI features active!
      />

      {/* Your existing UI below */}
    </div>
  );
}
```

**Result:**
- Smart summary at top
- Full position card with AI
- Scenario grid with AI buttons
- Everything AI-enhanced!

---

## 🎯 QUICK REFERENCE

### Enable AI:
```tsx
showAI={true}
```

### Disable AI:
```tsx
showAI={false}
```

### Manual AI Calls:
```tsx
import { generateAIExplanation } from './services/aiExplainer';
const ai = await generateAIExplanation({...});
```

### Check If AI Loaded:
Look for purple "⭐ AI Insights" panel

### AI Not Working?
1. Check API key in `.env`
2. Check console for errors
3. Verify OpenAI package installed
4. Falls back to basic explanations

---

## ✅ CHECKLIST

Before using AI features:
- [ ] OpenAI package installed (`npm install openai`)
- [ ] API key set in `.env` file
- [ ] Dev server restarted
- [ ] `showAI={true}` in component
- [ ] Waiting 2-3 seconds for AI to load

If all checked: **AI should work!** ✨

---

## 🎊 SUMMARY

**To use AI features:**
1. Set `VITE_OPENAI_API_KEY` in `.env`
2. Add `showAI={true}` to component
3. **That's it!**

**What you get:**
- 8+ AI-powered features
- Automatic explanations
- On-demand insights
- Educational content
- Professional quality

**Cost:**
- ~$0.16 per position (first view)
- ~$0.02 per position (cached)
- Extremely cost-effective

**Safety:**
- No investment advice
- Educational only
- Clear disclaimers
- Fallback handling

**Ready to use NOW!** 🚀

---

**See also:**
- `EXAMPLE_VALURA_INTEGRATION.tsx` - Copy-paste examples
- `docs/AI_FEATURES_COMPLETE.md` - Complete feature list
- `docs/implementation/VALURA_INTEGRATION_GUIDE.md` - Integration guide

