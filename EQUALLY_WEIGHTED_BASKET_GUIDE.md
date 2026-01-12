# 📊 Equally Weighted Basket - New Feature

## Overview

**Equally Weighted Basket** allows you to create Reverse Convertibles where the payoff is based on the **average performance** of multiple stocks, not just the worst performer.

---

## 🎯 What's the Difference?

### Basket Types Now Available:

**1. Single Underlying** (Existing)
- Uses 1 stock
- Payoff based on that stock's performance

**2. Worst-Of Basket** (Existing)
- Uses 2-3 stocks
- Payoff based on **WORST performer**
- Most conservative

**3. Equally Weighted** ⭐ NEW!
- Uses 2-3 stocks
- Payoff based on **AVERAGE performance**
- More balanced approach

---

## 📈 How It Works

### Example: 3-Stock Basket

**Underlyings:**
- Stock A: $100 → $120 (+20%)
- Stock B: $100 → $90 (-10%)
- Stock C: $100 → $110 (+10%)

**Worst-Of Calculation:**
```
Level = min(120%, 90%, 110%)
      = 90% (Stock B is worst)
Barrier: 70%
Result: 90% > 70% → Cash Redemption ✓
```

**Equally Weighted Calculation:**
```
Level = average(120%, 90%, 110%)
      = (120% + 90% + 110%) / 3
      = 320% / 3
      = 106.67%
Barrier: 70%
Result: 106.67% > 70% → Cash Redemption ✓
```

**Key Difference:**
- Worst-Of: Uses 90% (worst performer)
- Equally Weighted: Uses 106.67% (average)
- **Equally weighted is more favorable!**

---

## 💰 Impact on Returns

### Scenario: One stock crashes, others rally

**Setup:**
- 3 stocks in basket
- Stock A: +30%
- Stock B: -40% (crashes!)
- Stock C: +10%
- Barrier: 70%

**Worst-Of:**
```
Level = 60% (Stock B crashed)
Barrier = 70%
Result: BREACHED! Physical delivery
Loss: Significant
```

**Equally Weighted:**
```
Level = (130% + 60% + 110%) / 3 = 100%
Barrier = 70%
Result: SAFE! Cash redemption
Return: Coupons received (positive)
```

**Winner:** Equally Weighted! Despite one stock crashing, the average stays above barrier.

---

## 🎯 When to Use Each

### Use **Worst-Of** When:
✅ Want higher coupon (paid for taking more risk)  
✅ Very confident ALL stocks will perform  
✅ Stocks are highly correlated  
✅ Want maximum premium  

### Use **Equally Weighted** When:
✅ Want diversification benefit  
✅ One stock might underperform  
✅ Stocks are uncorrelated  
✅ More balanced risk/reward  
✅ Smoother outcomes  

### Use **Single** When:
✅ High conviction on one stock  
✅ Want simplicity  
✅ Focused bet  

---

## 🔧 How to Create

### In Product Input Form:

1. **Product Type:** Reverse Convertible
2. **Underlying Selection:** Choose "**Equally Weighted (2-3)**"
3. Add 2 or 3 stocks
4. Set barrier, coupons, etc.
5. Generate report

**The system automatically:**
- Calculates average of all stocks
- Uses average for barrier checking
- Adjusts breakeven calculation
- Updates all payoff logic

---

## 📊 Breakeven Impact

### Breakeven Calculation:

**Formula remains:** L_BE = K × (1 - c)

**But interpretation changes:**

**Worst-Of:**
- "Worst performer must be at 90% or above"
- Stricter requirement

**Equally Weighted:**
- "Average of all stocks must be at 90% or above"
- More lenient (one bad stock can be offset)

---

## 🎨 Visual Indicators

### In Tracker:

**Basket Type Badge:**
```
Single:           [1 Stock]
Worst-Of:         [2-3 Stocks | Worst]
Equally Weighted: [2-3 Stocks | Average] ⭐
```

**Performance Display:**
```
Equally Weighted Basket:
AAPL: $150 → $165 (+10%)
MSFT: $300 → $270 (-10%)
GOOGL: $140 → $154 (+10%)
────────────────────────────
Average Level: 103.3% ✓
Barrier: 70% (Safe)
```

---

## 💡 Example Use Cases

### Case 1: Tech Basket
```
Stocks: AAPL, MSFT, GOOGL
Barrier: 70%
Coupon: 10% quarterly

Best Case: All rally → Average 120% → Cash + coupons
Balanced: Mixed performance → Average 105% → Cash + coupons
Worst Case: One crashes to 50%, others flat
  Worst-Of: 50% → BREACHED
  Equally Weighted: (100% + 100% + 50%) / 3 = 83.3% → SAFE ✓
```

### Case 2: Diversified Portfolio
```
Stocks: Tech + Finance + Energy
Less correlation = smoother average
Equally weighted reduces single-stock risk
Better suited for volatile markets
```

---

## 🔧 Implementation Details

### Backend Logic Updated:
✅ `reverseConvertible/terms.ts` - Added 'equally_weighted' basket type  
✅ `reverseConvertible/engine.ts` - Uses averageOf() for payoff  
✅ `reverseConvertible/breakEven.ts` - Updated descriptions  
✅ `common/basket.ts` - Already had averageOf() function  

### UI Updated:
✅ `ProductInputForm.tsx` - New radio button option  
✅ Validation updated for 2-3 stocks  
✅ All cards show basket type  

### Tracker Updated:
✅ Calculates equally weighted level  
✅ Shows all stock performances  
✅ Highlights average vs worst  
✅ Correct breakeven displayed  

---

## ✅ Testing

### How to Test:

1. **Create Product:**
   - Select "Equally Weighted (2-3)"
   - Add AAPL, MSFT, GOOGL
   - Set 70% barrier
   - Generate report

2. **Save to Tracker:**
   - Click "Save to Tracker"
   - Go to tracker page

3. **Test Scenarios:**
   - In Time Simulator, try "Deep Loss" (-50%)
   - See how average is calculated
   - Compare to worst-of mentally
   - See if barrier breaches

4. **Verify Calculation:**
   - Check "Underlying Performance" section
   - See all 3 stocks listed
   - Average should be shown
   - Basket level = average of the 3

---

## 🎊 Benefits

**Pros:**
✅ Diversification benefit  
✅ One bad stock won't ruin everything  
✅ Smoother outcomes  
✅ More forgiving than worst-of  
✅ Still get multi-stock exposure  

**Cons:**
❌ Slightly lower coupon than worst-of  
❌ All stocks must be tracked  
❌ More complex than single  

---

**Status:** ✅ IMPLEMENTED & READY  
**Version:** 1.0  
**Date:** January 12, 2026

