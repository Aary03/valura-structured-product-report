# ⚡ Autocall Step-Down - New Feature

## Overview

**Autocall Step-Down** is an enhanced autocall feature where the trigger level **decreases at each observation**, making early redemption more likely as time passes.

---

## 🎯 How It Works

### Traditional Fixed Autocall:
```
Every observation checks: Is level ≥ 100%?

Observation 1 (3 months):  100% trigger
Observation 2 (6 months):  100% trigger
Observation 3 (9 months):  100% trigger
Observation 4 (12 months): 100% trigger

Only calls if stock stays at or above 100%
```

### Step-Down Autocall ⭐ NEW:
```
Each observation has LOWER trigger:

Observation 1 (3 months):  100% trigger
Observation 2 (6 months):  95% trigger  ↓
Observation 3 (9 months):  90% trigger  ↓
Observation 4 (12 months): 85% trigger  ↓

Gets easier to trigger over time!
```

---

## 💡 Why Step-Down?

### Investor Benefit:
- **Early = Harder to trigger** (100%)
- **Later = Easier to trigger** (85%)
- Compensates for holding longer
- Increases probability of early exit
- Better for sideways/moderate markets

### Example Scenario:

**Stock Performance:**
- Month 3: 98% (below 100%) → No autocall
- Month 6: 96% (above 95%!) → **AUTOCALLED! ⚡**

**Traditional autocall:**
→ Would NOT have triggered (98% < 100%)
→ Hold until maturity

**Step-down autocall:**
→ TRIGGERS at month 6! (96% ≥ 95%)
→ Early exit with principal + 2 coupons
→ Investor is happy! 🎉

---

## 🎮 How to Set Up

### In Product Input Form:

1. **Enable Autocall:** Check the box
2. **Enable Step-Down:** Check "Enable Step-Down"
3. **Starting Level:** 100% (first observation)
4. **Step Size:** 5% (decrease per observation)
5. **Frequency:** Quarterly (or match coupons)

**System automatically generates:**
```
Observation 1: 100%
Observation 2: 95%  (100% - 5%)
Observation 3: 90%  (95% - 5%)
Observation 4: 85%  (90% - 5%)
```

---

## 📊 Visual Display in Tracker

### Autocall Step-Down Schedule Card:

```
┌──────────────────────────────────────────┐
│ ⚡ Step-Down Autocall Schedule           │
├──────────────────────────────────────────┤
│                                          │
│ ○ Observation #1                    100% │
│   Apr 12, 2026 • Day 90                  │
│                                          │
│ ○ Observation #2                     95% │
│   Jul 12, 2026 • Day 180       ↓ -5%    │
│                                          │
│ ○ Observation #3                     90% │
│   Oct 12, 2026 • Day 270       ↓ -5%    │
│                                          │
│ ○ Observation #4                     85% │
│   Jan 12, 2027 • Day 365       ↓ -5%    │
│                                          │
│ Current Basket Level: 96%                │
│ ✓ Above next autocall level (95%)       │
└──────────────────────────────────────────┘
```

### When Triggered:

```
┌──────────────────────────────────────────┐
│ 🎊 AUTOCALL TRIGGERED!                   │
│ Early redemption at observation #2       │
├──────────────────────────────────────────┤
│ Investment Called Early!                 │
│                                          │
│ Observation #2     |  Total Payout      │
│ Jul 12, 2026       |  $105,000          │
│ Level: 95%         |                     │
├──────────────────────────────────────────┤
│ ✓ Observation #1: 100% [PASSED]         │
│ ✓ Observation #2: 95%  [TRIGGERED ⚡]    │
│ ○ Observation #3: 90%  [NOT REACHED]    │
│ ○ Observation #4: 85%  [NOT REACHED]    │
└──────────────────────────────────────────┘
```

---

## 🔢 Calculation Examples

### Example 1: 12-Month Tenor, Quarterly Observations

**Settings:**
- Start Level: 100%
- Step Size: 5%
- Frequency: Quarterly (4 observations)

**Generated Schedule:**
```
Obs 1: Month 3  → 100%
Obs 2: Month 6  → 95%  (-5%)
Obs 3: Month 9  → 90%  (-5%)
Obs 4: Month 12 → 85%  (-5%)
```

### Example 2: 24-Month Tenor, Semi-Annual Observations

**Settings:**
- Start Level: 100%
- Step Size: 10%
- Frequency: Semi-Annual (4 observations)

**Generated Schedule:**
```
Obs 1: Month 6  → 100%
Obs 2: Month 12 → 90%  (-10%)
Obs 3: Month 18 → 80%  (-10%)
Obs 4: Month 24 → 70%  (-10%)
```

### Example 3: Aggressive Step-Down

**Settings:**
- Start Level: 105%
- Step Size: 3%
- Frequency: Quarterly

**Generated Schedule:**
```
Obs 1: Month 3  → 105%
Obs 2: Month 6  → 102% (-3%)
Obs 3: Month 9  → 99%  (-3%)
Obs 4: Month 12 → 96%  (-3%)
```

---

## 💰 Impact on Returns

### Scenario: Stock at 97% Throughout

**Fixed Autocall (100%):**
```
Obs 1-4: All check if level ≥ 100%
Stock at 97%: NEVER triggers
Hold to maturity
Final: $97,000 + coupons
```

**Step-Down Autocall (100%, 95%, 90%, 85%):**
```
Obs 1: 97% < 100% → No autocall
Obs 2: 97% ≥ 95%  → AUTOCALLS! ⚡

Payout: $100,000 + $5,000 coupons = $105,000
Early exit at month 6
Return: +5% (vs -3% + coupons at maturity)
```

**Winner:** Step-down by far! Gets you out early with profit instead of small loss.

---

## 🎯 Optimal Settings

### Conservative (Easy to Trigger):
```
Start: 100%
Step: 10%
Schedule: 100%, 90%, 80%, 70%
→ Very likely to trigger early
→ Good for cautious investors
```

### Balanced (Moderate):
```
Start: 100%
Step: 5%
Schedule: 100%, 95%, 90%, 85%
→ Reasonable trigger probability
→ Standard institutional setting
```

### Aggressive (Harder to Trigger):
```
Start: 105%
Step: 3%
Schedule: 105%, 102%, 99%, 96%
→ Need stock to perform well
→ Higher coupon compensation
```

---

## 🎨 Visual Display Features

### In Tracker - Autocall Step-Down Card Shows:

**1. Schedule List:**
- All observations with dates
- Descending levels shown
- Visual "↓ -5%" indicators
- Checkmarks for passed observations
- Highlights for triggered ones

**2. Status Indicators:**
- ○ Circle = Future observation
- ✓ Green checkmark = Passed but didn't trigger
- ⚡ Purple badge = TRIGGERED
- Current level highlighted

**3. Color Coding:**
- **Purple** = Triggered observation
- **Green** = Would trigger (future)
- **Gray** = Passed, didn't trigger
- **White** = Upcoming

**4. Payout Calculation:**
- Shows if triggered
- Principal + coupons to that date
- Exact amount displayed

---

## 🎮 Interactive Features

### In Time Simulator:

**Works with Step-Down:**
- Drag slider to different dates
- See which autocall level applies
- Check if basket exceeds that level
- Maturity message shows if autocalled early

**Example:**
```
Day 180 (6 months):
  Autocall Level: 95%
  Current Basket: 96%
  Result: ⚡ WOULD AUTOCALL!
```

---

## 🔧 Technical Implementation

### Data Structure:

```typescript
// In ReverseConvertibleTerms:
autocallStepDown?: boolean;
autocallStepDownLevels?: number[]; // [1.00, 0.95, 0.90, 0.85]
```

### Generation Algorithm:

```typescript
function generateStepDownLevels(
  startLevel: number,    // 1.00 (100%)
  stepSize: number,      // 0.05 (5%)
  numObservations: number // 4
): number[] {
  const levels = [];
  for (let i = 0; i < numObservations; i++) {
    levels.push(startLevel - (i * stepSize));
  }
  return levels; // [1.00, 0.95, 0.90, 0.85]
}
```

### Trigger Check:

```typescript
function checkAutocall(
  basketLevel: number,      // 0.96 (96%)
  observationLevel: number  // 0.95 (95%)
): boolean {
  return basketLevel >= observationLevel; // true → TRIGGERS!
}
```

---

## 📋 Validation Rules

**Step-Down Levels Must:**
✅ Be in descending order  
✅ Start ≥ 50%  
✅ Have at least 1 observation  
✅ Match observation frequency  

**System Prevents:**
❌ Ascending levels  
❌ Levels below 50%  
❌ Empty arrays  
❌ Duplicate levels  

---

## 🚀 Testing

### Test 1: Create Step-Down Product

**Steps:**
1. RC product form
2. Enable Autocall ✓
3. Enable Step-Down ✓
4. Start: 100%
5. Step: 5%
6. Quarterly frequency
7. Generate

**Expected:**
- 4 observations created
- Levels: 100%, 95%, 90%, 85%
- Shows in tracker

### Test 2: See in Time Simulator

**Steps:**
1. Save product to tracker
2. Open Time Simulator
3. Select "Gain" scenario (+15%)
4. Slide to month 6

**Expected:**
- Level at 115%
- Second observation at 95%
- 115% ≥ 95% → Would trigger!
- Shows autocall message

### Test 3: Check Schedule Card

**Steps:**
1. Find "Autocall Step-Down Schedule" card
2. See all observations listed
3. Check current level
4. See which would trigger

**Expected:**
- 4 observations shown
- Descending levels visible
- Current level highlighted
- Trigger status indicated

---

## 🎊 Combined with Equally Weighted

### Ultimate Product:

```
Basket: Equally Weighted (AAPL, MSFT, GOOGL)
Autocall: Step-Down (100%, 95%, 90%, 85%)
Barrier: 70%
Coupon: 10% quarterly

Benefits:
✅ Diversified via equal weighting
✅ Early exit potential via step-down
✅ Balanced risk/reward
✅ Professional structure
```

---

## ✅ Complete Implementation

**Files Created/Updated:**
- ✅ `reverseConvertible/autocall.ts` - New autocall logic
- ✅ `reverseConvertible/terms.ts` - Added step-down fields
- ✅ `reverseConvertible/engine.ts` - Equally weighted support
- ✅ `reverseConvertible/breakEven.ts` - Updated descriptions
- ✅ `ProductInputForm.tsx` - UI for both features
- ✅ `AutocallStepDownCard.tsx` - Visual schedule display
- ✅ `PositionTrackerPage.tsx` - Integration

**All Features Working:**
✅ Equally weighted basket calculation  
✅ Step-down autocall generation  
✅ Schedule visualization  
✅ Trigger detection  
✅ Time simulation support  
✅ Breakeven updates  
✅ Beautiful UI  

---

**Status:** 🎉 PRODUCTION READY  
**Version:** 1.0  
**Date:** January 12, 2026

Both features are now live and fully integrated! 🚀

