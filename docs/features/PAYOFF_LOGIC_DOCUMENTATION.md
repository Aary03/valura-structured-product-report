# Structured Products Payoff Logic - Complete Documentation

**Version:** 1.0  
**Last Updated:** December 28, 2025  
**Purpose:** Comprehensive reference for all payoff calculations in the Valura Structured Products platform

---

## Table of Contents

1. [Overview](#overview)
2. [Mathematical Notation](#mathematical-notation)
3. [Common Concepts](#common-concepts)
4. [Reverse Convertible (RC)](#reverse-convertible-rc)
   - [4.1 Standard Barrier RC](#41-standard-barrier-rc)
   - [4.2 Low Strike / Geared Put RC](#42-low-strike--geared-put-rc)
5. [Capital Protected Participation Note (CPPN)](#capital-protected-participation-note-cppn)
   - [5.1 Standard CPPN](#51-standard-cppn)
   - [5.2 CPPN with Knock-In](#52-cppn-with-knock-in)
   - [5.3 CPPN with Cap](#53-cppn-with-cap)
   - [5.4 Bonus Certificate](#54-bonus-certificate)
6. [Basket Mechanics](#basket-mechanics)
7. [Continuity and Discontinuities](#continuity-and-discontinuities)
8. [Test Cases](#test-cases)
9. [Implementation Notes](#implementation-notes)

---

## 1. Overview

This document provides **exhaustive mathematical definitions and computational logic** for all structured product payoffs supported by the Valura platform. Each product type is defined with:

- **Parameter definitions** (all symbols and their meanings)
- **Payoff formulas** (exact mathematical expressions)
- **Step-by-step calculation logic** (implementation algorithm)
- **Edge cases** (boundary conditions, discontinuities, special cases)
- **Test cases** (validation scenarios with expected outputs)

---

## 2. Mathematical Notation

### 2.1 Core Symbols

| Symbol | Description | Example |
|--------|-------------|---------|
| **N** | Notional amount (principal invested) | $100,000 |
| **S₀** | Initial fixing (strike price) for underlying | $100.00 |
| **Sₜ** | Spot price at time t | $95.00 |
| **Sₜ** | Final price at maturity T | $110.00 |
| **R** | Performance ratio = Sₜ / S₀ | 1.10 (=+10%) |
| **X** | Basket level in % = R × 100 | 110% |
| **RED** | Redemption amount in % of notional | 112% |
| **T** | Tenor (maturity) in months | 12 months |

### 2.2 Product Parameters

| Parameter | Description | Typical Range |
|-----------|-------------|---------------|
| **CP** | Capital Protection floor (%) | 0-100% |
| **K** or **PS** | Participation start / Strike (%) | 80-120% |
| **α** or **PR** | Participation rate (%) | 50-200% |
| **B** | Barrier level (%) | 50-90% |
| **KI** | Knock-In level (%) | 50-90% |
| **C** or **CAP** | Cap level (%) | 110-150% |
| **BL** | Bonus level (%) | 105-120% |
| **BB** | Bonus barrier (%) | 50-80% |
| **CR** | Conversion ratio | 0.5-1.5 |
| **CPN** | Coupon rate per annum (%) | 5-20% |

### 2.3 Conventions

- **All percentages** are expressed relative to initial fixing (100% = par)
- **Performance**: R = 1.00 means flat, R = 1.10 means +10%, R = 0.75 means -25%
- **Basket level X**: Always in % (e.g., 110% or 75%)
- **Redemption RED**: Always in % of notional (e.g., 112% means investor receives $112,000 on $100,000 notional)
- **Never negative**: All redemption values are floored at 0 (limited liability)

---

## 3. Common Concepts

### 3.1 Basket Types

Structured products can reference one or multiple underlyings. The **basket mechanism** determines how multiple underlyings are aggregated:

| Basket Type | Description | Formula |
|-------------|-------------|---------|
| **Single** | Single underlying | R = S₁ᵀ / S₁⁰ |
| **Worst-Of** | Worst performer of N underlyings | R = min(S₁ᵀ/S₁⁰, S₂ᵀ/S₂⁰, ..., Sₙᵀ/Sₙ⁰) |
| **Best-Of** | Best performer | R = max(...) |
| **Average** | Average of all performers | R = mean(...) |

### 3.2 Observation Methods

| Method | Description | When Used |
|--------|-------------|-----------|
| **European** | Observed only at maturity | Knock-in, barriers, final settlement |
| **American** | Continuous observation | Not yet implemented |
| **Discrete** | Observed at specific dates | Autocall, conditional coupons |

### 3.3 Coupon Structures

| Type | Condition | Payment |
|------|-----------|---------|
| **Unconditional** | Always paid | CPN × N × (periods) |
| **Conditional** | Paid if barrier not breached | 0 or CPN × N |
| **Memory** | Accumulated unpaid coupons | ∑ unpaid + current |

---

## 4. Reverse Convertible (RC)

### Product Overview

A **Reverse Convertible** pays a high fixed coupon but converts to shares if the underlying breaches a barrier. Investor takes downside risk in exchange for yield.

**Key Features:**
- High unconditional coupon
- Binary payoff at maturity: cash or shares
- Downside risk if barrier breached

---

### 4.1 Standard Barrier RC

#### Parameters

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| **N** | Notional | Principal amount | $100,000 |
| **B** | Barrier | Threshold for share conversion (%) | 70% |
| **CPN** | Coupon Rate | Annual coupon rate | 10% |
| **F** | Frequency | Coupons per year | 4 (quarterly) |
| **T** | Tenor | Maturity in months | 12 |
| **CR** | Conversion Ratio | Share conversion multiplier | 1.0 |
| **S₀** | Initial Fixing | Strike price of underlying | $100 |
| **Sᵀ** | Final Price | Price at maturity | $65 |

#### Payoff Formula

```
Total Payoff = Coupon Payment + Redemption

Coupon Payment = N × (CPN / F) × nCoupons
  where nCoupons = T / (12 / F)

Redemption:
  if X ≥ B:
    RED = N (cash redemption at 100%)
  else:
    RED = (N / (S₀ × CR)) × Sᵀ (physical delivery of shares)
```

#### Step-by-Step Calculation

**Step 1: Calculate basket level**
```
R = Sᵀ / S₀
X = R × 100
```

**Step 2: Calculate coupon payments**
```
Coupon per period = N × (CPN / F)
Number of coupons = T / (12 / F)
Total coupons = Coupon per period × Number of coupons
```

**Step 3: Check barrier**
```
if X ≥ B:
  Redemption = N × 1.00  // Cash redemption
  Shares = 0
else:
  Shares = N / (S₀ × CR)
  Redemption = Shares × Sᵀ
```

**Step 4: Total return**
```
Total cash = Redemption + Total coupons
Total % = Total cash / N
```

#### Example Calculation

**Given:**
- N = $100,000
- B = 70%
- CPN = 10% p.a.
- F = 4 (quarterly)
- T = 12 months
- CR = 1.0
- S₀ = $100
- Sᵀ = $65

**Calculation:**

1. **Basket level**: X = 65/100 × 100 = 65%
2. **Coupons**: 
   - Per period = $100,000 × (0.10 / 4) = $2,500
   - Number = 12 / (12/4) = 4
   - Total = $2,500 × 4 = $10,000 (10%)
3. **Barrier check**: 65% < 70% → **Barrier breached**
4. **Redemption**:
   - Shares = $100,000 / ($100 × 1.0) = 1,000 shares
   - Value = 1,000 × $65 = $65,000 (65%)
5. **Total**: $65,000 + $10,000 = $75,000 (**75%**)

#### Edge Cases

| Scenario | X | Redemption | Total | Notes |
|----------|---|------------|-------|-------|
| Barrier exactly touched | 70% | 100% | 110% | Cash redemption (≥ B) |
| Slight miss | 69.99% | ~69.99% | ~79.99% | Share conversion |
| Deep miss | 50% | 50% | 60% | Share conversion |
| Upside | 120% | 100% | 110% | No upside participation |

---

### 4.2 Low Strike / Geared Put RC

#### Parameters

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| **N** | Notional | Principal amount | $100,000 |
| **K** | Strike | Conversion strike (%) | 55% |
| **KI** | Knock-In | Barrier for geared put (%) | 55% (default = K) |
| **CPN** | Coupon Rate | Annual coupon rate | 15% |
| **F** | Frequency | Coupons per year | 4 |
| **T** | Tenor | Maturity in months | 12 |
| **CR** | Conversion Ratio | Share conversion multiplier | 1.0 |
| **G** | Gearing | Leverage = 1 / K | 1.82 |

#### Payoff Formula

```
Gearing (G) = 1 / K

Redemption:
  if X ≥ KI:
    RED = N × 1.00 (cash redemption)
  else:
    RED = N × (X / K) (geared put payoff)
    Shares = N / (S₀ × K × CR) (physical at strike)
```

#### Step-by-Step Calculation

**Step 1: Calculate basket level**
```
R = Sᵀ / S₀
X = R × 100
```

**Step 2: Calculate gearing**
```
G = 1 / K
  (if K = 55%, then G = 1.82x leverage)
```

**Step 3: Check knock-in**
```
if X ≥ KI:
  RED_pct = 100%  // Cash redemption
else:
  RED_pct = (X / K) × 100%  // Geared payoff
  Shares = N / (S₀ × K × CR)
```

**Step 4: Add coupons**
```
Total = RED_pct + Coupon_pct
```

#### Example Calculation

**Given:**
- K = 55%
- KI = 55%
- X = 45%

**Calculation:**
```
45% < 55% → Knock-in triggered
RED_pct = 45 / 55 = 0.8182 = 81.82%
```

**Comparison to standard barrier:**
- Standard barrier (B=70%): Would pay 45% (1:1 participation)
- Geared put (K=55%): Pays 81.82% (1.82x gearing)

#### Gearing Effect Table

| Final Level X | Standard (B=70%) | Geared (K=55%) | Gearing Benefit |
|---------------|------------------|----------------|-----------------|
| 70% | 100% | 127.3% | +27.3% |
| 60% | 60% | 109.1% | +49.1% |
| 55% | 55% | 100.0% | +45.0% |
| 50% | 50% | 90.9% | +40.9% |
| 45% | 45% | 81.8% | +36.8% |
| 40% | 40% | 72.7% | +32.7% |

---

## 5. Capital Protected Participation Note (CPPN)

### Product Overview

A **Capital Protected Participation Note (CPPN)** provides downside protection (floor) with leveraged upside participation. Investors are protected from losses below a floor but participate in gains above a strike.

**Key Features:**
- Capital protection floor (typically 100%)
- Leveraged upside participation (e.g., 120%)
- Optional cap on maximum return
- Optional knock-in for conditional protection
- Optional bonus certificate variant

---

### 5.1 Standard CPPN

#### Parameters

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| **CP** | Capital Protection | Floor redemption (%) | 100% |
| **PS** or **K** | Participation Start | Strike level for participation (%) | 100% |
| **PR** or **α** | Participation Rate | Upside leverage (%) | 120% |
| **Direction** | Participation Direction | `up` or `down` | `up` |

#### Payoff Formula

```
Upside Participation:
  if direction = 'up':
    UP = PR × max(R - (PS/100), 0)
  else if direction = 'down':
    UP = PR × max((PS/100) - R, 0)

Redemption (% of notional):
  RED = CP + (UP × 100)

Never negative:
  RED = max(0, RED)
```

#### Step-by-Step Calculation

**Step 1: Calculate performance**
```
R = Sᵀ / S₀
X = R × 100
```

**Step 2: Calculate upside participation**
```
start_ratio = PS / 100
part_rate = PR / 100

if direction = 'up':
  UP = part_rate × max(R - start_ratio, 0)
else:
  UP = part_rate × max(start_ratio - R, 0)
```

**Step 3: Apply floor**
```
RED_pct = CP + (UP × 100)
```

**Step 4: Floor at zero**
```
RED_pct = max(0, RED_pct)
```

#### Example Calculations

**Example 1: Upside Scenario**

Given:
- CP = 100%
- PS = 100%
- PR = 120%
- Direction = `up`
- X = 110% (R = 1.10)

Calculation:
```
UP = 1.20 × max(1.10 - 1.00, 0)
   = 1.20 × 0.10
   = 0.12

RED_pct = 100 + (0.12 × 100)
        = 100 + 12
        = 112%
```

**Result: 112% redemption (+12% return)**

**Example 2: Downside Scenario**

Given:
- CP = 100%
- X = 75% (R = 0.75)

Calculation:
```
UP = 1.20 × max(0.75 - 1.00, 0)
   = 1.20 × 0
   = 0

RED_pct = 100 + 0 = 100%
```

**Result: 100% redemption (capital protected)**

#### Test Cases

| X | R | UP | RED | Description |
|---|---|----|----|-------------|
| 60% | 0.60 | 0 | 100% | Deep downside → floor |
| 90% | 0.90 | 0 | 100% | Moderate downside → floor |
| 100% | 1.00 | 0 | 100% | At-the-money → par |
| 110% | 1.10 | 12% | 112% | +10% → +12% (1.2x) |
| 130% | 1.30 | 36% | 136% | +30% → +36% (1.2x) |

---

### 5.2 CPPN with Knock-In

#### Overview

A **Knock-In** makes capital protection **conditional**. If the underlying breaches the knock-in level, protection is removed and the investor participates 1:1 in the downside (geared put).

#### Additional Parameters

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| **KI** | Knock-In Level | Threshold for removing protection (%) | 70% |
| **S** | Downside Strike | Strike for geared put calculation (%) | 70% |
| **Mode** | Observation | `EUROPEAN` (at maturity only) | EUROPEAN |

#### Payoff Formula

```
if X < KI:
  // Knock-in triggered → Remove protection
  RED = 100 × (X / S)
  knockInTriggered = true
else:
  // No knock-in → Standard CPPN logic
  RED = CP + UP
  knockInTriggered = false

RED = max(0, RED)
```

#### Step-by-Step Calculation

**Step 1: Check knock-in**
```
if X < KI:
  knockInTriggered = true
  goto Step 2a
else:
  knockInTriggered = false
  goto Step 2b
```

**Step 2a: Knock-in triggered (geared put)**
```
S_strike = S (if provided) else KI
RED_pct = 100 × (X / S_strike)
```

**Step 2b: No knock-in (standard CPPN)**
```
UP = PR × max(R - (PS/100), 0)
RED_pct = CP + (UP × 100)
```

**Step 3: Floor at zero**
```
RED_pct = max(0, RED_pct)
```

#### Example Calculations

**Example 1: Knock-in NOT triggered**

Given:
- CP = 100%, PS = 100%, PR = 120%
- KI = 70%
- X = 90%

Calculation:
```
90% > 70% → No knock-in
UP = 1.20 × max(0.90 - 1.00, 0) = 0
RED = 100 + 0 = 100%
```

**Result: 100% (protected)**

**Example 2: Knock-in triggered**

Given:
- KI = 70%, S = 70%
- X = 65%

Calculation:
```
65% < 70% → Knock-in triggered
RED = 100 × (65 / 70) = 92.86%
```

**Result: 92.86% (geared downside)**

#### Continuity Requirements

To avoid arbitrage, the payoff must be **continuous at KI**. This requires:

```
S_min = (100 × KI) / P(KI)

where P(KI) = redemption % from protected regime at X = KI
```

**Example:**
- CP = 90%, PS = 100%, PR = 120%, KI = 70%
- P(70%) = 90% (floor)
- S_min = (100 × 70) / 90 = 77.78%

If S < 77.78%, payoff jumps up at KI (arbitrage).

---

### 5.3 CPPN with Cap

#### Overview

A **cap** limits the maximum redemption. Applied **after** participation calculation, **before** applying floors.

#### Additional Parameters

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| **C** or **CAP** | Cap Level | Maximum redemption (%) | 125% |

#### Payoff Formula

```
RED_raw = CP + UP

if capEnabled and RED_raw > CAP:
  RED = CAP
else:
  RED = RED_raw

RED = max(0, RED)
```

#### Example Calculations

**Example: Cap limiting upside**

Given:
- CP = 100%, PS = 100%, PR = 120%
- CAP = 125%
- X = 130%

Calculation:
```
UP = 1.20 × (1.30 - 1.00) = 0.36
RED_raw = 100 + 36 = 136%

136% > 125% → Apply cap
RED = 125%
```

**Result: 125% (capped at max)**

#### Test Cases with Cap

| X | UP | RED_raw | CAP | RED | Notes |
|---|----|----|-----|-----|-------|
| 110% | 12% | 112% | 125% | 112% | Below cap |
| 120% | 24% | 124% | 125% | 124% | Just under cap |
| 125% | 30% | 130% | 125% | 125% | Capped |
| 130% | 36% | 136% | 125% | 125% | Capped |
| 150% | 60% | 160% | 125% | 125% | Capped |

---

### 5.4 Bonus Certificate

#### Overview

A **Bonus Certificate** is a special CPPN variant available **only when capital protection is OFF (CP = 0%)**. It provides a **bonus return** if a barrier is never breached. If breached, the investor participates 1:1 in the downside.

**Key Features:**
- No capital protection (CP = 0%)
- Bonus level (BL) paid if barrier never touched
- Participation starts at strike (PS)
- If barrier breached: 1:1 downside (like a tracker)

#### Parameters

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| **BL** | Bonus Level | Guaranteed return if barrier not breached (%) | 108% |
| **BB** or **B** | Bonus Barrier | Threshold that shouldn't be touched (%) | 60% |
| **PS** or **K** | Strike | Participation start level (%) | 100% |
| **PR** | Participation Rate | Upside leverage (%) | 100% |
| **CAP** | Cap | Optional maximum return (%) | 125% |

#### Payoff Formula

```
if X < BB (barrier breached):
  // Downside: 1:1 with underlying
  RED = 100 × R

else (barrier NOT breached):
  // Bonus regime
  if X < PS:
    // Flat at bonus level until participation starts
    RED = BL
  else:
    // Participation from strike
    P = 100 + PR × (R - (PS/100)) × 100
    
    // Apply cap
    if capEnabled:
      P = min(P, CAP)
    
    // Apply bonus floor
    RED = max(BL, P)

RED = max(0, RED)
```

#### Step-by-Step Calculation

**Step 1: Check barrier breach**
```
if X < BB:
  barrierBreached = true
  goto Step 2a
else:
  barrierBreached = false
  goto Step 2b
```

**Step 2a: Barrier breached (downside tracker)**
```
RED_pct = 100 × R
```

**Step 2b: Barrier NOT breached (bonus)**
```
if X < PS:
  // Below participation start: flat at bonus
  RED_pct = BL
else:
  // Participation regime
  start_ratio = PS / 100
  part_rate = PR / 100
  
  P = 100 + (100 × part_rate × (R - start_ratio))
  
  // Apply cap
  if capEnabled and P > CAP:
    P = CAP
  
  // Apply bonus floor
  RED_pct = max(BL, P)
```

**Step 3: Floor at zero**
```
RED_pct = max(0, RED_pct)
```

#### Example Calculations

**Example 1: Barrier not breached, below strike**

Given:
- BL = 108%, BB = 60%, PS = 100%
- X = 90%

Calculation:
```
90% > 60% → Barrier NOT breached
90% < 100% → Below participation start
RED = BL = 108%
```

**Result: 108% (flat bonus)**

**Example 2: Barrier not breached, participation**

Given:
- BL = 108%, BB = 60%, PS = 100%, PR = 100%
- X = 120%

Calculation:
```
120% > 60% → Barrier NOT breached
120% > 100% → Participation starts

P = 100 + (1.00 × (1.20 - 1.00) × 100)
  = 100 + 20
  = 120%

RED = max(108%, 120%) = 120%
```

**Result: 120% (participation exceeds bonus)**

**Example 3: Barrier breached**

Given:
- BB = 60%
- X = 55%

Calculation:
```
55% < 60% → Barrier breached
RED = 100 × 0.55 = 55%
```

**Result: 55% (1:1 downside)**

#### Bonus Certificate Payoff Graph

The payoff curve has three distinct regions:

```
Redemption %
    │
130%│           ╱
    │          ╱  (participation)
120%│         ╱
    │        ╱
110%│       ╱
108%├──────┘  (bonus floor)
100%├─────┐
    │      ╲
 80%│       ╲  (1:1 downside)
    │        ╲ if barrier breached
 60%├────────●──────────────
    │        BB
    └────────┼─────────────► Final Level
            100%    PS
```

**Key Points:**
- **Flat at bonus** from 0% to PS (if barrier not breached)
- **Participation starts at PS** (green dot)
- **1:1 downside** if barrier breached (regardless of final level)

#### Test Cases

| X | Barrier Breached? | Calculation | RED | Notes |
|---|-------------------|-------------|-----|-------|
| 55% | Yes (< 60%) | 100 × 0.55 | 55% | 1:1 downside |
| 68% | Yes (< 60%) | 100 × 0.68 | 68% | 1:1 downside |
| 72% | No | BL | 108% | Bonus (below PS) |
| 90% | No | BL | 108% | Bonus (below PS) |
| 100% | No | max(108, 100) | 108% | Bonus floor |
| 105% | No | max(108, 105) | 108% | Bonus floor |
| 110% | No | max(108, 110) | 110% | Participation |
| 120% | No | max(108, 120) | 120% | Participation |
| 150% | No | max(108, 150) | 150% | Participation |

With CAP = 125%:
| X | RED_raw | CAP applied | RED | Notes |
|---|---------|-------------|-----|-------|
| 130% | 130% | 125% | 125% | Capped |
| 150% | 150% | 125% | 125% | Capped |

---

## 6. Basket Mechanics

### 6.1 Single Underlying

```
R = S₁ᵀ / S₁⁰
X = R × 100
```

### 6.2 Worst-Of Basket

```
R_i = Sᵢᵀ / Sᵢ⁰ for i = 1 to N
R = min(R₁, R₂, ..., Rₙ)
X = R × 100
```

**Example:**
- Stock A: 100 → 120 (R = 1.20)
- Stock B: 100 → 90 (R = 0.90)
- Stock C: 100 → 110 (R = 1.10)

Worst-of: R = 0.90 (Stock B), X = 90%

### 6.3 Best-Of Basket

```
R = max(R₁, R₂, ..., Rₙ)
X = R × 100
```

### 6.4 Average Basket

```
R = (R₁ + R₂ + ... + Rₙ) / N
X = R × 100
```

---

## 7. Continuity and Discontinuities

### 7.1 Knock-In Discontinuity Problem

When a CPPN has CP < 100% and a knock-in, the payoff can be discontinuous at KI if not carefully designed.

**Problem:**
```
Above KI (protected):  RED = CP = 90%
Below KI (geared put): RED = 100 × (X / S)

If S = KI = 70%:
  At X = 70.01%: RED = 90% (protected)
  At X = 69.99%: RED = 100 × (69.99 / 70) = 99.99%
  
JUMP: 90% → 99.99% (discontinuity!)
```

**Solution: Enforce S ≥ S_min**

```
S_min = (100 × KI) / P(KI)

where P(KI) = protected payoff at X = KI
```

**Example:**
- CP = 90%, KI = 70%
- P(70%) = 90%
- S_min = (100 × 70) / 90 = 77.78%

Setting S = 77.78% ensures continuity:
```
At X = 70%:
  Protected: 90%
  Geared: 100 × (70 / 77.78) = 90%
  ✓ Continuous
```

### 7.2 Bonus Certificate Flat Line

The bonus certificate has a **flat line** at the bonus level until participation starts. This is intentional and correct.

```
if X < PS and barrier not breached:
  RED = BL (constant)

This creates a horizontal line in the graph.
```

**Not a bug**: The participation marker should align with where the payoff **starts rising** (the kink), not the raw strike.

---

## 8. Test Cases

### 8.1 Reverse Convertible Test Suite

#### Standard Barrier RC
```
N = $100,000, B = 70%, CPN = 10%, T = 12m, F = 4

Test 1: Above barrier
  X = 95% → RED = 100%, Total = 110%

Test 2: Exactly at barrier
  X = 70% → RED = 100%, Total = 110%

Test 3: Below barrier
  X = 65% → RED = 65%, Total = 75%

Test 4: Deep below
  X = 50% → RED = 50%, Total = 60%

Test 5: Upside
  X = 120% → RED = 100%, Total = 110% (no upside participation)
```

#### Low Strike Geared Put
```
N = $100,000, K = 55%, KI = 55%, CPN = 15%, T = 12m

Test 1: Above knock-in
  X = 70% → RED = 100%, Total = 115%

Test 2: Exactly at knock-in
  X = 55% → RED = 100%, Total = 115%

Test 3: Below knock-in (geared)
  X = 45% → RED = 81.82%, Total = 96.82%

Test 4: Deep below
  X = 30% → RED = 54.55%, Total = 69.55%
```

### 8.2 CPPN Test Suite

#### Standard CPPN
```
CP = 100%, PS = 100%, PR = 120%

Test 1: Deep downside
  X = 60% → RED = 100% (floor)

Test 2: Moderate downside
  X = 95% → RED = 100% (floor)

Test 3: At-the-money
  X = 100% → RED = 100%

Test 4: Moderate upside
  X = 110% → RED = 112% (1.2x participation)

Test 5: Strong upside
  X = 130% → RED = 136% (1.2x participation)
```

#### CPPN with Cap
```
CP = 100%, PS = 100%, PR = 120%, CAP = 125%

Test 1: Below cap
  X = 120% → RED = 124%

Test 2: Exactly at cap
  X = 120.83% → RED_raw = 125%, RED = 125%

Test 3: Above cap
  X = 130% → RED_raw = 136%, RED = 125% (capped)

Test 4: Far above cap
  X = 150% → RED_raw = 160%, RED = 125% (capped)
```

#### CPPN with Knock-In
```
CP = 100%, PS = 100%, PR = 120%, KI = 70%, S = 70%

Test 1: Above KI (protected)
  X = 90% → RED = 100%

Test 2: Exactly at KI
  X = 70% → RED = 100% (both paths equal)

Test 3: Below KI (geared)
  X = 65% → RED = 92.86%

Test 4: Deep below KI
  X = 50% → RED = 71.43%
```

#### Bonus Certificate
```
BL = 108%, BB = 60%, PS = 100%, PR = 100%, CAP = 125%

Test 1: Barrier breached, deep
  X = 50% → RED = 50% (1:1 downside)

Test 2: Barrier breached, near
  X = 58% → RED = 58%

Test 3: No breach, below strike
  X = 90% → RED = 108% (bonus floor)

Test 4: No breach, at strike
  X = 100% → RED = max(108%, 100%) = 108%

Test 5: No breach, participation
  X = 120% → RED = max(108%, 120%) = 120%

Test 6: No breach, capped
  X = 150% → RED = max(108%, 125%) = 125% (capped at 125%)
```

---

## 9. Implementation Notes

### 9.1 Order of Operations

**CRITICAL: Apply operations in the correct order:**

```
1. Calculate raw participation (UP)
2. Add capital protection: RED_raw = CP + UP
3. Apply cap: RED = min(RED_raw, CAP) [if cap enabled]
4. Apply bonus floor: RED = max(BL, RED) [if bonus enabled]
5. Floor at zero: RED = max(0, RED)
6. Convert to fraction: redemptionPct = RED / 100
```

**WRONG order causes incorrect payoffs!**

### 9.2 Never Negative

All redemption values MUST be floored at 0 to represent limited liability:

```
redemptionPct = max(0, RED / 100)
```

### 9.3 Floating Point Precision

Use appropriate rounding for display:
- Prices: 2 decimal places
- Percentages: 2 decimal places
- Internal calculations: 4+ decimal places

### 9.4 Edge Case Handling

```typescript
// Avoid division by zero
function safeDivide(a: number, b: number): number {
  if (b === 0 || !Number.isFinite(b)) return 0;
  const result = a / b;
  return Number.isFinite(result) ? result : 0;
}

// Ensure non-negative
function nonNeg(x: number): number {
  return Math.max(0, x);
}
```

### 9.5 Payoff Validation

Every payoff implementation should validate:

1. **Monotonicity**: Increasing X should never decrease RED (except at discontinuities)
2. **Boundary conditions**: Check behavior at 0%, 100%, barriers, strikes
3. **Continuity**: Check for unexpected jumps
4. **Cap enforcement**: Ensure RED never exceeds CAP
5. **Floor enforcement**: Ensure RED never below CP or BL
6. **Non-negativity**: Ensure RED ≥ 0

---

## Appendix A: Quick Reference Table

| Product | Floor | Upside | Downside Risk | Coupons |
|---------|-------|--------|---------------|---------|
| **RC Standard** | None | None (100%) | Full (1:1 or shares) | High unconditional |
| **RC Geared** | None | None (100%) | Geared (better) | High unconditional |
| **CPPN Standard** | 100% | Leveraged | Protected | None (v1) |
| **CPPN with KI** | Conditional | Leveraged | Geared if KI | None |
| **CPPN with Cap** | 100% | Capped | Protected | None |
| **Bonus Certificate** | Conditional (bonus) | Leveraged | Full (1:1) if breach | None |

---

## Appendix B: Formula Summary

### Reverse Convertible
```
Total = Coupons + Redemption

Standard Barrier:
  if X ≥ B: RED = 100%
  else: RED = X% (or shares)

Geared Put:
  if X ≥ KI: RED = 100%
  else: RED = (X / K) × 100%
```

### CPPN
```
Standard:
  RED = CP + PR × max(R - (PS/100), 0) × 100

With Knock-In:
  if X < KI: RED = 100 × (X / S)
  else: RED = CP + UP

With Cap:
  RED = min(RED_raw, CAP)

Bonus Certificate:
  if X < BB: RED = 100 × R (1:1 downside)
  else if X < PS: RED = BL (bonus floor)
  else: RED = max(BL, 100 + PR × (R - PS/100) × 100)
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 28, 2025 | Initial comprehensive documentation covering all products |

---

**End of Documentation**

For questions or clarifications, refer to the source code:
- `/src/products/reverseConvertible/engine.ts`
- `/src/products/capitalProtectedParticipation/engine.ts`
- `/src/products/capitalProtectedParticipation/terms.ts`
- `/src/products/reverseConvertible/terms.ts`

