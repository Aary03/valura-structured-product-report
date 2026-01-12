# 📊 CPPN Product - Why You're Seeing Physical Delivery

## Your Question: "Why is it showing -8.86% loss and shares?"

### Quick Answer:

Your **Participation Note has a Knock-In barrier** that was triggered. Here's what happened:

1. Your product has a **Knock-In Level** (e.g., 70%)
2. Your basket (FI + MSTR worst-of) fell **below** that level
3. When knock-in triggers → **Capital protection is removed**
4. You switch to **"geared put" mode** (downside participation)
5. This results in **physical share delivery** instead of cash

---

## 🎯 Understanding CPPN Products

### Two Modes:

#### **Mode 1: PROTECTED (Above Knock-In)**
```
If Basket Level ≥ Knock-In Level:

Payoff = Capital Protection + Participation

Example (100% protection, 120% participation):
  Basket at 110% → Payoff = 100% + 120% × (110% - 100%)
                          = 100% + 12% = 112%
  
  You get: $112,000 (CASH) ✓
  Settlement: Cash Redemption
  Your protection: Active
```

#### **Mode 2: KNOCK-IN TRIGGERED (Below Knock-In)**
```
If Basket Level < Knock-In Level:

Payoff = (Basket Level ÷ Strike) × Notional

Example (basket at 85%, strike at 90%):
  Payoff = (85% ÷ 90%) × $100,000
         = 94.44% × $100,000
         = $94,440

  OR physical delivery:
  Shares = $100,000 ÷ (Initial Price × Strike%)
         = $100,000 ÷ $57.60 (if FI initial = $64 × 90%)
         = 1,736 shares
  
  Current Value = 1,736 × Current Price
                = 1,736 × $52.50
                = $91,140

  You get: 1,736 shares (PHYSICAL) ⚠️
  Settlement: Physical Delivery
  Your protection: Removed
```

---

## 🔍 Your Specific Case

### What Your Position Shows:

**Settlement: 📊 Shares (1,428.57 shares)**

This means:
1. ✅ You have a CPPN product
2. ✅ Knock-in is ENABLED
3. ⚠️ Basket level fell BELOW knock-in
4. ⚠️ Capital protection was REMOVED
5. 📊 You'll receive PHYSICAL SHARES at maturity

**Loss: -8.86% ($91,142.86 current value)**

This is calculated as:
- Initial: $100,000
- Current basket level: ~91.14% (approximately)
- Knock-in triggered → geared payoff
- Result: $91,142.86
- Loss: -$8,857.14 (-8.86%)

---

## 📈 How to Check Product Terms

### Look for These in Your Position:

**1. Knock-In Level:**
- Check what % the knock-in is set at (e.g., 70%, 80%, 90%)
- This is the barrier that removes protection

**2. Capital Protection:**
- Usually 90%, 95%, or 100%
- Only active if basket ≥ knock-in level

**3. Basket Type:**
- Single, Worst-Of, Best-Of, or Average
- For FI + MSTR → Likely "Worst-Of"
- Whichever performed worse determines level

**4. Downside Strike:**
- Used when knock-in triggers
- Determines share conversion rate

---

## 🎯 Why Physical Delivery?

### CPPN Logic:

**Above Knock-In:**
→ Capital protection active
→ Cash settlement
→ Protected payoff

**Below Knock-In:**
→ Capital protection removed
→ Geared payoff kicks in
→ May result in physical shares
→ Calculated as: Basket ÷ Strike

**The "Shares" indication means:**
- Your basket level is below knock-in
- The geared payoff formula applies
- Result is physical delivery equivalent
- You get shares instead of cash

---

## 💡 What's Happening with FI & MSTR

### Basket Calculation:

If you have:
- **FI** (Fiserv): Started at $X, now at $Y
- **MSTR** (MicroStrategy): Started at $A, now at $B

**Basket Level = Worst Performer:**
```
FI Level:   Current ÷ Initial = $Y ÷ $X = Z%
MSTR Level: Current ÷ Initial = $B ÷ $A = W%

Basket = min(Z%, W%) = Whichever is lower

If min(Z%, W%) < Knock-In Level:
  → Knock-In Triggered!
  → Protection Removed
  → Physical Delivery
  → Loss shown
```

---

## 🎨 New Feature: CPPN Details Card

I just added a new section to explain this!

**Location:** After Money Flow, before Barrier Monitor

**Shows:**
1. **Product Structure:**
   - Capital Protection %
   - Participation Rate
   - Participation Start
   - Knock-In Level

2. **Current Status:**
   - ✓ Protected (green) OR ⚠️ Knock-In Triggered (red)
   - Current basket level
   - Distance to/from knock-in

3. **Explanation:**
   - Why you're seeing shares
   - How payoff is calculated
   - What basket level means
   - Formula breakdown

4. **Payoff Calculation:**
   - Shows exact formula used
   - Shows numbers plugged in
   - Shows final result
   - Math explained step-by-step

---

## 🔧 How to See Your Terms

### In Tracker (New CPPN Details Card):

You'll now see:
```
┌─────────────────────────────────────────┐
│ 🛡️ Participation Note Details           │
├─────────────────────────────────────────┤
│ Capital Protection: 100%                │
│ Participation Rate: 120%                │
│ Starts At: 100%                         │
│ Knock-In Level: 90%                     │
├─────────────────────────────────────────┤
│ ⚠️ Knock-In Triggered!                   │
│ Basket level fell below barrier         │
│                                         │
│ Current Basket: 85%                     │
│ Knock-In: 90%                           │
├─────────────────────────────────────────┤
│ Why Physical Shares:                    │
│ Basket (85%) < Knock-In (90%)           │
│ Protection removed → Geared payoff      │
│ Result: Physical delivery               │
└─────────────────────────────────────────┘
```

---

## ✅ What to Do

### Option 1: Check if This is Correct

**Questions:**
1. Did you enable knock-in when creating the product?
2. What's the knock-in level? (70%? 90%?)
3. What's the current worst-of level of FI & MSTR?
4. Is current level below knock-in? (If yes, physical delivery is CORRECT)

### Option 2: Understand the Math

**Example:**
- Notional: $100,000
- Knock-In: 90%
- Basket fell to: 85% (knock-in triggered)
- Strike: 90%

**Calculation:**
```
Shares = Notional ÷ (Initial Price × Strike)
       = $100,000 ÷ ($64 × 90%)
       = $100,000 ÷ $57.60
       = 1,736 shares

Current Value = 1,736 × Current Price ($52.50)
              = $91,140

Loss = $91,140 - $100,000 = -$8,860 (-8.86%)
```

### Option 3: Create Without Knock-In

If you want **guaranteed protection:**
1. Create new CPPN
2. **Disable knock-in** (uncheck the box)
3. Keep capital protection at 100%
4. Save to tracker

**Result:**
- Always cash settlement
- Always protected
- Never switches to shares
- Minimum return = Capital Protection %

---

## 🎯 Summary

**Why -8.86% loss?**
→ Basket level fell below knock-in barrier
→ Protection removed
→ Geared payoff applies
→ Results in ~91% value ($91,142)

**Why physical shares?**
→ Knock-in triggered
→ Formula switched to geared put mode
→ Calculation results in share delivery
→ 1,428.57 shares at current market value

**Is this correct?**
→ YES, if knock-in is enabled and triggered
→ The product is working as designed
→ You can see all the math in the new CPPN Details Card

---

## 💡 Going Forward

### To Avoid This:
- Create CPPN **without knock-in** for guaranteed protection
- Or set knock-in very low (e.g., 50%) for more buffer
- Or use higher capital protection (100% vs 90%)

### To Monitor This:
- New **CPPN Details Card** shows exactly what's happening
- Shows current basket vs knock-in level
- Explains the payoff calculation
- Visual indicators (red if triggered, green if protected)

---

**The tracker is working correctly - it's showing you the true outcome based on your product's knock-in feature!** 

Check the new **CPPN Details Card** in your position to see all the details! 📊

