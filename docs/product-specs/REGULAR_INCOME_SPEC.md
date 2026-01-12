# Regular Income (Reverse Convertible) - Product Specification

## Overview

**Product Code:** `RC`  
**Product Name Display:** "Regular Income"  
**Description:** Income-focused structured note that pays regular coupons with conditional downside conversion to underlying shares if barrier/strike is breached.

**Risk Level:** Medium  
**Income Focus:** High  
**Growth Focus:** Low

---

## Product Characteristics

This product combines:
- **Regular coupon payments** (guaranteed or conditional)
- **Capital at risk** if barrier/strike breached
- **Physical conversion** to underlying shares on breach
- **Optional autocall** for early redemption
- **Two variants:** Standard Barrier RC or Low Strike Geared Put

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
- **Fixed Value:** `'RC'` (Regular Income discriminator)

---

## Underlying Assets

### Basket Type
- **Field Name:** `basketType`
- **Type:** String
- **Options:**
  - `'single'` - Single underlying asset (1 underlying only)
  - `'worst_of'` - Worst performer of 2-3 underlyings (payoff based on worst)

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
  - Length: 1 for single, 2-3 for worst_of
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

## Coupon Terms

### Coupon Rate (Annual)
- **Field Name:** `couponRatePA`
- **Type:** Number (decimal format)
- **Example:** 0.10 = 10% annual
- **Range:** 0 to 1 (0% to 100%)
- **Description:** Annual coupon rate paid to investor

### Coupon Frequency
- **Field Name:** `couponFreqPerYear`
- **Type:** Number
- **Options:**
  - `12` - Monthly
  - `4` - Quarterly
  - `2` - Semi-annual
  - `1` - Annual
- **Default:** `4` (quarterly)

### Coupon Type
- **Field Name:** `couponType`
- **Type:** String
- **Options:**
  - `'guaranteed'` - Coupons are always paid (unconditional)
  - `'conditional'` - Coupons paid only if trigger condition met
- **Default:** `'guaranteed'`
- **Description:** Determines whether coupons are unconditional or conditional on trigger level

### Coupon Trigger Level (Required if Conditional)
- **Field Name:** `couponTriggerLevelPct`
- **Type:** Number (decimal format)
- **Example:** 0.60 = 60% trigger level
- **Range:** 0 to 1 (0% to 100%)
- **Required:** Yes (if couponType = 'conditional')
- **Description:** Minimum performance level for coupon payment
- **Note:** Coupons only paid if underlying(s) at or above this level at observation date

---

## Product Variant Selection

### Variant
- **Field Name:** `variant`
- **Type:** String
- **Options:**
  - `'standard_barrier_rc'` - European Barrier Reverse Convertible
  - `'low_strike_geared_put'` - Low Strike / Geared Put variant
- **Description:** Determines which downside protection mechanism to use

---

## Variant 1: Standard Barrier RC

**When:** `variant = 'standard_barrier_rc'`

### Barrier Percentage
- **Field Name:** `barrierPct`
- **Type:** Number (decimal format)
- **Example:** 0.70 = 70%
- **Range:** 0 to 1
- **Required:** Yes (when variant is standard_barrier_rc)
- **Description:** If final level < barrier → physical conversion to shares
- **Checked:** At maturity only (European style)

---

## Variant 2: Low Strike Geared Put

**When:** `variant = 'low_strike_geared_put'`

### Strike Percentage
- **Field Name:** `strikePct`
- **Type:** Number (decimal format)
- **Example:** 0.55 = 55%
- **Range:** 0 to 1
- **Required:** Yes (when variant is low_strike_geared_put)
- **Description:** Lower strike = higher gearing on downside

### Knock-In Barrier (Optional)
- **Field Name:** `knockInBarrierPct`
- **Type:** Number (decimal format)
- **Example:** 0.55 = 55%
- **Range:** 0 to 1
- **Required:** Optional
- **Default:** Defaults to strikePct value if omitted
- **Validation:** Must be ≤ strikePct

### Conversion Ratio
- **Field Name:** `conversionRatio`
- **Type:** Number
- **Typical Value:** 1.0
- **Description:** Number of shares received per unit if conversion occurs

---

## Autocall Feature (Optional)

### Autocall Enabled
- **Field Name:** `autocallEnabled`
- **Type:** Boolean
- **Default:** `false`
- **Description:** If true, product can be called early

### Autocall Level
- **Field Name:** `autocallLevelPct`
- **Type:** Number (decimal format)
- **Example:** 1.00 = 100%
- **Range:** 0 to 2.0 (0% to 200%)
- **Required:** Yes (if autocallEnabled = true)
- **Description:** Trigger level for early redemption

### Autocall Frequency
- **Field Name:** `autocallFrequency`
- **Type:** Number
- **Options:** `12` (monthly), `4` (quarterly), `2` (semi-annual), `1` (annual)
- **Required:** Optional
- **Default:** Defaults to couponFreqPerYear if not provided
- **Description:** How often autocall is observed

---

## Validation Rules

### Basic Validation
1. `notional` must be > 0
2. `tenorMonths` must be > 0
3. `couponRatePA` must be between 0 and 1
4. `conversionRatio` must be > 0

### Basket Validation
5. For single basket: exactly 1 underlying required
6. For worst_of basket: 2-3 underlyings required, all unique tickers
7. `initialFixings` array length must match underlyings array length
8. All initial fixings must be > 0

### Coupon Validation
9. `couponType` must be either 'guaranteed' or 'conditional'
10. If `couponType = 'conditional'`: `couponTriggerLevelPct` required and between 0-1

### Variant-Specific Validation
11. If `variant = 'standard_barrier_rc'`: `barrierPct` required and between 0-1
12. If `variant = 'low_strike_geared_put'`: `strikePct` required and between 0-1
13. If `knockInBarrierPct` provided: must be between 0-1 and ≤ strikePct

### Autocall Validation
14. If `autocallEnabled = true`: `autocallLevelPct` required and between 0-2.0

---

## TypeScript Types

```typescript
// Regular Income Terms
interface RegularIncomeTerms {
  // Basic Info
  productType: 'RC';
  notional: number;
  currency: Currency;
  tenorMonths: number;
  
  // Underlyings
  basketType: 'single' | 'worst_of';
  underlyings: Underlying[];
  initialFixings?: number[];
  
  // Coupon
  couponRatePA: number;
  couponFreqPerYear: CouponFrequency;
  couponType: CouponType;
  couponTriggerLevelPct?: number; // Required if couponType = 'conditional'
  
  // Variant Selection
  variant: ReverseConvertibleVariant;
  
  // Standard Barrier RC fields
  barrierPct?: number;
  
  // Low Strike Geared Put fields
  strikePct?: number;
  knockInBarrierPct?: number;
  conversionRatio?: number;
  
  // Autocall (optional)
  autocallEnabled?: boolean;
  autocallLevelPct?: number;
  autocallFrequency?: number;
}

// Supporting Types
interface Underlying {
  ticker: string;
  name?: string;
}

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';
type CouponFrequency = 12 | 4 | 2 | 1;
type CouponType = 'guaranteed' | 'conditional';
type ReverseConvertibleVariant = 'standard_barrier_rc' | 'low_strike_geared_put';
```

---

## Form Layout Recommendations

### Page Structure

1. **Product Selector**
   - Fixed to "Regular Income"
   - Display income-focused badge

2. **Basic Terms**
   - Notional amount input
   - Currency dropdown
   - Tenor (months) input

3. **Underlying Selection**
   - Basket type selector (Single / Worst-of)
   - Symbol search/input (1-3 underlyings based on basket type)
   - Initial fixings (auto-fetched or manual override)

4. **Coupon Configuration**
   - Annual coupon rate (%) input
   - Frequency dropdown (Monthly/Quarterly/Semi-annual/Annual)
   - Coupon type selector (Guaranteed / Conditional)
   - Trigger level input (only shown if Conditional selected)

5. **Variant Selector** (Radio buttons or tabs)
   - Standard Barrier RC
   - Low Strike Geared Put

6. **Barrier/Strike Parameters** (Conditional on variant)
   
   **If Standard Barrier RC:**
   - Barrier percentage input
   
   **If Low Strike Geared Put:**
   - Strike percentage input
   - Knock-in barrier (optional) input
   - Conversion ratio input

7. **Autocall Feature** (Optional Section - Toggle)
   - Enable/Disable toggle
   - If enabled:
     - Autocall level input
     - Autocall frequency dropdown

### UI/UX Recommendations

- **Coupon Highlight:** Display projected annual income in prominent card
- **Coupon Type Toggle:** Clear visual distinction between guaranteed and conditional coupons
- **Conditional Coupon Warning:** If conditional selected, show "Coupons only paid if trigger met"
- **Trigger Level Visualization:** Show trigger level on graph/chart if conditional
- **Variant Switcher:** Clear visual distinction between two variants
- **Conditional Fields:** Show/hide barrier or strike fields based on variant
- **Autocall Preview:** Show potential early redemption dates when enabled
- **Income Calculator:** Display projected coupon amounts and payment schedule (with asterisk for conditional)
- **Risk Warning:** Clear indication of conversion risk and coupon payment risk (if conditional)

---

## Payoff Logic Summary

### Coupon Payments
- **Amount:** `notional × couponRatePA / couponFreqPerYear`
- **Frequency:** Based on couponFreqPerYear
- **Payment Condition:**
  - **If Guaranteed:** Coupons always paid at each observation date
  - **If Conditional:** Coupons paid only if underlying(s) ≥ couponTriggerLevelPct at observation date
    - For single basket: underlying ≥ trigger level
    - For worst-of basket: worst performing underlying ≥ trigger level

### Autocall (if enabled)
- **Checked at:** Each observation date (based on autocallFrequency)
- **Condition:** If any underlying ≥ autocallLevelPct
- **Payoff:** `notional + accrued coupons`

### Maturity Payoff

#### Standard Barrier RC:
- **If final ≥ barrierPct:** Return notional
- **If final < barrierPct:** Physical conversion to worst-performing shares

#### Low Strike Geared Put:
- **If knock-in not breached:** Return notional
- **If knock-in breached:**
  - If final > strikePct: Return notional
  - If final ≤ strikePct: Geared-put payoff = `notional × (final / strikePct)`

---

## API Integration Points

### Symbol Search
- Use existing `SymbolInput` component
- Support 1-3 selections based on basket type

### Initial Fixings
- Fetch current prices from market data API
- Allow manual override

### Validation
- Import from `/src/products/reverseConvertible/terms.ts`

### Payoff Calculation
- Import engine from `/src/products/reverseConvertible/engine.ts`

### Coupon Schedule
- Generate payment dates based on tenor and frequency
- Use schedule utilities from `/src/products/common/schedule.ts`

---

## Related Files

- **Product Engine:** `/src/products/reverseConvertible/engine.ts`
- **Type Definitions:** `/src/products/reverseConvertible/terms.ts`
- **Break-Even Logic:** `/src/products/reverseConvertible/breakEven.ts`
- **Common Types:** `/src/products/common/productTypes.ts`
- **Existing Form:** `/src/components/input/ProductInputForm.tsx` (reference)

---

## Example Configurations

### Example 1: Standard Barrier RC with Guaranteed Coupons (Single Underlying)

```typescript
const standardRC: RegularIncomeTerms = {
  productType: 'RC',
  notional: 100000,
  currency: 'USD',
  tenorMonths: 12,
  
  basketType: 'single',
  underlyings: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
  initialFixings: [150.00],
  
  couponRatePA: 0.10,      // 10% annual
  couponFreqPerYear: 4,    // Quarterly
  couponType: 'guaranteed', // Always paid
  
  variant: 'standard_barrier_rc',
  barrierPct: 0.70,        // 70% barrier
  
  autocallEnabled: false,
};
```

### Example 2: Low Strike Geared Put with Conditional Coupons and Autocall (Worst-of)

```typescript
const gearedPutRC: RegularIncomeTerms = {
  productType: 'RC',
  notional: 100000,
  currency: 'USD',
  tenorMonths: 12,
  
  basketType: 'worst_of',
  underlyings: [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.' },
  ],
  initialFixings: [150.00, 350.00],
  
  couponRatePA: 0.12,              // 12% annual
  couponFreqPerYear: 4,            // Quarterly
  couponType: 'conditional',       // Conditional coupons
  couponTriggerLevelPct: 0.60,    // 60% trigger level
  
  variant: 'low_strike_geared_put',
  strikePct: 0.55,                 // 55% strike
  knockInBarrierPct: 0.55,         // 55% knock-in
  conversionRatio: 1.0,
  
  autocallEnabled: true,
  autocallLevelPct: 1.00,          // 100% autocall
  autocallFrequency: 4,            // Quarterly observations
};
```

### Example 3: Standard Barrier RC with Conditional Coupons (Single Underlying)

```typescript
const conditionalCouponRC: RegularIncomeTerms = {
  productType: 'RC',
  notional: 100000,
  currency: 'USD',
  tenorMonths: 12,
  
  basketType: 'single',
  underlyings: [{ ticker: 'TSLA', name: 'Tesla Inc.' }],
  initialFixings: [250.00],
  
  couponRatePA: 0.15,              // 15% annual (higher rate for conditional)
  couponFreqPerYear: 4,            // Quarterly
  couponType: 'conditional',       // Conditional coupons
  couponTriggerLevelPct: 0.65,    // 65% trigger level
  
  variant: 'standard_barrier_rc',
  barrierPct: 0.60,                // 60% barrier
  
  autocallEnabled: false,
};
```

---

## Product Differentiation

This product is distinguished by:
1. `productType` = 'RC' (unique discriminator)
2. Regular coupon payments (primary feature)
3. Physical conversion risk on downside
4. Two distinct variants for downside protection
5. Optional autocall for early redemption
6. Income-focused investor profile

---

**Document Version:** 1.1  
**Last Updated:** January 6, 2026  
**Status:** Standalone Module - Ready for Implementation

**Changelog:**
- v1.1: Added coupon type field (guaranteed/conditional) and coupon trigger level field
- v1.0: Initial release


