# Scenario UX Improvement Plan

## Objective
Transform technical, formula-heavy scenario descriptions into **clear, investor-friendly language** that anyone can understand, regardless of financial background.

---

## Current State Analysis

### Products Covered
1. **Reverse Convertible (RC)**
   - Standard Barrier RC
   - Low Strike / Geared Put RC

2. **Capital Protected Participation Note (CPPN)**
   - Standard CPPN
   - CPPN with Knock-In
   - CPPN with Cap
   - Bonus Certificate

### Current Problems
❌ **Technical formulas**: "Payoff% = 100 × (X / S)"  
❌ **Jargon**: "airbag-style", "geared put regime"  
❌ **Complex notation**: "P + a × (X − K)"  
❌ **Math symbols**: α, K, P, S, KI, UP  
❌ **Unclear consequences**: What does this mean for my money?

---

## Target User Experience

### Principles
1. **Plain English**: No formulas, no math symbols
2. **Outcome-focused**: Tell them what they'll GET, not how it's calculated
3. **Concrete examples**: Use dollar amounts when possible
4. **Relatable language**: "Your money" vs "Notional", "Profit" vs "Redemption%"
5. **Visual clarity**: Use simple, direct statements

### Example Transformation

**BEFORE (Technical):**
```
Protection floor is removed in this regime
Payoff% = 100 × (X / S)
S = 70% (airbag-style by default)
```

**AFTER (User-Friendly):**
```
Your capital protection no longer applies
You receive $1 for every $1 the underlying moves
If the stock drops to 60%, you get back 86% of your investment
```

---

## Implementation Plan

### Phase 1: Create User-Friendly Text Service ✅
**File**: `src/services/scenarioDescriptions.ts`

**Functions**:
- `generateFriendlyDescription(productType, scenario, terms)` → Plain English description
- `getConcreteExample(scenario, notional)` → Dollar example
- Optional: Use OpenAI API for dynamic generation

**Output Format**:
```typescript
{
  title: "Your Money is Protected" (instead of "Protected Participation Regime"),
  description: "No matter how low the stocks go, you'll get back at least 100% of your investment",
  bullets: [
    "Minimum return: 100% (you can't lose money)",
    "If stocks go up 20%, you gain 24% (1.2x participation)",
    "Your upside is capped at 140%"
  ],
  example: "If you invest $100,000 and stocks rise 30%, you receive $140,000 (capped)"
}
```

### Phase 2: Update Scenario Builders 🔄
**Files**:
- `src/components/scenarios/builders/buildCPPNFlow.ts`
- `src/components/scenarios/builders/buildRCFlow.ts`

**Changes**:
- Replace formula lines with plain English
- Add concrete dollar examples
- Use emotionally resonant language

### Phase 3: Enhance Visual Display 🎨
**File**: `src/components/scenarios/ScenarioFlowchart.tsx`

**Enhancements**:
- Add "What this means for you" section
- Include example calculations in dollars
- Add visual indicators (👍 upside, 🛡️ protection, ⚠️ risk)
- Make condition questions clearer

### Phase 4: PDF Compatibility ✅
**Files**:
- `src/components/pdf/PdfReverseConvertibleReport.tsx`
- `src/components/pdf/PdfCapitalProtectedParticipationReport.tsx`

**Ensure**:
- User-friendly text displays correctly in PDF
- Formatting is clean and professional
- Examples fit within page layout

---

## Product-Specific Improvements

### 1. Reverse Convertible (Standard Barrier)

#### Current (Technical)
```
YES:
- 100% notional returned
- Coupons paid as scheduled (unconditional)

NO:
- Converted into worst-performing underlying
- Shares delivered = Notional / (Initial Fixing × CR)
- Final value = Shares × Final Price
```

#### Improved (User-Friendly)
```
✅ STOCKS STAY ABOVE 70% (Good Scenario):
- You get back: All your money (100%)
- Plus: 10% annual income paid every quarter
- Total return: ~110% after 1 year

❌ STOCKS DROP BELOW 70% (Risk Scenario):
- Instead of cash, you receive shares
- Value depends on how low stocks went
- Example: If stocks drop to 50%, you get back ~50% in shares
- Plus: You still keep all coupon payments
```

### 2. Reverse Convertible (Geared Put)

#### Current (Technical)
```
NO:
- Downside is geared below Strike (55%)
- Payoff% = (Final Level / Strike) × 100% (Gearing: 1.82x)
- Shares delivered = Notional / (Initial × 0.55 × CR)
- Below strike, losses are amplified by gearing = 1.82x
```

#### Improved (User-Friendly)
```
❌ STOCKS DROP BELOW 55% (Risk Scenario):
- Your losses are reduced (cushioned) compared to owning the stock
- You lose less than you would if you owned shares directly
- Example: If stocks drop to 45% (down 55%), you get back 82%
- Plus: You still keep all your high coupon payments
- This "gearing" effect softens the blow of big drops
```

### 3. CPPN (Standard)

#### Current (Technical)
```
YES: Participating Outcome
- Payoff% = max(P, P + a × (X − K))
- Capped at 140%

NO: Protected Outcome
- Payoff% = 100% (floor)
- No participation in this region
```

#### Improved (User-Friendly)
```
📈 STOCKS GO UP (Profit Scenario):
- Your floor: 100% (you can't lose money)
- Your upside: 1.2x the stock gains
- Example: Stocks +20% → You get +24%
- Maximum gain: 140% (capped)

📊 STOCKS STAY FLAT OR DROP (Protected Scenario):
- You get back: 100% of your investment
- No losses, no matter how far stocks fall
- Peace of mind: Your principal is protected
```

### 4. CPPN with Knock-In

#### Current (Technical)
```
YES: Knock-in Regime (Geared Put)
- Protection floor is removed in this regime
- Payoff% = 100 × (X / S)
- S = 70% (airbag-style by default)

NO: Protected Participation Regime
- Floor: 100%
- Participation starts at K = 100%
- Rate: 120% (upside)
```

#### Improved (User-Friendly)
```
⚠️ STOCKS DROP BELOW 70% (Protection Removed):
- Your safety net no longer applies
- You participate 1-to-1 in the losses
- Example: Stocks at 65% → You get back 93%
- Still better than: Owning stocks directly (would be 65%)

✅ STOCKS STAY ABOVE 70% (Full Protection):
- Your money is protected: 100% minimum
- If stocks go up: You get 1.2x the gains
- Example: Stocks +25% → You get +30%
```

### 5. Bonus Certificate

#### Current (Technical)
```
YES: Bonus regime
- if X < PS: RED = BL (bonus floor)
- else: RED = max(BL, 100 + PR × (R - PS/100) × 100)
- Apply cap, Apply bonus floor

NO: Downside (barrier breached)
- RED = 100 × R (1:1 downside)
```

#### Improved (User-Friendly)
```
🎁 STOCKS STAY ABOVE 60% (Bonus Earned):
- Minimum you receive: 108% (bonus!)
- If stocks go up: You get even more (1:1 participation)
- Example: Stocks at 90% → You still get 108%
- Example: Stocks at 120% → You get 120%
- Your bonus is locked in unless barrier touched

⛔ STOCKS TOUCH 60% (Bonus Lost):
- You lose the bonus protection
- You track the stock 1-to-1
- Example: Stocks at 55% → You get back 55%
- Key: Don't let stocks touch 60% during the year
```

---

## User-Friendly Language Guidelines

### ✅ DO USE:
- "Your investment" instead of "Notional"
- "You receive" instead of "Redemption"
- "Profit" instead of "Payoff%"
- "Stock price" instead of "Final Level X"
- "Goes up/down" instead of "Performance R"
- "Protected" instead of "Capital Protection Floor"
- "Maximum gain" instead of "Cap"
- "Safety threshold" instead of "Knock-In Barrier"
- Concrete $ examples

### ❌ DON'T USE:
- Math formulas: `Payoff% = 100 × (X / S)`
- Greek letters: α, β, σ
- Technical terms: "geared put", "airbag", "regime"
- Single letters: P, K, S, KI, UP, RED
- Passive voice: "Capital is protected" → "Your money is protected"
- Abstract %: "110%" → "$110,000 on $100k invested"

---

## Example Calculation Integration

### Format
```
💡 Example: If you invest $100,000
  Scenario 1: Stocks stay flat → You get $110,000 (coupons only)
  Scenario 2: Stocks +20% → You get $124,000 (1.2x upside)
  Scenario 3: Stocks -30% → You get $100,000 (protected)
```

### Show in:
1. Scenario outcome boxes
2. One-minute summary
3. Outcome examples section
4. PDF report

---

## OpenAI Integration (Optional Enhancement)

### Use Cases
1. **Dynamic scenario generation** based on current market conditions
2. **Personalized language** based on investor sophistication level
3. **Real-time Q&A** on scenario outcomes

### Implementation
```typescript
// src/services/scenarioAI.ts
export async function generateScenarioDescription(params: {
  productType: 'RC' | 'CPPN' | 'Bonus';
  scenario: 'protected' | 'knock-in' | 'participation' | 'bonus';
  terms: ProductTerms;
  notional: number;
  sophisticationLevel: 'beginner' | 'intermediate' | 'advanced';
}): Promise<FriendlyScenarioDescription>
```

### Benefits
- Context-aware explanations
- Adapts to user background
- Always up-to-date phrasing
- Can incorporate live market data

---

## Testing & Validation

### Test Audience
- [ ] Non-finance professionals
- [ ] Retail investors
- [ ] Financial advisors
- [ ] Internal team

### Success Metrics
1. **Comprehension**: Can user explain scenario without seeing report?
2. **Confidence**: Does user feel confident in their understanding?
3. **Time-to-understand**: < 30 seconds per scenario
4. **Preference**: 90%+ prefer new vs old descriptions

### A/B Test
- Show 50% users old (technical) version
- Show 50% users new (friendly) version
- Measure: time spent, click-through on "learn more", conversion

---

## Rollout Plan

### Week 1: Foundation
- [x] Create this plan
- [ ] Implement `scenarioDescriptions.ts` service
- [ ] Write all user-friendly descriptions
- [ ] Unit test each description

### Week 2: Integration
- [ ] Update `buildCPPNFlow.ts`
- [ ] Update `buildRCFlow.ts`
- [ ] Update `ScenarioFlowchart.tsx` UI
- [ ] Add dollar examples throughout

### Week 3: PDF & Polish
- [ ] Ensure PDF compatibility
- [ ] Test all products end-to-end
- [ ] Get internal feedback
- [ ] Refine language

### Week 4: Launch
- [ ] Deploy to production
- [ ] Monitor user feedback
- [ ] Iterate on language
- [ ] Consider OpenAI enhancement

---

## Long-Term Vision

### Future Enhancements
1. **Interactive scenarios**: Let user drag slider to see outcomes
2. **Video explanations**: Auto-generate short explainer videos
3. **Voice narration**: Read scenarios aloud
4. **Multilingual**: Translate to Spanish, Chinese, etc.
5. **Personalization**: Adjust language based on user's financial literacy

---

## Approval & Sign-Off

- [ ] Product Manager approval
- [ ] Legal/Compliance review (ensure accuracy)
- [ ] Design review (visual consistency)
- [ ] Engineering review (implementation feasibility)

---

**Next Step**: Implement Phase 1 - Create the user-friendly text service and write all descriptions. Would you like me to proceed?

