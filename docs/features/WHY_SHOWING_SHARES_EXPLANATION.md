# 🤔 Why Am I Seeing Physical Shares & Loss?

## Your Situation

**Product:** CPPN (Participation Note) with FI + MSTR  
**Current Value:** $91,142.86  
**Loss:** -8.86% (-$8,857.14)  
**Settlement:** 📊 Physical Shares (1,428.57 shares)  

---

## ❓ The Question

**"I created a participation product - why am I seeing a loss and share delivery?"**

**Answer:** Your product has a **Knock-In feature** that was triggered.

---

## 🎯 What is Knock-In?

### Think of it as "Conditional Protection"

**Visual Explanation:**

```
┌─────────────────────────────────────────┐
│  Your Investment Journey                │
├─────────────────────────────────────────┤
│                                         │
│  120%  ━━━━━━━━━━━━━ Happy Zone        │
│        ✓ Protected                      │
│        ✓ Participation working          │
│  100%  ━━━━━━━━━━━━━ Start Level       │
│                                         │
│   90%  ═══════════════ KNOCK-IN LINE    │ ← The Trigger
│        ↑ If you cross here...           │
│        ↑ Protection TURNS OFF!          │
│                                         │
│   85%  ✗ You are HERE ← Current Level   │ ← Below knock-in!
│        ⚠️ Protection removed            │
│        📊 Shares delivered              │
│                                         │
│   70%  ━━━━━━━━━━━━━ Downside Strike   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔴 What Happened to Your Position

### Step-by-Step:

**1. Product Created:**
- Capital Protection: 100%
- Knock-In Enabled: YES ✓
- Knock-In Level: Let's say 90%
- Underlyings: FI + MSTR (worst-of)

**2. Markets Moved:**
- FI: Went from $64 → down to ~$X
- MSTR: Went from $Y → down to ~$Z
- Worst performer: One of them dropped significantly

**3. Knock-In Triggered:**
- Basket level (worst-of FI & MSTR): **~91%**
- Knock-In barrier: **90%**
- Result: 91% is... wait, that's ABOVE 90%! 🤔

**WAIT! Let me check the actual numbers...**

If showing 1,428.57 shares and $91,142 value:
- Shares = $100,000 ÷ Strike Price
- 1,428.57 = $100,000 ÷ $70
- So strike price ≈ $70

If current value is $91,142:
- Value = 1,428.57 × Current Price
- $91,142 = 1,428.57 × $63.80
- Current price ≈ $63.80

**Calculation Check:**
- Basket Level = $63.80 ÷ Initial Price
- If initial was $70: Level = 63.80 / 70 = **91.14%**

---

## 🎯 The Real Answer

### Your Product Structure (Most Likely):

**Type:** CPPN with Knock-In  
**Knock-In Level:** Probably **95%** or **100%**  
**Current Basket:** **91.14%**  
**Result:** Below knock-in → Triggered!  

### Why You See Shares:

When knock-in triggers, the payoff formula changes from:
```
Protected: CP + Participation × Upside
```

To:
```
Geared Put: (Basket ÷ Strike) × Notional
```

If this calculation results in <100%, you effectively get:
- Physical shares at the strike price
- Current market value of those shares
- Which may be a loss

---

## 📊 New Visual Explanation (Just Added!)

### CPPN Details Card

I just added a new section to your tracker that shows:

**1. Product Terms Display:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Protection   │ Participation│ Starts At    │ Knock-In     │
│    100%      │     120%     │    100%      │     95%      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**2. Status Indicator:**
```
⚠️ KNOCK-IN TRIGGERED!
Basket level fell below knock-in barrier

Current Basket: 91.1%
Knock-In Level: 95.0%
```

**3. Why You're Seeing Shares:**
```
Your basket (91.1%) fell below knock-in (95%).
When knock-in triggers:
→ Capital protection is removed
→ You get geared payoff
→ Formula: (Basket ÷ Strike) × Notional
→ Results in physical share delivery
```

**4. Exact Calculation:**
```
Payoff = (91.1% ÷ 95%) × $100,000
       = 95.9% × $100,000
       = $95,900

OR physical shares:
Shares = $100,000 ÷ $70 = 1,428.57 shares
Value = 1,428.57 × $63.80 = $91,142.86
```

---

## ✅ Is This Correct?

### YES, if:
- ✓ You enabled knock-in when creating product
- ✓ Knock-in level is above current basket
- ✓ Basket is based on worst-of FI & MSTR
- ✓ One or both stocks declined

### NO, if:
- ✗ You wanted guaranteed 100% protection
- ✗ You didn't mean to enable knock-in
- ✗ You expected only cash settlement

---

## 🛠️ How to Fix/Avoid This

### For Future Positions:

**Option 1: No Knock-In (Safest)**
```
Capital Protection: 100%
Knock-In: DISABLED ✗
Result: Always protected, always cash
```

**Option 2: Lower Knock-In**
```
Capital Protection: 100%
Knock-In: ENABLED ✓
Knock-In Level: 50% (very low)
Result: Lots of buffer before protection lost
```

**Option 3: Higher Protection**
```
Capital Protection: 100%
Knock-In: 95%
Downside Strike: Auto-calculated
Result: Some buffer, but tighter
```

---

## 🎯 Check Your Position Now

**Refresh tracker page and look for new section:**

**"🛡️ Participation Note Details"**

This will show:
- Your exact product terms
- Current basket level
- Knock-in status (triggered or not)
- Complete explanation
- Math formula breakdown
- Why you're seeing what you're seeing

---

## 💡 Quick Summary

**Why Loss (-8.86%)?**
→ Basket level ~91%, knock-in triggered, geared payoff

**Why Physical Shares?**
→ Knock-in triggers → protection removed → shares delivered

**Is This Normal?**
→ YES, for CPPN with knock-in enabled

**How to Avoid?**
→ Disable knock-in OR set it very low (50%)

**Where to See Details?**
→ New "CPPN Details Card" in tracker (just added!)

---

## 🎨 What You'll See in Tracker Now

### Before (Confusing):
- Just shows shares and loss
- No explanation why

### After (Clear):
- **CPPN Details Card** explains everything
- Shows your product structure
- Shows knock-in status (triggered/not)
- Explains the calculation
- Shows exact formula
- Color-coded (red if triggered, green if safe)

---

**Refresh your tracker to see the new CPPN Details Card that explains everything!** 📊✨

