# Capital Protection (Capital Protected Participation Note) - Product Specification

## Overview

**Product Code:** `CPPN`  
**Product Name Display:** "Capital Protection"  
**Description:** Protected participation note with optional knock-in feature. Offers capital protection on downside with leveraged participation on upside (or downside).

**Risk Level:** Low  
**Income Focus:** Low  
**Growth Focus:** Medium

---

## Product Characteristics

This product combines:
- **Capital protection** (partial or full)
- **Leveraged participation** in underlying performance
- **Optional cap** on maximum return
- **Optional knock-in** (airbag feature) for enhanced structure
- **Flexible basket types** (single, worst-of, best-of, average)

---

## Basic Product Information

### Notional Amount
- **Field Name:** `notional`
- **Type:** Number (e.g., 100000)
- **Validation:** Must be > 0
- **Description:** Investment amount

### Currency
- **Field Name:** `currency`
- **Type:** String
- **Options:** `'USD'`, `'EUR'`, `'GBP'`, `'JPY'`
- **Default:** `'USD'`

### Tenor
- **Field Name:** `tenorMonths`
- **Type:** Number (e.g., 12)
- **Validation:** Must be > 0
- **Description:** Product duration in months

### Product Type
- **Field Name:** `productType`
- **Type:** String
- **Fixed Value:** `'CPPN'`
- **Description:** Technical discriminator (shared with Bonus Certificate)

---

## Underlying Assets

### Basket Type
- **Field Name:** `basketType`
- **Type:** String
- **Options:**
  - `'single'` - Single underlying asset
  - `'worst_of'` - Worst performer of 2-3 underlyings (payoff based on worst)
  - `'best_of'` - Best performer of 2-3 underlyings (payoff based on best)
  - `'average'` - Average performance of 2-3 underlyings

### Underlyings
- **Field Name:** `underlyings`
- **Type:** Array of Underlying objects
- **Structure:**
  ```typescript
  interface Underlying {
    ticker: string;      // e.g., "AAPL"
    name?: string;       // e.g., "Apple Inc."
  }
  ```
- **Constraints:**
  - Length: 1 for single, 2-3 for basket types
  - All tickers must be unique

### Initial Fixings
- **Field Name:** `initialFixings`
- **Type:** Array of Numbers
- **Validation:** 
  - Must match length of underlyings array
  - All values must be > 0
- **Description:** Initial price/level for each underlying
- **Note:** Fetched via spot price API (not required in admin panel)

---

## Capital Protection Parameters

### Capital Protection Percentage
- **Field Name:** `capitalProtectionPct`
- **Type:** Number (percentage as whole number)
- **Example:** 100 = 100% protection, 90 = 90% protection
- **Range:** 0 to 200 (but use 1-200 for Capital Protection product)
- **Description:** The protected payoff floor
- **Note:** 
  - For Capital Protection: Must be > 0 (typically 90-100)
  - For Bonus Certificate: Must be 0 (see separate spec)

---

## Participation Parameters

### Participation Direction
- **Field Name:** `participationDirection`
- **Type:** String
- **Options:**
  - `'up'` - Participate in upside moves (most common)
  - `'down'` - Participate in downside moves (rare)

### Participation Start Level
- **Field Name:** `participationStartPct`
- **Type:** Number (percentage as whole number)
- **Example:** 100 = participation starts at 100% of initial
- **Range:** 0 to 300
- **Description:** Strike level where participation begins
- **Common Values:** 100 (at-the-money), 110 (out-of-the-money)

### Participation Rate
- **Field Name:** `participationRatePct`
- **Type:** Number (percentage as whole number)
- **Example:** 120 = 120% participation (1.2x leverage)
- **Range:** 0 to 500
- **Description:** Multiplier for performance beyond participation start
- **Common Values:** 100-150 (1.0x to 1.5x leverage)

---

## Cap Feature (Optional)

### Cap Type
- **Field Name:** `capType`
- **Type:** String
- **Options:**
  - `'none'` - Unlimited upside
  - `'capped'` - Maximum return is limited

### Cap Level (Required if Capped)
- **Field Name:** `capLevelPct`
- **Type:** Number (percentage as whole number)
- **Example:** 140 = maximum 140% return
- **Range:** Must be > participationStartPct
- **Required:** Only when capType = 'capped'
- **Description:** Maximum return limit

---

## Knock-In Feature (Optional - "Airbag")

The knock-in feature acts as an "airbag" - capital protection holds unless barrier is breached at maturity.

### Knock-In Enabled
- **Field Name:** `knockInEnabled`
- **Type:** Boolean
- **Default:** `false`
- **Description:** If true, adds European knock-in barrier (checked at maturity only)

### Knock-In Mode
- **Field Name:** `knockInMode`
- **Type:** String
- **Fixed Value:** `'EUROPEAN'`
- **Description:** Checked only at maturity (not continuous)
- **Note:** v1 only supports European (future: American/continuous)

### Knock-In Level
- **Field Name:** `knockInLevelPct`
- **Type:** Number (percentage as whole number)
- **Example:** 70 = 70% of initial
- **Range:** 0 to 300
- **Required:** Yes (if knockInEnabled = true)
- **Description:** If final level < KI at maturity, switches to geared-put payoff

### Downside Strike
- **Field Name:** `downsideStrikePct`
- **Type:** Number (percentage as whole number)
- **Example:** 70 = 70% of initial
- **Range:** 0 to 300
- **Required:** Optional
- **Default:** Defaults to knockInLevelPct if not provided
- **Description:** Used in geared-put formula when knock-in triggers
- **Special Behavior:** If capitalProtectionPct < 100, auto-calculated to prevent discontinuity

---

## Important Calculation Note - Continuity Guard

### Auto-Calculation for Partial Protection

When `knockInEnabled = true` AND `capitalProtectionPct < 100`:

- The system **automatically calculates minimum strike** (S_min) to ensure payoff continuity
- **Formula ensures:** payoff just below KI = protected payoff at KI
- This prevents the **"breach becomes better"** paradox
- **Developer:** Implement the guard calculation from `/src/products/capitalProtectedParticipation/guards.ts`

### Mathematical Background

```
At knock-in level:
- Protected side: P% of notional
- Unprotected side: notional × (KI / S)

For continuity: P = KI / S
Therefore: S_min = KI / (P/100)

Example: If P = 90% and KI = 70%
S_min = 70 / 0.90 = 77.78%
```

---

## Validation Rules

### Basic Validation
1. `notional` must be > 0
2. `tenorMonths` must be > 0
3. `capitalProtectionPct` must be 0 or between 1-200
   - For Capital Protection: must be > 0
4. For single basket: exactly 1 underlying required
5. For other baskets: 2-3 underlyings required, all unique tickers
6. `initialFixings` array length must match underlyings array length
7. All initial fixings must be > 0

### Participation Validation
8. `participationStartPct` must be between 0-300
9. `participationRatePct` must be between 0-500
10. If `capType` = 'capped': `capLevelPct` must be > participationStartPct

### Knock-In Validation
11. If `knockInEnabled`: `knockInLevelPct` required and between 0-300
12. If `knockInEnabled`: `downsideStrikePct` must be between 0-300
13. If `capitalProtectionPct` < 100 AND `knockInEnabled`: enforce S ≥ S_min (continuity guard)

---

## TypeScript Types

```typescript
// Capital Protection Terms
interface CapitalProtectionTerms {
  // Basic Info
  productType: 'CPPN';
  notional: number;
  currency: Currency;
  tenorMonths: number;
  
  // Underlyings
  basketType: BasketType;
  underlyings: Underlying[];
  initialFixings?: number[];
  
  // Capital Protection (MUST BE > 0 for Capital Protection)
  capitalProtectionPct: number; // 1-200, typically 90-100
  
  // Participation
  participationDirection: ParticipationDirection;
  participationStartPct: number;
  participationRatePct: number;
  
  // Cap (optional)
  capType: CapType;
  capLevelPct?: number;
  
  // Knock-In / Airbag (optional)
  knockInEnabled?: boolean;
  knockInMode?: 'EUROPEAN';
  knockInLevelPct?: number;
  downsideStrikePct?: number;
  
  // Bonus Feature (must be false or omitted)
  bonusEnabled?: false;
}

// Supporting Types
interface Underlying {
  ticker: string;
  name?: string;
}

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';
type BasketType = 'single' | 'worst_of' | 'best_of' | 'average';
type ParticipationDirection = 'up' | 'down';
type CapType = 'none' | 'capped';
```

---

## Form Layout Recommendations

### Page Structure

1. **Product Selector**
   - Fixed to "Capital Protection"
   - Display low-risk badge

2. **Basic Terms**
   - Notional amount input
   - Currency dropdown
   - Tenor (months) input

3. **Underlying Selection**
   - Basket type selector (Single / Worst-of / Best-of / Average)
   - Symbol search/input (1-3 underlyings based on basket type)
   - Initial fixings (auto-fetched or manual override)

4. **Capital Protection Level**
   - Protection percentage input (90-100 typical)
   - Visual indicator showing protected floor
   - Display: "You are guaranteed at least X% of your investment"

5. **Participation Configuration**
   - Direction selector (Up / Down)
   - Start level input (strike)
   - Participation rate input (leverage multiplier)
   - Visual: Show how participation amplifies returns

6. **Cap Configuration** (Optional Section)
   - Toggle: Capped / Uncapped
   - If capped: Cap level input
   - Visual: Show maximum return

7. **Knock-In / Airbag Feature** (Optional Section - Advanced)
   - Toggle: Enable/Disable
   - If enabled:
     - Knock-in level input
     - Downside strike input (optional)
     - Auto-calculation indicator for partial protection
     - Warning: "If breached at maturity, protection may be reduced"

### UI/UX Recommendations

- **Protection Highlight:** Prominently display protected floor amount
- **Payoff Diagram:** Interactive graph showing protected floor and participation
- **Continuity Warning:** If P < 100 and KI enabled, show auto-calculation notification
- **Basket Explanation:** Clear description of basket type logic
- **Risk Indicator:** Show risk level based on protection percentage
- **Preset Templates:** Common configurations (e.g., "100% Protected with 120% Participation")

---

## Payoff Logic Summary

### Without Knock-In (Simple Case)

```
At maturity:
If final ≥ protectedFloor:
  Payoff = max(
    capitalProtectionPct,
    participationStartPct + participationRate × (final - participationStartPct)
  )
  
If capped: Payoff = min(Payoff, capLevelPct)
```

### With Knock-In (Airbag)

```
At maturity:
If final ≥ knockInLevelPct:
  // Use standard protected payoff (as above)
  
If final < knockInLevelPct:
  // Airbag triggered - geared put
  Payoff = notional × (final / downsideStrikePct)
  
Note: If capitalProtectionPct < 100, downsideStrikePct is auto-calculated for continuity
```

---

## API Integration Points

### Symbol Search
- Use existing `SymbolInput` component
- Support 1-3 selections based on basket type

### Initial Fixings
- Fetch current prices from market data API
- Allow manual override

### Validation
- Import from `/src/products/capitalProtectedParticipation/terms.ts`
- Import guards from `/src/products/capitalProtectedParticipation/guards.ts`

### Payoff Calculation
- Import engine from `/src/products/capitalProtectedParticipation/engine.ts`
- Import break-even logic from `/src/products/capitalProtectedParticipation/breakEven.ts`

---

## Related Files

- **Product Engine:** `/src/products/capitalProtectedParticipation/engine.ts`
- **Type Definitions:** `/src/products/capitalProtectedParticipation/terms.ts`
- **Continuity Guards:** `/src/products/capitalProtectedParticipation/guards.ts`
- **Break-Even Logic:** `/src/products/capitalProtectedParticipation/breakEven.ts`
- **Common Types:** `/src/products/common/productTypes.ts`
- **Existing Form:** `/src/components/input/ProductInputForm.tsx` (reference)

---

## Example Configurations

### Example 1: Full Protection with Leveraged Participation (No Cap)

```typescript
const fullProtection: CapitalProtectionTerms = {
  productType: 'CPPN',
  notional: 100000,
  currency: 'USD',
  tenorMonths: 12,
  
  basketType: 'single',
  underlyings: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
  initialFixings: [150.00],
  
  capitalProtectionPct: 100, // 100% protection
  
  participationDirection: 'up',
  participationStartPct: 100,
  participationRatePct: 120,  // 1.2x leverage
  
  capType: 'none',
  
  knockInEnabled: false,
  bonusEnabled: false,
};
```

### Example 2: Partial Protection with Knock-In (Airbag)

```typescript
const airbagStructure: CapitalProtectionTerms = {
  productType: 'CPPN',
  notional: 100000,
  currency: 'USD',
  tenorMonths: 12,
  
  basketType: 'worst_of',
  underlyings: [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.' },
  ],
  initialFixings: [150.00, 350.00],
  
  capitalProtectionPct: 90, // 90% protection
  
  participationDirection: 'up',
  participationStartPct: 100,
  participationRatePct: 150,  // 1.5x leverage
  
  capType: 'capped',
  capLevelPct: 140,  // 140% cap
  
  knockInEnabled: true,
  knockInMode: 'EUROPEAN',
  knockInLevelPct: 70,
  // downsideStrikePct auto-calculated: 70/0.90 = 77.78
  
  bonusEnabled: false,
};
```

---

## Product Differentiation

This product is distinguished from Bonus Certificate by:
1. `capitalProtectionPct` > 0 (has protection)
2. `bonusEnabled` = false (no bonus feature)
3. Lower risk profile
4. Suitable for conservative investors
5. Focus on downside protection with upside participation

---

**Document Version:** 1.0  
**Last Updated:** January 6, 2026  
**Status:** Standalone Module - Ready for Implementation

