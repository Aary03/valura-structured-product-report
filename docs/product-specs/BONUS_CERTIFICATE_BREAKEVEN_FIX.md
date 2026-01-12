# Bonus Certificate Break-Even & Outcome Examples Fix

## Summary
Fixed the **"If you invest $100,000"** outcome table and **Break-Even Analysis** card to properly handle Bonus Certificate payoff logic.

## Issues Fixed

### 1. Outcome Examples Table - Missing Base 100%
**Problem:** The table was showing only the participation gain, not the total payoff.
- ❌ At 160%: Showed **72%** (just the gain)
- ✅ At 160%: Should show **172%** (100% + 72% gain)

**Root Cause:** `CppnOutcomeExamples.tsx` only implemented standard CPPN logic, not bonus certificate logic.

**Fix:** Added proper bonus certificate payoff formula:
```typescript
// Barrier NOT breached, above participation start:
P = 100 + ParticipationRate × (X - ParticipationStart)
RED = max(BonusFloor, P_capped)

// Example: X=160%, K=100%, PR=120%, BL=108%
P = 100 + 1.2 × (160 - 100) = 172%
RED = max(108%, 172%) = 172% ✓
```

### 2. Break-Even Analysis - Incorrect Calculation
**Problem:** Break-even was calculated as **183.3%** using standard CPPN formula, which is meaningless for bonus certificates.

**Why Wrong:** 
- Standard CPPN formula: `X = K + (100 - P) / a`
- For bonus cert (P=0%, K=100%, a=120%): X = 100 + 100/1.2 = **183.3%**
- This ignores the **bonus floor (108%)** completely!

**Reality for Bonus Certificates:**
- If barrier **NOT** breached (X ≥ 60%):
  - Below 100%: You get **108%** → Always profitable! ✓
  - At 100%: You get **max(108%, 100%)** = **108%** → Always profitable! ✓
  - At 160%: You get **172%** → Always profitable! ✓
- If barrier **IS** breached (X < 60%):
  - You get **X** (1:1 tracking) → Maximum 60% at barrier → Always a loss

**Fix:** Added special `bonus_conditional` break-even type:
```typescript
if (BonusFloor >= 100%) {
  return { 
    kind: 'bonus_conditional',
    bonusFloorPct: 108,
    barrierPct: 60
  };
}
```

## Updated Components

### 1. `src/products/capitalProtectedParticipation/breakEven.ts`
- ✅ Added `BreakEvenResult` union type with new `bonus_conditional` case
- ✅ Added bonus certificate detection and logic
- ✅ Returns conditional break-even when bonus floor ≥ 100%

### 2. `src/components/report/CppnBreakEvenCard.tsx`
- ✅ Added beautiful bonus certificate UI with gradient cards
- ✅ Shows "You're Always Profitable" message with green gradient
- ✅ Explains barrier logic with emoji indicators (🎁 ✓ ⚠️)
- ✅ Clear warning about not touching the barrier
- ✅ Three-card layout:
  1. **Break-even display** (mint gradient with Gift icon)
  2. **Always profitable explanation** (mint background)
  3. **Barrier warning** (red background)

### 3. `src/components/report/CppnOutcomeExamples.tsx`
- ✅ Added full bonus certificate payoff logic
- ✅ Proper formula: `P = 100 + PR × (X - K)` with bonus floor
- ✅ Updated regime labels: "Participating" vs "Barrier Breached"
- ✅ Added explanatory footer for bonus certificates

## Verification

### Test Case: Bonus Certificate
- **Ticker:** AAPL
- **Tenor:** 12M
- **Bonus:** 108%
- **Barrier:** 60%
- **Strike:** 100%
- **Participation:** 120%
- **Cap:** None

### Expected Outcomes (Now Correct!)

| Final Basket Level | Regime | Payoff | Redemption | Total Return |
|-------------------|--------|--------|------------|--------------|
| 160% | Participating | **172.0%** | **$172,000** | **+72.0%** |
| 140% | Participating | **148.0%** | **$148,000** | **+48.0%** |
| 120% | Participating | **124.0%** | **$124,000** | **+24.0%** |
| 100% | Protected | **108.0%** | **$108,000** | **+8.0%** |
| 90% | Protected | **108.0%** | **$108,000** | **+8.0%** |
| 70% | Protected | **108.0%** | **$108,000** | **+8.0%** |

### Break-Even Display (Now Correct!)
**Breakeven basket level (X): 108.0%**
- 🎁 You're Always Profitable (if barrier not breached)
- ✓ Minimum return: **108%** – guaranteed!
- ⚠️ Key: Don't let stocks touch 60% during the product life

## Technical Details

### Bonus Certificate Payoff Formula (Engine)
```typescript
if (barrierNotBreached) {
  if (X < ParticipationStart) {
    // Below participation: flat bonus
    return BonusLevel;
  }
  
  // Participation regime
  P = 100 + ParticipationRate × (X - ParticipationStart);
  P_capped = Cap ? min(P, Cap) : P;
  RED = max(BonusLevel, P_capped);
  
  return RED;
} else {
  // Barrier breached: 1:1 tracking
  return X;
}
```

### Break-Even Logic
```typescript
if (bonusEnabled && BonusLevel >= 100) {
  // Always profitable if barrier not breached
  return {
    kind: 'bonus_conditional',
    bonusFloorPct: BonusLevel,
    barrierPct: Barrier
  };
}
```

## User Experience Improvements

### Before:
- ❌ Confusing payoff percentages (72%, 48%, 24% instead of 172%, 148%, 124%)
- ❌ Misleading break-even (183.3% which is unreachable and wrong)
- ❌ No explanation of bonus certificate mechanics

### After:
- ✅ Correct payoff percentages with base 100% included
- ✅ Clear "Always Profitable" messaging with bonus floor
- ✅ Beautiful gradient cards with emoji indicators
- ✅ Detailed explanation of barrier mechanics
- ✅ Accurate regime labels (Participating vs Protected vs Barrier Breached)

## Files Modified
1. `src/products/capitalProtectedParticipation/breakEven.ts`
2. `src/components/report/CppnBreakEvenCard.tsx`
3. `src/components/report/CppnOutcomeExamples.tsx`

## Dependencies
- No new dependencies added
- Uses existing Lucide icons: `Gift`, `TrendingUp`, `Target`, `Shield`, `AlertCircle`
- Compatible with existing TypeScript types (used `ReturnType<>` in hook)

---

**Status:** ✅ Complete and tested
**Breaking Changes:** None (additive only)
**Deployment:** Auto-reload via Vite dev server
