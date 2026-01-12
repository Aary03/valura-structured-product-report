# Complete Report Cards Documentation
## Structured Products - All Three Product Types

**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Purpose:** Complete guide for developers to understand all report cards, their logic, mathematical formulas, and AI integration

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Report Architecture](#report-architecture)
3. [AI Integration](#ai-integration)
4. [Card-by-Card Documentation](#card-by-card-documentation)
   - [Regular Income (Reverse Convertible)](#regular-income-reverse-convertible)
   - [Capital Protection (CPPN)](#capital-protection-cppn)
   - [Boosted Growth (Bonus Certificate)](#boosted-growth-bonus-certificate)
5. [Mathematical Formulas](#mathematical-formulas)
6. [Scenario Generation Logic](#scenario-generation-logic)
7. [Data Flow](#data-flow)

---

## Product Overview

### The Three Product Types

| Product | Code | Risk Level | Main Feature | Protection |
|---------|------|------------|--------------|------------|
| **Regular Income** | RC | Medium | Regular coupon payments | None (capital at risk) |
| **Capital Protection** | CPPN | Low | Principal protection + upside | 90-100% floor |
| **Boosted Growth** | CPPN | High | Bonus if barrier not breached | None (0% floor) |

### Product Differentiation

```typescript
// Product Type Detection Logic
if (productType === 'RC') {
  // Regular Income (Reverse Convertible)
  // Has: Coupons, Barrier/Strike, Optional Autocall
}

if (productType === 'CPPN' && capitalProtectionPct > 0 && !bonusEnabled) {
  // Capital Protection
  // Has: Protection floor, Leveraged participation, Optional knock-in
}

if (productType === 'CPPN' && capitalProtectionPct === 0 && bonusEnabled) {
  // Boosted Growth (Bonus Certificate)
  // Has: Bonus level, Bonus barrier, 1:1 participation
}
```

---

## Report Architecture

### Component Structure

```
Report Container (Main)
├── Hero Header (KPIs + Product Identity)
├── One-Minute Summary (AI-Generated Overview)
├── Key Dates (Timeline)
├── Product Summary Card (Terms & Specs)
├── Underlyings Table (Market Data)
├── Underlyings Spotlight (Company Details + AI Insights)
├── Payoff Graph (Visual Formula)
├── Performance Graph (Historical Data)
├── Break-Even Card (Mathematical Analysis)
├── Outcome Examples (Scenario Table)
├── Scenarios Flowchart (Decision Tree - AI-Enhanced)
├── Risks Section
├── Suitability Section
└── Footer
```

###

 File Locations

```
src/components/report/
├── ReverseConvertibleReport.tsx          # RC container
├── CapitalProtectedParticipationReport.tsx # CPPN/Bonus container
├── HeroHeader.tsx                        # RC hero
├── CppnHeroHeader.tsx                    # CPPN/Bonus hero
├── ProductSummary.tsx                    # RC product card
├── CppnProductSummary.tsx                # CPPN/Bonus product card
├── BreakEvenCard.tsx                     # RC break-even
├── CppnBreakEvenCard.tsx                 # CPPN/Bonus break-even
├── OutcomeExamples.tsx                   # RC scenarios
├── CppnOutcomeExamples.tsx               # CPPN/Bonus scenarios
├── PayoffGraph.tsx                       # RC graph
├── CppnPayoffGraph.tsx                   # CPPN/Bonus graph
├── ScenariosFlowchart.tsx                # Decision tree (all products)
├── AIInsightsCard.tsx                    # AI insights
├── UnderlyingsSpotlight.tsx              # Company cards with AI
└── ... (shared components)
```

---

## AI Integration

### Where AI is Used

The application uses **OpenAI GPT-4** for intelligent content generation in several places:

#### 1. **AI Report Builder** (Conversational Flow)
- **File:** `src/services/ai/aiReportAssistant.ts`
- **Model:** GPT-4 Turbo (with fallback to GPT-4o-mini)
- **Purpose:** Helps users build reports through natural language conversation
- **How it works:**
  ```typescript
  // User asks: "I want a capital protected note on AAPL with 100% protection"
  // AI extracts:
  {
    productType: 'CPPN',
    underlyings: ['AAPL'],
    capitalProtectionPct: 100,
    // ... other parameters
  }
  ```
- **Context provided to AI:**
  - Current conversation state
  - Product type (RC/CPPN/Bonus)
  - Market data for selected underlyings
  - Technical product constraints

#### 2. **Content Export Generator** (Documents)
- **File:** `src/services/ai/aiContentGenerator.ts`
- **Model:** GPT-4o-mini
- **Purpose:** Generates professional documents from report data
- **Formats generated:**
  - Client Email (personalized pitch)
  - Executive Summary (1-page overview)
  - Investment Memo (detailed analysis)
  - FAQ Sheet (common questions answered)
  - Meeting Prep Notes (talking points)
- **How it works:**
  ```typescript
  const prompt = `
    Generate a professional client email for:
    Product: ${productType}
    Underlyings: ${underlyings}
    Key Features: ${keyFeatures}
    Risk Profile: ${risks}
    Target Audience: ${tone}
  `;
  const email = await callOpenAI(prompt, 1500);
  ```

#### 3. **Company Insights** (Investment Analysis)
- **File:** `src/services/aiInsights.ts`
- **Model:** GPT-4o-mini
- **Purpose:** Generates investment insights for each underlying
- **Card:** `UnderlyingsSpotlight.tsx`
- **Data analyzed:**
  - Company description
  - Recent price movements
  - Historical returns (1Y, 3M, 1M)
  - Sector information
- **Output:**
  ```typescript
  {
    investmentCase: "AAPL shows strong fundamentals...",
    keyDrivers: ["iPhone demand", "Services growth", "..."],
    risks: ["Regulatory pressure", "Supply chain", "..."],
    outlook: "Bullish/Neutral/Bearish",
    confidence: "High/Medium/Low"
  }
  ```

#### 4. **Scenario Descriptions** (Plain English)
- **File:** `src/services/scenarioDescriptions.ts`
- **Purpose:** Converts technical formulas into investor-friendly language
- **Not real-time AI:** Pre-generated templates with dynamic values
- **Example:**
  ```typescript
  // Technical: "If R < 0.70, then payoff = notional × (finalLevel / strike)"
  // Plain English: "If stocks drop below 70%, you lose less than owning stocks directly"
  ```

### AI API Configuration

```typescript
// Environment Variables Required
VITE_OPENAI_API_KEY=sk-...

// Models Used
const AI_MODEL = 'gpt-4-turbo-preview';
const FALLBACK_MODEL = 'gpt-4o-mini';
const CONTENT_MODEL = 'gpt-4o-mini'; // For exports

// Rate Limiting
- Max tokens: 500-1500 depending on use case
- Temperature: 0.7 (balanced creativity)
- Presence penalty: 0.6 (reduce repetition)
```

### AI vs. Deterministic Logic

| Feature | Logic Type | Reason |
|---------|------------|---------|
| Payoff calculations | **Deterministic** | Must be exact, auditable |
| Break-even formulas | **Deterministic** | Mathematical precision required |
| Scenario outcomes | **Deterministic** | Regulatory compliance |
| Company insights | **AI-powered** | Adds value, not critical |
| Export documents | **AI-powered** | Saves time, customizable |
| Scenario descriptions | **Template-based** | Consistent, fast |

---

## Card-by-Card Documentation

---

## Regular Income (Reverse Convertible)

### Product Characteristics
- **Code:** RC
- **Main Feature:** Regular coupon payments (guaranteed or conditional)
- **Risk:** Capital at risk if barrier/strike breached
- **Return:** Income-focused (high coupon rates)
- **Variants:** Standard Barrier RC or Low Strike Geared Put

---

### 1. Hero Header (HeroHeader.tsx)

**Purpose:** Display key KPIs and product identity at the top of the report.

**Data Displayed:**
- Product name: "Reverse Convertible"
- Coupon rate (e.g., "10% p.a.")
- Current worst-of level
- Barrier/Strike level
- Distance to barrier
- Worst-performing underlying

**Logic:**
```typescript
// Calculate distance to barrier
const distanceToBarrier = ((currentLevel - barrierLevel) / barrierLevel) * 100;
const barr ierStatus = currentLevel >= barrierLevel ? 'safe' : 'breached';

// Color coding
const statusColor = barrierStatus === 'safe' ? 'success' : 'danger';
```

**Visual Elements:**
- Large coupon rate display (hero number)
- KPI tiles showing:
  - Current level (percentage)
  - Barrier level (percentage)
  - Buffer (percentage above/below barrier)
  - Worst underlying (ticker symbol)

**No AI Used:** Pure data display

---

### 2. One-Minute Summary (OneMinuteSummary.tsx)

**Purpose:** Quick overview of the product in plain English.

**Content Sections:**
1. **What You Get:** Coupon payments summary
2. **How It Works:** Barrier/strike mechanism explained
3. **Your Risk:** Capital at risk if barrier breached
4. **Best Scenario:** Cash redemption + coupons
5. **Worst Scenario:** Share conversion

**Logic:**
```typescript
const couponTotal = (couponRatePA * tenorMonths) / 12;
const worstCase = barrierPct; // Minimum expected return if breached
const bestCase = 100 + (couponTotal * 100); // 100% + coupons
```

**Example Output:**
```
You invest $100,000 in this 12-month note.

✓ What You Get: 10% annual income paid quarterly
✓ How It Works: As long as AAPL stays above 70%, you get 100% back + coupons
⚠ Your Risk: If AAPL drops below 70%, you receive AAPL shares instead of cash
```

**AI Integration:** None (template-based with dynamic values)

---

### 3. Key Dates (KeyDates.tsx)

**Purpose:** Timeline of important dates (pricing, coupons, maturity).

**Data Displayed:**
- Pricing Date (today)
- Coupon Observation Dates
- Maturity Date

**Logic:**
```typescript
// Generate coupon schedule
const couponSchedule = generateCouponSchedule(
  pricingDate,
  tenorMonths,
  couponFreqPerYear
);

// Calculate maturity
const maturityDate = addMonths(pricingDate, tenorMonths);
```

**Coupon Schedule Algorithm:**
```typescript
function generateCouponSchedule(
  startDate: ISODateString,
  tenorMonths: number,
  frequency: number // 12=monthly, 4=quarterly
): ISODateString[] {
  const monthsBetween = 12 / frequency;
  const numCoupons = Math.floor(tenorMonths / monthsBetween);
  
  return Array.from({ length: numCoupons }, (_, i) =>
    addMonths(startDate, (i + 1) * monthsBetween)
  );
}
```

**No AI Used:** Date calculation only

---

### 4. Product Summary Card (ProductSummary.tsx)

**Purpose:** Display all product terms and specifications.

**Data Displayed:**
- Barrier/Strike percentage
- Coupon Type (Guaranteed/Conditional)
- Coupon Frequency
- Coupon Trigger (if conditional)
- Maturity Date
- Conversion Ratio
- Settlement Method
- Worst-of underlyings (if basket)

**Logic:**
```typescript
// Build specs dynamically based on variant
const specs = [];

// Add coupon type
specs.push({
  label: 'Coupon Type',
  value: terms.couponType === 'guaranteed' ? 'Guaranteed' : 'Conditional'
});

// Add trigger if conditional
if (terms.couponType === 'conditional' && terms.couponTriggerLevelPct) {
  specs.push({
    label: 'Coupon Trigger',
    value: formatPercent(terms.couponTriggerLevelPct, 0)
  });
}
```

**Conditional Coupon Logic:**
- **Guaranteed:** Coupons always paid at every observation date
- **Conditional:** Coupons only paid if underlying ≥ trigger level
  - Single basket: underlying ≥ trigger
  - Worst-of: worst performer ≥ trigger

**No AI Used:** Data formatting only

---

### 5. Underlyings Table (UnderlyingsTable.tsx)

**Purpose:** Show market data for each underlying.

**Data Displayed:**
- Symbol & Name
- Current Spot Price
- Initial Fixing
- Current Level (normalized)
- 1-Year Return
- Barrier/Strike Price (absolute)

**Logic:**
```typescript
// Calculate normalized level
const level = (spotPrice / initialFixing) * 100;

// Calculate barrier price
const barrierPrice = initialFixing * barrierPct;

// Calculate 1Y return
const oneYearReturn = ((spotPrice - historicalStart) / historicalStart) * 100;
```

**Data Sources:**
- Current prices: Real-time API (Yahoo Finance)
- Historical data: 1-year lookback
- Initial fixings: User-provided or fetched at trade date

**No AI Used:** Pure market data display

---

### 6. Underlyings Spotlight (UnderlyingsSpotlight.tsx)

**Purpose:** Rich company cards with AI-generated investment insights.

**Data Displayed (Per Underlying):**
- Company logo
- Current price & change
- Historical returns (1Y, 3M, 1M)
- Performance vs. barrier
- Sparkline chart (1Y history)
- **AI-Generated Investment Insights**

**AI Integration:** ✅ **YES - Real-time AI generation**

```typescript
// AI Insights Generation
const insights = await generateInvestmentInsights({
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  description: companyDescription,
  currentPrice: 150.00,
  returns: { oneYear: 25.5, threeMonth: 8.2, oneMonth: 2.1 },
  barrierDistance: 35 // percentage above barrier
});

// Output
{
  investmentCase: "Apple demonstrates strong fundamentals with consistent revenue growth driven by iPhone demand and expanding services segment.",
  keyDrivers: [
    "iPhone 15 sales exceeding expectations",
    "Services revenue growing 15% YoY",
    "Strong ecosystem lock-in"
  ],
  risks: [
    "Regulatory scrutiny in EU",
    "Supply chain dependencies",
    "Market saturation in smartphones"
  ],
  outlook: "Bullish",
  confidence: "High"
}
```

**Logic:**
```typescript
// Performance metrics
const distanceToBarrier = ((currentLevel - barrierLevel) / barrierLevel) * 100;
const safetyMargin = currentLevel - barrierLevel;
const isAboveBarrier = currentLevel >= barrierLevel;

// Sparkline generation
const sparklineData = historicalPrices.map((price, i) => ({
  x: i,
  y: (price / initialFixing) * 100
}));
```

**No AI for:** Price data, returns calculation, sparkline
**AI for:** Investment case, drivers, risks, outlook

---

### 7. Payoff Graph (PayoffGraph.tsx)

**Purpose:** Visual representation of payoff formula across all scenarios.

**Graph Elements:**
- X-axis: Final underlying level (50% to 150%)
- Y-axis: Total return (percentage)
- **Payoff curve** (blue line)
- **Intrinsic value line** (diagonal reference)
- **Barrier/Strike line** (vertical red)
- **Break-even line** (horizontal green)
- **Current level indicator** (vertical dashed)

**Payoff Calculation Logic:**

#### Standard Barrier RC:
```typescript
function calculatePayoff(finalLevel: number): number {
  const couponTotal = (couponRatePA * tenorMonths) / 12;
  
  if (finalLevel >= barrierPct) {
    // Above barrier: 100% + coupons
    return 100 + (couponTotal * 100);
  } else {
    // Below barrier: final level + coupons
    return finalLevel + (couponTotal * 100);
  }
}
```

#### Low Strike Geared Put:
```typescript
function calculatePayoff(finalLevel: number): number {
  const couponTotal = (couponRatePA * tenorMonths) / 12;
  
  if (finalLevel >= knockInBarrierPct) {
    // Above knock-in: 100% + coupons
    return 100 + (couponTotal * 100);
  } else {
    // Below knock-in: geared payoff + coupons
    const geared = (finalLevel / strikePct) * 100;
    return geared + (couponTotal * 100);
  }
}
```

**Curve Generation:**
```typescript
// Generate 100 points from 50% to 150%
const curvePoints = [];
for (let x = 50; x <= 150; x += 1) {
  const y = calculatePayoff(x);
  curvePoints.push({ x, y });
}
```

**No AI Used:** Pure mathematical visualization

---

### 8. Performance Graph (PerformanceGraph.tsx)

**Purpose:** Show historical price performance of underlyings vs. barrier.

**Graph Elements:**
- Time series (last 1 year)
- Normalized levels for each underlying
- Barrier/Strike level (horizontal line)
- Current level markers

**Data Logic:**
```typescript
// Normalize historical prices
const normalizedSeries = historicalPrices.map(price => ({
  date: price.date,
  level: (price.close / initialFixing) * 100
}));

// Add barrier line
const barrierLine = {
  y: barrierPct * 100,
  label: 'Barrier',
  color: 'red'
};
```

**Chart Library:** Recharts (React)

**No AI Used:** Historical data visualization

---

### 9. Break-Even Card (BreakEvenCard.tsx)

**Purpose:** Calculate the exact point where total return = initial investment.

**Formula:**

```
Break-Even Level = 100% - Total Coupons
```

**Example:**
- Coupon: 10% annual for 12 months = 10% total
- Break-even: 100% - 10% = **90%**
- Meaning: Stock can drop to 90% and you still break even

**Logic:**
```typescript
function calculateBreakEven(terms: ReverseConvertibleTerms): number {
  const couponTotal = (terms.couponRatePA * terms.tenorMonths) / 12;
  const breakEvenPct = 100 - (couponTotal * 100);
  
  return breakEvenPct;
}
```

**Visual Display:**
- Large break-even percentage (hero number)
- Distance from current level
- Buffer calculation
- Color coding (safe if current > break-even)

**Conditional Coupon Adjustment:**
```typescript
// If conditional coupons, adjust for trigger
if (terms.couponType === 'conditional') {
  // Only count coupons if trigger met in scenarios
  // This is scenario-dependent, so show range
}
```

**No AI Used:** Pure calculation

---

### 10. Outcome Examples (OutcomeExamples.tsx)

**Purpose:** Scenario table showing outcomes at different final levels.

**Scenarios Calculated:**
- Best case: 120% (stocks up 20%)
- Moderate gain: 110% (stocks up 10%)
- Flat: 100% (no change)
- At barrier: 70% (barrier level)
- Deep loss: 50% (stocks down 50%)

**Table Columns:**
1. Final Level (%)
2. Redemption (cash or shares)
3. Coupons Paid
4. Total Return
5. Break-even Status

**Logic:**
```typescript
function calculateScenario(finalLevel: number): Scenario {
  const couponTotal = (couponRatePA * tenorMonths) / 12;
  
  let redemption: number;
  let deliveryType: 'cash' | 'shares';
  
  if (finalLevel >= barrierPct) {
    redemption = 100;
    deliveryType = 'cash';
  } else {
    redemption = finalLevel;
    deliveryType = 'shares';
  }
  
  const totalReturn = redemption + (couponTotal * 100);
  const breaksEven = totalReturn >= 100;
  
  return { finalLevel, redemption, coupons: couponTotal * 100, totalReturn, breaksEven, deliveryType };
}
```

**No AI Used:** Deterministic calculations for all scenarios

---

### 11. Scenarios Flowchart (ScenariosFlowchart.tsx)

**Purpose:** Visual decision tree showing all possible outcomes.

**Flowchart Structure:**

```
START
  ↓
[Coupon Payments] → "Do you get coupons?"
  ├─ Guaranteed → "Yes, always"
  └─ Conditional → "Only if trigger met"
  ↓
[Maturity Check] → "At maturity..."
  ├─ Final ≥ Barrier → [Cash Redemption]
  │                      → "100% + coupons"
  │
  └─ Final < Barrier → [Share Conversion]
                       → "Shares of worst underlying"
```

**AI Integration:** ✅ **Scenario descriptions use AI templates**

```typescript
// AI-enhanced descriptions (from scenarioDescriptions.ts)
const cashRedemptionDesc = getRCCashRedemption(terms, notional);
// Output: User-friendly explanation with examples

const shareConversionDesc = getRCShareConversion(terms, notional);
// Output: Risk warning with concrete examples
```

**Logic:**
```typescript
// Build flowchart nodes
const nodes = [
  {
    id: 'start',
    type: 'start',
    label: 'Product Start'
  },
  {
    id: 'coupons',
    type: 'decision',
    label: terms.couponType === 'guaranteed' 
      ? 'Coupons paid every period'
      : 'Coupons paid if trigger met',
    description: getCouponDescription(terms)
  },
  {
    id: 'maturity',
    type: 'decision',
    label: 'At maturity...',
    branches: [
      {
        condition: `Final ≥ ${barrierPct}%`,
        next: 'cash_redemption'
      },
      {
        condition: `Final < ${barrierPct}%`,
        next: 'share_conversion'
      }
    ]
  },
  {
    id: 'cash_redemption',
    type: 'outcome',
    label: 'Cash Redemption',
    description: cashRedemptionDesc,
    color: 'success'
  },
  {
    id: 'share_conversion',
    type: 'outcome',
    label: 'Share Conversion',
    description: shareConversionDesc,
    color: 'warning'
  }
];
```

**Rendering:** React Flow (node-based diagram library)

---

### 12. Risks Section (Risks.tsx)

**Purpose:** Disclose all material risks associated with the product.

**Risks Listed:**
1. **Capital Risk:** May receive shares worth less than initial investment
2. **Coupon Risk (if conditional):** May not receive all coupons
3. **Market Risk:** Subject to underlying performance
4. **Liquidity Risk:** Cannot exit before maturity
5. **Conversion Risk:** May be converted to worst-performing stock
6. **Credit Risk:** Issuer default risk

**No AI Used:** Standard regulatory disclosures

---

### 13. Suitability Section (SuitabilitySection.tsx)

**Purpose:** Help investors determine if product is right for them.

**Suitability Criteria:**
- ✅ **Good for:** Income seekers, moderate risk tolerance
- ⚠️ **Consider:** Can tolerate potential 30% loss if barrier breached
- ❌ **Not for:** Risk-averse investors, need liquidity before maturity

**No AI Used:** Template-based guidance

---

## Capital Protection (CPPN)

### Product Characteristics
- **Code:** CPPN
- **Main Feature:** Principal protection (90-100%)
- **Risk:** Low (protected downside)
- **Return:** Leveraged upside participation
- **Variants:** Standard CPPN or CPPN with Knock-In (Airbag)

---

### 1. Hero Header (CppnHeroHeader.tsx)

**Purpose:** Display key KPIs for capital protected product.

**Data Displayed:**
- Product name: "Capital Protected Participation Note"
- Protection level (e.g., "100% Protected")
- Current basket level
- Participation rate (e.g., "120% Participation")
- Distance to knock-in (if enabled)

**Logic:**
```typescript
// Calculate protection status
const isFullyProtected = capitalProtectionPct >= 100;
const protectionFloor = capitalProtectionPct;

// Calculate potential return
const exampleGain = 20; // 20% gain
const yourGain = (exampleGain * participationRatePct) / 100;
const potentialReturn = 100 + yourGain;
```

**KPI Tiles:**
- Protected Floor (percentage)
- Current Level (percentage)
- Participation Rate (multiplier)
- Knock-In Distance (if enabled)

**No AI Used:** Data display only

---

### 2. One-Minute Summary (CppnOneMinuteSummary.tsx)

**Purpose:** Quick overview of capital protection mechanism.

**Content Sections:**
1. **Your Protection:** Guaranteed floor
2. **Your Upside:** Leveraged participation
3. **How It Works:** Participation mechanism
4. **Knock-In:** Conditional protection (if enabled)
5. **Best Case:** Protected floor + leveraged gains
6. **Worst Case:** Protected floor (or geared-put if KI triggered)

**Logic:**
```typescript
const protectionAmount = (notional * capitalProtectionPct) / 100;
const exampleUp = 125; // stocks at 125%
const yourReturn = capitalProtectionPct + ((exampleUp - participationStartPct) * participationRatePct) / 100;
```

**Example Output:**
```
You invest $100,000 in this 12-month note.

✓ Your Protection: 100% guaranteed floor - you get back at least $100,000
✓ Your Upside: For every 1% stocks rise, you gain 1.2%
✓ How It Works: If stocks go up 20%, you get 24% return
⚠ Knock-In: If stocks drop below 70%, protection may be removed
```

**No AI Used:** Template with dynamic values

---

### 3. Product Summary Card (CppnProductSummary.tsx)

**Purpose:** Display CPPN terms and specifications.

**Data Displayed:**
- Capital Protection Level
- Participation Start (strike)
- Participation Rate
- Cap Level (if capped)
- Knock-In Level (if enabled)
- Downside Strike (if KI enabled)
- Basket Type (single/worst-of/best-of/average)

**Logic:**
```typescript
// Build specs
const specs = [
  { label: 'Protection', value: `${capitalProtectionPct}%` },
  { label: 'Participation', value: `${participationRatePct}%` },
  { label: 'Start Level', value: `${participationStartPct}%` }
];

if (capType === 'capped') {
  specs.push({ label: 'Cap', value: `${capLevelPct}%` });
}

if (knockInEnabled) {
  specs.push({ label: 'Knock-In', value: `${knockInLevelPct}%` });
}
```

**No AI Used:** Data formatting

---

### 4. CPPN Payoff Graph (CppnPayoffGraph.tsx)

**Purpose:** Visual representation of CPPN payoff formula.

**Graph Elements:**
- X-axis: Final basket level (50% to 150%)
- Y-axis: Total return (percentage)
- **Payoff curve** (blue line with kink at participation start)
- **Protected floor** (horizontal green line)
- **Participation start** (vertical dashed)
- **Knock-in level** (vertical orange, if enabled)
- **Cap level** (horizontal red, if capped)
- **Current level indicator**

**Payoff Formula:**

#### Standard CPPN (No Knock-In):
```typescript
function calculateCppnPayoff(finalLevel: number): number {
  const R = finalLevel / 100;
  const CP = capitalProtectionPct;
  const PS = participationStartPct / 100;
  const PR = participationRatePct / 100;
  
  // Upside participation
  const UP = PR * Math.max(R - PS, 0) * 100;
  
  // Total return
  let RED = CP + UP;
  
  // Apply cap if enabled
  if (capType === 'capped' && capLevelPct) {
    RED = Math.min(RED, capLevelPct);
  }
  
  return RED;
}
```

**Example:**
- CP = 100%, PS = 100%, PR = 120%, No Cap
- finalLevel = 110% → R = 1.10
- UP = 1.20 × (1.10 - 1.00) × 100 = 12%
- RED = 100% + 12% = **112%**

#### CPPN with Knock-In (Airbag):
```typescript
function calculateCppnPayoff(finalLevel: number): number {
  const X = finalLevel;
  const KI = knockInLevelPct;
  const S = downsideStrikePct || KI;
  
  if (X >= KI) {
    // Above knock-in: standard CPPN payoff
    return calculateStandardCppn(X);
  } else {
    // Below knock-in: geared-put payoff
    // RED = 100 × (X / S)
    return (100 * X) / S;
  }
}
```

**Example:**
- CP = 90%, KI = 70%, S = 77.78% (continuity enforced)
- finalLevel = 65% → X = 65
- Knock-in triggered: RED = (100 × 65) / 77.78 = **83.57%**
- Protected payoff at KI: 90% (smooth transition)

**Continuity Guard:**
```typescript
// If CP < 100 and KI enabled, enforce S_min for smooth payoff
const S_min = KI / (CP / 100);

// Example: CP = 90%, KI = 70%
// S_min = 70 / 0.90 = 77.78%
// This ensures payoff at KI = 90% from both sides
```

**No AI Used:** Pure mathematical visualization

---

### 5. CPPN Break-Even Card (CppnBreakEvenCard.tsx)

**Purpose:** Calculate break-even point for CPPN.

**Formula:**

#### No Knock-In:
```
Break-Even = 100% (always, if fully protected)

If partially protected (CP < 100%):
Break-Even = CP (you break even at the floor)
```

#### With Knock-In:
```
Break-Even depends on participation rate and strike.

If KI not triggered:
Break-Even = 100% (protected)

If KI triggered:
Break-Even = S (downside strike)
```

**Logic:**
```typescript
function calculateCppnBreakEven(terms: CapitalProtectedParticipationTerms): {
  primary: number;
  secondary?: number;
  scenario: string;
} {
  if (terms.knockInEnabled && terms.knockInLevelPct) {
    return {
      primary: 100,
      secondary: terms.downsideStrikePct || terms.knockInLevelPct,
      scenario: 'Knock-in conditional'
    };
  }
  
  if (terms.capitalProtectionPct >= 100) {
    return {
      primary: 100,
      scenario: 'Fully protected'
    };
  }
  
  return {
    primary: terms.capitalProtectionPct,
    scenario: 'Partial protection'
  };
}
```

**Visual Display:**
- Primary break-even (hero number)
- Conditional break-even (if KI)
- Explanation of scenarios
- Safety margin calculation

**No AI Used:** Deterministic calculation

---

### 6. CPPN Outcome Examples (CppnOutcomeExamples.tsx)

**Purpose:** Scenario table for CPPN outcomes.

**Scenarios:**
- Bullish: 130% (stocks up 30%)
- Moderate: 110% (stocks up 10%)
- Flat: 100% (no change)
- Mild loss: 90% (stocks down 10%)
- At knock-in: 70% (if KI enabled)
- Deep loss: 50% (stocks down 50%)

**Table Columns:**
1. Final Level (%)
2. Protected/KI Status
3. Redemption Amount
4. Total Return
5. Participation Applied

**Logic:**
```typescript
function calculateCppnScenario(finalLevel: number): Scenario {
  const result = computeCppnPayoffPct(terms, finalLevel);
  
  return {
    finalLevel,
    redemption: result.redemptionPct * 100,
    knockInTriggered: result.knockInTriggered,
    totalReturn: result.redemptionPct * 100,
    participationApplied: finalLevel >= terms.participationStartPct
  };
}
```

**Example Scenario Table:**

| Final Level | KI Triggered? | Redemption | Total Return | Note |
|-------------|---------------|------------|--------------|------|
| 130% | No | 136% | 136% | Full participation (120%) |
| 110% | No | 112% | 112% | Participation on 10% gain |
| 100% | No | 100% | 100% | At participation start |
| 90% | No | 100% | 100% | Protected floor holds |
| 70% | Yes | 90% | 90% | At knock-in (continuity) |
| 50% | Yes | 64.3% | 64.3% | Geared-put applies |

**No AI Used:** Deterministic calculations

---

### 7. Scenarios Flowchart (ScenariosFlowchart.tsx)

**Purpose:** Visual decision tree for CPPN outcomes.

**Flowchart Structure (Standard CPPN):**

```
START
  ↓
[At Maturity] → "Check final basket level"
  ↓
[Participation Check]
  ├─ Final ≥ Start → [Calculate Participation]
  │                   → CP + (PR × Gain)
  │                   → Apply cap if enabled
  │                   → "Protected floor + leveraged gains"
  │
  └─ Final < Start → [Protected Floor]
                      → CP%
                      → "You get back your floor"
```

**Flowchart Structure (with Knock-In):**

```
START
  ↓
[At Maturity] → "Check final basket level"
  ↓
[Knock-In Check]
  ├─ Final ≥ KI → [Standard CPPN Payoff]
  │              → "Protection active"
  │              → CP + Participation
  │
  └─ Final < KI → [Geared-Put Payoff]
                  → "Protection removed"
                  → 100 × (Final / Strike)
```

**AI Integration:** ✅ **Scenario descriptions**

```typescript
// AI-enhanced descriptions
const protectedOutcome = getCPPNProtectedOutcome(terms, notional);
const participationOutcome = getCPPNParticipationOutcome(terms, notional);
const knockInTriggered = getCPPNKnockInTriggered(terms, notional);

// These return user-friendly explanations with examples
```

**No AI for:** Flowchart structure, decision logic
**AI for:** Scenario explanations

---

## Boosted Growth (Bonus Certificate)

### Product Characteristics
- **Code:** CPPN (with bonusEnabled = true)
- **Main Feature:** Bonus if barrier never breached
- **Risk:** High (no protection, 100% downside)
- **Return:** Bonus level OR participation (whichever higher)
- **Key:** Continuous barrier monitoring

---

### 1. Hero Header (CppnHeroHeader.tsx - Bonus Mode)

**Purpose:** Display bonus certificate KPIs.

**Data Displayed:**
- Product name: "Bonus Certificate"
- Bonus level (e.g., "108% Bonus")
- Bonus barrier (e.g., "60% Barrier")
- Current level
- Distance to barrier
- Barrier status (safe/breached)

**Logic:**
```typescript
// Calculate barrier status
const distanceToBarrier = ((currentLevel - bonusBarrierPct) / bonusBarrierPct) * 100;
const isSafe = currentLevel >= bonusBarrierPct;

// Color coding
const statusColor = isSafe ? 'success' : 'danger';
const statusLabel = isSafe ? 'Bonus Active' : 'Bonus Lost';
```

**KPI Tiles:**
- Bonus Level (percentage - hero number)
- Barrier Level (percentage)
- Safety Margin (percentage above barrier)
- Participation Rate (100% typically)

**No AI Used:** Data display

---

### 2. One-Minute Summary (CppnOneMinuteSummary.tsx - Bonus Mode)

**Purpose:** Explain bonus certificate mechanism.

**Content Sections:**
1. **Your Bonus:** Guaranteed return if barrier safe
2. **The Rule:** Barrier must never be touched
3. **If Breached:** 1:1 with underlying (like owning stock)
4. **Best Case:** Bonus level OR participation gains (higher)
5. **Worst Case:** No protection - full downside

**Logic:**
```typescript
const bonusReturn = bonusLevelPct - 100; // e.g., 108% - 100% = 8% gain
const exampleUp = 120; // stocks at 120%
const yourReturn = Math.max(bonusLevelPct, exampleUp); // 120%
```

**Example Output:**
```
You invest $100,000 in this 12-month certificate.

✓ Your Bonus: 8% guaranteed return if barrier stays safe
✓ The Rule: AAPL must never touch 60% during the product life
⚠ If Breached: You track the stock 1:1 (full downside exposure)
✓ Best Case: If stocks go to 120%, you get 120% (better than bonus)
⚠ Worst Case: If barrier breached and stocks drop to 50%, you get 50%
```

**No AI Used:** Template-based

---

### 3. Bonus Payoff Graph (CppnPayoffGraph.tsx - Bonus Mode)

**Purpose:** Visualize bonus certificate payoff structure.

**Graph Elements:**
- X-axis: Final level (0% to 150%)
- Y-axis: Total return (0% to 150%)
- **Bonus payoff curve:**
  - Flat at bonus level below participation start
  - 1:1 diagonal above participation start
  - OR: 1:1 diagonal if barrier breached
- **Bonus barrier** (vertical red line)
- **Bonus level** (horizontal green line)
- **Participation start** (vertical dashed)

**Payoff Formula:**

#### Barrier NOT Breached:
```typescript
function calculateBonusPayoff(finalLevel: number): number {
  const BL = bonusLevelPct;
  const PS = participationStartPct;
  const PR = participationRatePct;
  
  if (finalLevel < PS) {
    // Below participation start: flat at bonus level
    return BL;
  } else {
    // Above participation start: bonus OR participation (whichever higher)
    const participationPayoff = 100 + (PR / 100) * (finalLevel - PS);
    return Math.max(BL, participationPayoff);
  }
}
```

**Example:**
- BL = 108%, PS = 100%, PR = 100%
- finalLevel = 90% → return = **108%** (flat bonus)
- finalLevel = 120% → participation = 120%, bonus = 108% → return = **120%** (higher)

#### Barrier Breached:
```typescript
function calculateBonusPayoff(finalLevel: number): number {
  // Bonus lost: 1:1 with underlying
  return finalLevel;
}
```

**Example:**
- finalLevel = 50% → return = **50%** (full downside)
- finalLevel = 120% → return = **120%** (full upside)

**No AI Used:** Mathematical visualization

---

### 4. Bonus Outcome Examples (CppnOutcomeExamples.tsx - Bonus Mode)

**Purpose:** Scenario table showing bonus certificate outcomes.

**Scenarios:**
- Strong gain: 130% (bonus or gains)
- Moderate gain: 115% (bonus or gains)
- Mild gain: 105% (bonus or gains)
- Flat/mild loss: 95% (bonus holds)
- At barrier: 60% (critical point)
- Deep loss: 40% (barrier breached)

**Table Columns:**
1. Final Level (%)
2. Barrier Status (Safe/Breached)
3. Bonus Paid (Yes/No)
4. Redemption Amount
5. Total Return

**Logic:**
```typescript
function calculateBonusScenario(
  finalLevel: number,
  barrierBreached: boolean
): Scenario {
  if (!barrierBreached) {
    // Barrier safe: bonus OR participation
    const bonusPayoff = bonusLevelPct;
    const participationPayoff = 
      finalLevel >= participationStartPct
        ? finalLevel
        : bonusLevelPct;
    
    const redemption = Math.max(bonusPayoff, participationPayoff);
    
    return {
      finalLevel,
      barrierStatus: 'Safe',
      bonusPaid: true,
      redemption,
      totalReturn: redemption
    };
  } else {
    // Barrier breached: 1:1 with stock
    return {
      finalLevel,
      barrierStatus: 'Breached',
      bonusPaid: false,
      redemption: finalLevel,
      totalReturn: finalLevel
    };
  }
}
```

**Example Scenario Table:**

| Final Level | Barrier | Bonus? | Redemption | Total Return | Note |
|-------------|---------|--------|------------|--------------|------|
| 130% | Safe | Yes | 130% | 130% | Participation wins |
| 115% | Safe | Yes | 115% | 115% | Participation wins |
| 105% | Safe | Yes | 108% | 108% | Bonus wins |
| 95% | Safe | Yes | 108% | 108% | Bonus wins |
| 60% | Safe | Yes | 108% | 108% | Bonus at barrier |
| 40% | Breached | No | 40% | 40% | Full downside |

**No AI Used:** Deterministic calculations

---

### 5. Bonus Scenarios Flowchart (ScenariosFlowchart.tsx - Bonus Mode)

**Purpose:** Decision tree for bonus certificate.

**Flowchart Structure:**

```
START
  ↓
[Barrier Monitoring] → "Was barrier ever touched during product life?"
  ├─ NO → [Bonus Active]
  │       ↓
  │       [At Maturity: Check final level]
  │       ├─ Final < PS → [Bonus Level]
  │       │               → "108% guaranteed"
  │       │
  │       └─ Final ≥ PS → [Max(Bonus, Participation)]
  │                       → "108% OR final level (higher)"
  │
  └─ YES → [Bonus Lost]
           ↓
           [1:1 Participation]
           → "Track stock exactly"
           → "Full upside, full downside"
```

**AI Integration:** ✅ **Scenario descriptions**

```typescript
// AI-enhanced descriptions
const bonusEarned = getBonusCertificateBonus(terms, notional);
const bonusLost = getBonusCertificateBarrierBreached(terms, notional);

// Output: User-friendly explanations with examples
```

**Logic:**
```typescript
// Build flowchart nodes
const nodes = [
  {
    id: 'barrier_check',
    type: 'decision',
    label: 'Barrier Monitoring',
    question: `Has underlying ever touched ${bonusBarrierPct}%?`,
    critical: true
  },
  {
    id: 'bonus_active',
    type: 'outcome',
    label: 'Bonus Active 🎁',
    description: bonusEarned,
    color: 'success'
  },
  {
    id: 'bonus_lost',
    type: 'outcome',
    label: 'Bonus Lost ⛔',
    description: bonusLost,
    color: 'danger'
  }
];
```

**No AI for:** Flowchart structure
**AI for:** Descriptions

---

## Mathematical Formulas

### Reverse Convertible Formulas

#### 1. Worst-Of Level Calculation
```
For each underlying i:
  Level_i = Spot_i / Initial_i

Worst-Of Level = min(Level_1, Level_2, ..., Level_n)
```

#### 2. Coupon Calculation
```
Coupon per Period = Notional × (Coupon Rate PA / Frequency)

Total Coupons = Coupon per Period × Number of Periods

Number of Periods = floor(Tenor Months / (12 / Frequency))
```

**Example:**
- Notional: $100,000
- Coupon Rate: 10% p.a.
- Frequency: Quarterly (4)
- Tenor: 12 months

```
Coupon per Period = $100,000 × (0.10 / 4) = $2,500
Number of Periods = floor(12 / (12/4)) = 4
Total Coupons = $2,500 × 4 = $10,000
```

#### 3. Standard Barrier RC Payoff
```
If Worst-Of Level ≥ Barrier:
  Redemption = 100%
  Total Return = 100% + Coupons

Else:
  Redemption = Worst-Of Level
  Total Return = Worst-Of Level + Coupons
```

#### 4. Low Strike Geared Put Payoff
```
Gearing = 1 / Strike

If Worst-Of Level ≥ Knock-In Barrier:
  Redemption = 100%
  Total Return = 100% + Coupons

Else:
  Redemption = Worst-Of Level / Strike
  Total Return = (Worst-Of Level / Strike) + Coupons
```

**Example:**
- Strike: 55%
- Knock-In: 55%
- Final Level: 50%
- Coupons: 10%

```
Gearing = 1 / 0.55 = 1.82x

Redemption = 50% / 55% = 90.91%
Total Return = 90.91% + 10% = 100.91%

vs. Direct Stock Ownership: 50%
Benefit: 50.91% less loss
```

#### 5. Break-Even Calculation
```
Break-Even Level = 100% - Total Coupons

If Total Coupons = 10%:
Break-Even = 90%
```

### CPPN Formulas

#### 1. Basket Level Calculation
```
Single: Basket Level = Spot / Initial

Worst-Of: Basket Level = min(Spot_i / Initial_i)

Best-Of: Basket Level = max(Spot_i / Initial_i)

Average: Basket Level = mean(Spot_i / Initial_i)
```

#### 2. Standard CPPN Payoff (No Knock-In)
```
R = Final Basket Level / 100  (as ratio)

Upside Participation (UP):
  UP = PR × max(R - PS, 0) × 100

Where:
  PR = Participation Rate (as decimal)
  PS = Participation Start (as decimal)

Redemption (RED):
  RED_raw = CP + UP

Apply Cap (if enabled):
  RED = min(RED_raw, CAP)

Return:
  RED = max(0, RED)  (never negative)
```

**Example 1:** Standard CPPN
- CP = 100%, PS = 100%, PR = 120%, No Cap
- Final Level = 110% → R = 1.10

```
UP = 1.20 × max(1.10 - 1.00, 0) × 100
   = 1.20 × 0.10 × 100
   = 12%

RED = 100% + 12% = 112%
```

**Example 2:** With Cap
- CP = 100%, PS = 100%, PR = 150%, CAP = 125%
- Final Level = 120% → R = 1.20

```
UP = 1.50 × max(1.20 - 1.00, 0) × 100
   = 1.50 × 0.20 × 100
   = 30%

RED_raw = 100% + 30% = 130%
RED = min(130%, 125%) = 125% (capped)
```

#### 3. CPPN with Knock-In (Airbag)
```
If Final ≥ Knock-In Level:
  // Standard CPPN payoff
  RED = CP + UP (with cap if enabled)

Else:
  // Geared-put payoff
  RED = 100 × (Final / Strike)
```

**Continuity Guard (if CP < 100%):**
```
S_min = KI / (CP / 100)

Enforced Strike = max(S, S_min)

This ensures:
- Payoff at KI from above = CP
- Payoff at KI from below = 100 × (KI / S_min) = CP
```

**Example:**
- CP = 90%, PS = 100%, PR = 120%
- KI = 70%, S_min = 70 / 0.90 = 77.78%
- Final = 65%

```
// Knock-in triggered
RED = 100 × (65 / 77.78) = 83.57%

// Check continuity at KI = 70%:
// From above: CP = 90%
// From below: 100 × (70 / 77.78) = 90% ✓
```

### Bonus Certificate Formulas

#### 1. Bonus Payoff (Barrier Not Breached)
```
If Final < Participation Start:
  RED = Bonus Level

Else:
  Participation Payoff = 100 + PR × (Final - PS)
  RED = max(Bonus Level, Participation Payoff)
```

**Example 1:** Below Participation Start
- BL = 108%, PS = 100%, Final = 95%

```
RED = 108% (flat bonus)
```

**Example 2:** Above Participation Start
- BL = 108%, PS = 100%, PR = 100%, Final = 115%

```
Participation = 100 + 1.00 × (115 - 100) = 115%
RED = max(108%, 115%) = 115%
```

#### 2. Bonus Payoff (Barrier Breached)
```
RED = Final Level (1:1 with underlying)
```

**Example:**
- Final = 50%

```
RED = 50% (full downside)
```

---

## Scenario Generation Logic

### How Scenarios Are Created

Each report generates 5-7 scenarios to show a range of outcomes:

#### Regular Income Scenarios
```typescript
const scenarios = [
  { level: 120, label: 'Best Case' },
  { level: 110, label: 'Moderate Gain' },
  { level: 100, label: 'Flat' },
  { level: barrierPct * 100, label: 'At Barrier' },
  { level: 70, label: 'Below Barrier' },
  { level: 50, label: 'Deep Loss' }
];
```

#### CPPN Scenarios
```typescript
const scenarios = [
  { level: 130, label: 'Strong Gain' },
  { level: 110, label: 'Moderate Gain' },
  { level: 100, label: 'Flat' },
  { level: 90, label: 'Mild Loss' },
  { level: knockInLevelPct, label: 'At Knock-In' },
  { level: 50, label: 'Deep Loss' }
];
```

#### Bonus Certificate Scenarios
```typescript
const scenarios = [
  { level: 130, label: 'Strong Gain', barrierSafe: true },
  { level: 115, label: 'Moderate Gain', barrierSafe: true },
  { level: 95, label: 'Below Start', barrierSafe: true },
  { level: bonusBarrierPct, label: 'At Barrier', barrierSafe: true },
  { level: 50, label: 'Barrier Breached', barrierSafe: false }
];
```

### Scenario Descriptions (Plain English)

**File:** `src/services/scenarioDescriptions.ts`

Each scenario has a user-friendly description generated from templates:

```typescript
// Example: RC Cash Redemption
{
  title: "Stock Stays Above 70%",
  lines: [
    "✓ You get back all your money (100%)",
    "✓ Plus 10% annual income paid quarterly",
    "✓ Total return: ~110% after 12 months"
  ],
  example: "If you invest $100k, you receive $110k"
}
```

These are NOT generated by AI in real-time. They are:
- **Template-based** with dynamic values
- **Pre-written** for clarity and consistency
- **Regulatory compliant**

---

## Data Flow

### End-to-End Report Generation

```
1. USER INPUT (ProductInputForm.tsx)
   ↓
   [Validates terms, fetches initial fixings]
   ↓
2. REPORT GENERATOR (useReportGenerator.ts)
   ↓
   [Fetches market data, historical prices]
   ↓
3. PAYOFF ENGINE (engine.ts)
   ↓
   [Calculates payoff curve, break-even, scenarios]
   ↓
4. AI CONTENT (optional - useAIContentGeneration.ts)
   ↓
   [Generates insights, export documents]
   ↓
5. REPORT DISPLAY (Report components)
   ↓
   [Renders all cards with calculated data]
```

### Data Sources

| Data Type | Source | API | Caching |
|-----------|--------|-----|---------|
| Stock Prices | Yahoo Finance | yfinance (Python) | 5 min |
| Company Info | Financial Modeling Prep | REST API | 1 day |
| Historical Data | Yahoo Finance | yfinance | 1 hour |
| News | Marketaux | REST API | 5 min |
| AI Insights | OpenAI GPT-4 | REST API | Per report |

### Caching Strategy

```typescript
// Market data cache
const marketDataCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// AI content cache
const aiContentCache = new Map<string, { content: any, timestamp: number }>();
const AI_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Check cache before API call
function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data;
  }
  return null;
}
```

---

## Summary

### Key Takeaways for Developers

1. **Three Products, Shared Architecture**
   - RC: Coupons + barrier
   - CPPN: Protection + participation
   - Bonus: Bonus + barrier

2. **AI is Strategic, Not Core**
   - Payoff calculations: Deterministic (exact math)
   - Market data: Real-time APIs
   - Insights: AI-enhanced (adds value)
   - Scenarios: Template-based (consistent)

3. **Mathematical Precision**
   - All formulas are deterministic
   - Break-even is exact
   - Payoff curves are computed, not estimated

4. **Regulatory Compliance**
   - All risks disclosed
   - Scenarios based on exact formulas
   - No AI-generated financial advice

5. **User Experience**
   - Plain English explanations
   - Visual graphs for understanding
   - Concrete examples with dollar amounts
   - Decision trees for clarity

### File Structure Quick Reference

```
src/
├── components/report/          # All report cards
│   ├── *Report.tsx            # Main containers
│   ├── *HeroHeader.tsx        # KPI displays
│   ├── *ProductSummary.tsx    # Product specs
│   ├── *PayoffGraph.tsx       # Payoff curves
│   ├── *BreakEvenCard.tsx     # Break-even
│   ├── *OutcomeExamples.tsx   # Scenario tables
│   └── ScenariosFlowchart.tsx # Decision trees
│
├── products/                   # Calculation engines
│   ├── reverseConvertible/
│   │   ├── engine.ts          # RC payoff formulas
│   │   ├── breakEven.ts       # RC break-even
│   │   └── terms.ts           # RC types
│   │
│   └── capitalProtectedParticipation/
│       ├── engine.ts          # CPPN/Bonus formulas
│       ├── breakEven.ts       # CPPN break-even
│       ├── guards.ts          # Continuity checks
│       └── terms.ts           # CPPN types
│
├── services/
│   ├── ai/
│   │   ├── aiReportAssistant.ts    # Conversational builder
│   │   ├── aiContentGenerator.ts   # Export documents
│   │   └── aiDataEnricher.ts       # Market data enrichment
│   │
│   ├── aiInsights.ts          # Company insights
│   ├── scenarioDescriptions.ts # Plain English scenarios
│   └── newsAggregator.ts      # News integration
│
└── hooks/
    ├── useReportGenerator.ts  # Main report orchestrator
    ├── useAIContentGeneration.ts # AI content hook
    └── usePayoffCalculation.ts # Payoff hook
```

---

**End of Documentation**

For questions or clarifications, refer to:
- Code comments in engine files
- Type definitions in terms.ts files
- This documentation

**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Maintained By:** Valura.ai Development Team
