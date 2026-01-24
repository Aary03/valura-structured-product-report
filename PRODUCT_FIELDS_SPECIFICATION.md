# Product Fields Specification

## Overview

This document outlines the complete field specifications for three financial products. Each product has distinct characteristics and required fields that must be implemented on separate pages.

---

## Product 1: Regular Income (Reverse Convertible)

**Product Code:** `RC`
**Description:** Income-focused structured note that pays regular coupons with conditional downside conversion to underlying shares if barrier/strike is breached.

### Basic Product Information

- **Product Type** (productType): `'Regular Income'` (fixed discriminator)
- **Product Name Display**: "India Leaders"
- **Notional Amount** (notional): Number (e.g., 100000)
  - Must be > 0
  - Represents investment amount
- **Currency** (currency): String
  - Options: `'USD'`, `'EUR'`, `'GBP'`, `'JPY'`
  - Default: `'USD'`
- **Tenor** (tenorMonths): Number (e.g., 12)
  - Must be > 0
  - Represents product duration in months

### Underlying Assets

- **Basket Type** (basketType): String
  - Options: `'single'`, `'worst_of'`
  - `'single'` = 1 underlying only
  - `'worst_of'` = 2-3 underlyings (payoff based on worst performer)
- **Underlyings** (underlyings): Array of Underlying objects
  - Each underlying contains:
    - `ticker`: String (e.g., "AAPL")
    - `name`: String (optional, e.g., "Apple Inc.")
  - Length: 1 for single, 2-3 for worst_of
  - All tickers must be unique
- **Initial Fixings** (initialFixings): Array of Numbers
  - Must match length of underlyings array
  - Initial price/level for each underlying
  - All values must be > 0
  - ( Spot Price Hit api ) - ( not required in admin panel)

### Coupon Terms

- **Coupon Rate (Annual)** (couponRatePA): Number (decimal format)
  - Example: 0.10 = 10% annual
  - Range: 0 to 1 (0% to 100%)
- **Coupon Frequency** (couponFreqPerYear): Number
  - Options: `12` (monthly), `4` (quarterly), `2` (semi-annual), `1` (annual)
  - Default: `4` (quarterly)
- **Coupon Condition** (couponCondition): String
  - Fixed value: `'unconditional'`
  - Coupons are always paid (v1 feature)

### Product Variant Selection

- **Variant** (variant): String
  - Options:
    - `'standard_barrier_rc'` - Europeann Barrier Reverse Convertible
    - `'low_strike_geared_put'` - Low Strike / Geared Put variant

#### If Standard Barrier RC (variant = 'standard_barrier_rc'):

- **Barrier Percentage** (barrierPct): Number (decimal format)
  - Example: 0.70 = 70%
  - Range: 0 to 1
  - Required when variant is standard_barrier_rc
  - If final level < barrier → physical conversion to shares

#### If Low Strike Geared Put (variant = 'low_strike_geared_put'):

- **Strike Percentage** (strikePct): Number (decimal format)

  - Example: 0.55 = 55%
  - Range: 0 to 1
  - Required when variant is low_strike_geared_put
  - Lower strike = higher gearing on downside
- **Knock-In Barrier** (knockInBarrierPct): Number (decimal format) - OPTIONAL

  - Example: 0.55 = 55%
  - Range: 0 to 1
  - If omitted, defaults to strikePct value
  - Must be ≤ strikePct
- - Typically 1.0

### Autocall Feature (Optional)

- **Autocall Enabled** (autocallEnabled): Boolean
  - Default: `false`
  - If true, product can be called early
- **Autocall Level** (autocallLevelPct): Number (decimal format) - Required if enabled
  - Example: 1.00 = 100%
  - Range: 0 to 2.0 (0% to 200%)
  - Trigger level for early redemption
- **Autocall Frequency** (autocallFrequency): Number - OPTIONAL
  - Options: `12` (monthly), `4` (quarterly), `2` (semi-annual), `1` (annual)
  - If omitted, defaults to couponFreqPerYear
  - How often autocall is observed


### Validation Rules

1. Notional must be > 0
2. Tenor must be > 0
3. Coupon rate must be between 0 and 1
4. Conversion ratio must be > 0
5. For single basket: exactly 1 underlying required
6. For worst_of basket: 2-3 underlyings required, all unique tickers
7. Initial fixings array length must match underlyings array length
8. All initial fixings must be > 0
9. If standard_barrier_rc: barrierPct required and between 0-1
10. If low_strike_geared_put: strikePct required and between 0-1
11. If knockInBarrierPct provided: must be between 0-1 and ≤ strikePct

---

## Product 2: Capital Protection (Capital Protected Participation Note)

**Product Code:** `CPPN`
**Description:** Protected participation note with optional knock-in feature. Offers capital protection on downside with leveraged participation on upside (or downside).

### Basic Product Information

- **Product Type** (productType): `'CPPN'` (fixed discriminator)
- **Product Name Display**: "Capital Protection"
- **Notional Amount** (notional): Number (e.g., 100000)
  - Must be > 0
  - Represents investment amount
- **Currency** (currency): String
  - Options: `'USD'`, `'EUR'`, `'GBP'`, `'JPY'`
  - Default: `'USD'`
- **Tenor** (tenorMonths): Number (e.g., 12)
  - Must be > 0
  - Represents product duration in months

### Underlying Assets

- **Basket Type** (basketType): String
  - Options: `'single'`, `'worst_of'`, `'best_of'`, `'average'`
  - `'single'` = 1 underlying
  - `'worst_of'` = 2-3 underlyings (worst performer determines payoff)
  - `'best_of'` = 2-3 underlyings (best performer determines payoff)
  - `'average'` = 2-3 underlyings (average performance determines payoff)
- **Underlyings** (underlyings): Array of Underlying objects
  - Each underlying contains:
    - `ticker`: String (e.g., "AAPL")
    - `name`: String (optional, e.g., "Apple Inc.")
  - Length: 1 for single, 2-3 for basket types
  - All tickers must be unique

### Capital Protection Parameters

- **Capital Protection Percentage** (capitalProtectionPct): Number (percentage as whole number)
  - Example: 100 = 100% protection, 90 = 90% protection
  - Range: 0 to 200
  - This is the protected payoff floor
  - Can be 0 for Bonus Certificate variant (see Product 3)

### Participation Parameters

- **Participation Direction** (participationDirection): String
  - Options: `'up'`, `'down'`
  - `'up'` = participate in upside moves
  - `'down'` = participate in downside moves (rare)
- **Participation Start Level** (participationStartPct): Number (percentage as whole number)
  - Example: 100 = participation starts at 100% of initial
  - Range: 0 to 300
  - Strike level where participation begins
- **Participation Rate** (participationRatePct): Number (percentage as whole number)
  - Example: 120 = 120% participation (1.2x leverage)
  - Range: 0 to 500
  - Multiplier for performance beyond participation start

### Cap Feature

- **Cap Type** (capType): String
  - Options: `'none'`, `'capped'`
  - `'none'` = unlimited upside
  - `'capped'` = maximum return is limited
- **Cap Level** (capLevelPct): Number (percentage as whole number) - Required if capped
  - Example: 140 = maximum 140% return
  - Range: Must be > participationStartPct
  - Only required when capType = 'capped'

### Knock-In Feature (Optional)

- **Knock-In Enabled** (knockInEnabled): Boolean
  - Default: `false`
  - If true, adds European knock-in barrier (checked at maturity only)
- **Knock-In Mode** (knockInMode): String
  - Fixed value: `'EUROPEAN'`
  - Checked only at maturity (not continuous)
- **Knock-In Level** (knockInLevelPct): Number (percentage) - Required if enabled
  - Example: 70 = 70% of initial
  - Range: 0 to 300
  - If final level < KI, switches to geared-put payoff
- **Downside Strike** (downsideStrikePct): Number (percentage) - OPTIONAL
  - Example: 70 = 70% of initial
  - Range: 0 to 300
  - Defaults to knockInLevelPct if not provided
  - Used in geared-put formula when knock-in triggers
  - SPECIAL: If capitalProtectionPct < 100, this is auto-calculated to prevent discontinuity

### Important Calculation Note

When `knockInEnabled = true` and `capitalProtectionPct < 100`:

- The system automatically calculates minimum strike (S_min) to ensure payoff continuity
- Formula ensures: payoff just below KI = protected payoff at KI
- This prevents "breach becomes better" paradox
- Developer should implement the guard calculation from `guards.ts`

### Validation Rules

1. Notional must be > 0
2. Tenor must be > 0
3. For single basket: exactly 1 underlying required
4. For other baskets: 2-3 underlyings required, all unique tickers
5. Initial fixings array length must match underlyings array length
6. All initial fixings must be > 0
7. capitalProtectionPct must be 0 or between 1-200
8. participationStartPct must be between 0-300
9. participationRatePct must be between 0-500
10. If capType = 'capped': capLevelPct must be > participationStartPct
11. If knockInEnabled: knockInLevelPct required and between 0-300
12. If knockInEnabled: downsideStrikePct must be between 0-300
13. If capitalProtectionPct < 100 and knockInEnabled: enforce S ≥ S_min (continuity guard)

---

## Product 3: Boosted Growth (Bonus Certificate)

**Product Code:** `CPPN` with special configuration
**Description:** Participation product with NO capital protection but offers guaranteed bonus return if barrier is never breached. High risk, high reward structure.

### Basic Product Information

- **Product Type** (productType): `'CPPN'` (fixed discriminator - same as Capital Protection)
- **Product Name Display**: "Boosted Growth"
- **Notional Amount** (notional): Number (e.g., 100000)
  - Must be > 0
  - Represents investment amount
- **Currency** (currency): String
  - Options: `'USD'`, `'EUR'`, `'GBP'`, `'JPY'`
  - Default: `'USD'`
- **Tenor** (tenorMonths): Number (e.g., 12)
  - Must be > 0
  - Represents product duration in months

### Underlying Assets

- **Basket Type** (basketType): String
  - Options: `'single'`, `'worst_of'`, `'best_of'`, `'average'`
  - Same as Capital Protection product
- **Underlyings** (underlyings): Array of Underlying objects
  - Each underlying contains:
    - `ticker`: String (e.g., "AAPL")
    - `name`: String (optional, e.g., "Apple Inc.")
  - Length: 1 for single, 2-3 for basket types
  - All tickers must be unique

### Capital Protection (MUST BE ZERO)

- **Capital Protection Percentage** (capitalProtectionPct): Number
  - **FIXED VALUE: 0**
  - Bonus Certificate has NO capital protection
  - This distinguishes it from Capital Protection product

### Participation Parameters

- **Participation Direction** (participationDirection): String
  - Options: `'up'`, `'down'`
  - Typically `'up'` for bonus certificates
- **Participation Start Level** (participationStartPct): Number (percentage as whole number)
  - Example: 100 = participation starts at 100% of initial
  - Range: 0 to 300
  - Usually 100 (at-the-money)
- **Participation Rate** (participationRatePct): Number (percentage as whole number)
  - Example: 100 = 100% participation (1:1)
  - Range: 0 to 500
  - Often 100 for bonus certificates (1:1 participation)

### Cap Feature

- **Cap Type** (capType): String
  - Options: `'none'`, `'capped'`
  - Can be capped or uncapped
- **Cap Level** (capLevelPct): Number (percentage as whole number) - Required if capped
  - Example: 140 = maximum 140% return
  - Range: Must be > participationStartPct
  - Only required when capType = 'capped'

### Bonus Feature (REQUIRED FOR BOOSTED GROWTH)

- **Bonus Enabled** (bonusEnabled): Boolean
  - **MUST BE TRUE** for Boosted Growth product
  - This is the defining feature
- **Bonus Level** (bonusLevelPct): Number (percentage as whole number) - REQUIRED
  - Example: 108 = 108% return (8% gain)
  - Range: 100 to 200
  - Guaranteed return if barrier never breached during product life
  - Paid at maturity if bonus condition met
- **Bonus Barrier** (bonusBarrierPct): Number (percentage as whole number) - REQUIRED
  - Example: 60 = 60% of initial
  - Range: 0 to 100 (must be < 100)
  - If underlying touches this level at ANY time, bonus is lost
  - Continuous monitoring (not just at maturity)

### Knock-In Feature (Optional - can be combined with bonus)

- **Knock-In Enabled** (knockInEnabled): Boolean
  - Default: `false`
  - Can be enabled for additional downside protection mechanism
- **Knock-In Mode** (knockInMode): String
  - Fixed value: `'EUROPEAN'`
- **Knock-In Level** (knockInLevelPct): Number (percentage) - Required if enabled
  - Example: 70 = 70% of initial
  - Range: 0 to 300
  - Often set same as bonus barrier
- **Downside Strike** (downsideStrikePct): Number (percentage) - OPTIONAL
  - Defaults to knockInLevelPct if not provided
  - Used when knock-in triggers

### Auto-Sync Behavior

- When both bonusEnabled AND knockInEnabled are true:
  - bonusBarrierPct automatically syncs to knockInLevelPct
  - This creates coherent product logic
  - Developer can allow manual override

### Payoff Logic

**If Bonus Barrier NEVER Breached:**

- Investor receives bonusLevelPct return (guaranteed)
- Example: 108% → 8% gain regardless of final level

**If Bonus Barrier IS Breached:**

- Falls back to regular participation payoff
- If knockInEnabled and final < knockInLevelPct:
  - Switches to geared-put formula
- Otherwise:
  - Standard participation payoff applies

### Validation Rules

1. **CRITICAL**: capitalProtectionPct MUST equal 0
2. **CRITICAL**: bonusEnabled MUST be true
3. Notional must be > 0
4. Tenor must be > 0
5. For single basket: exactly 1 underlying required
6. For other baskets: 2-3 underlyings required, all unique tickers
7. Initial fixings array length must match underlyings array length
8. All initial fixings must be > 0
9. participationStartPct must be between 0-300
10. participationRatePct must be between 0-500
11. If capType = 'capped': capLevelPct must be > participationStartPct
12. bonusLevelPct must be between 100-200
13. bonusBarrierPct must be between 0-100 (and < 100)
14. If knockInEnabled: knockInLevelPct required and between 0-300
15. If knockInEnabled: downsideStrikePct must be between 0-300

---

## Implementation Notes for Developer

### Product Type Detection

```typescript
// Regular Income
if (productType === 'RC') {
  // Use Regular Income fields
}

// Capital Protection
if (productType === 'CPPN' && capitalProtectionPct > 0 && !bonusEnabled) {
  // Use Capital Protection fields
}

// Boosted Growth
if (productType === 'CPPN' && capitalProtectionPct === 0 && bonusEnabled) {
  // Use Boosted Growth fields
}
```

### Shared Components

- All three products share:
  - Basic product information section (notional, currency, tenor)
  - Underlying selection section
  - Basket type selection
- Create reusable components for these shared sections

### Product-Specific Sections

- **Regular Income**: Coupon terms, Variant selection, Autocall feature
- **Capital Protection**: Protection level, Participation terms, Knock-in (airbag)
- **Boosted Growth**: Bonus feature (primary), Participation terms, Optional knock-in

### Form Layout Recommendations

#### Regular Income Page

1. Product selector (fixed to Regular Income)
2. Basic terms (notional, currency, tenor)
3. Underlying selection
4. Coupon configuration
5. Variant selector (Standard Barrier vs Low Strike)
6. Barrier/Strike parameters (conditional on variant)
7. Conversion terms
8. Autocall feature (toggle + fields)

#### Capital Protection Page

1. Product selector (fixed to Capital Protection)
2. Basic terms (notional, currency, tenor)
3. Underlying selection with basket type
4. Protection level (capitalProtectionPct)
5. Participation configuration
6. Cap configuration (toggle + level)
7. Knock-in feature (toggle + parameters)
8. Auto-calculation warning for downside strike when P < 100

#### Boosted Growth Page

1. Product selector (fixed to Boosted Growth)
2. Basic terms (notional, currency, tenor)
3. Underlying selection with basket type
4. Participation configuration (typically 100%)
5. Cap configuration (optional)
6. **BONUS FEATURE** (prominent section):
   - Bonus level (guaranteed return)
   - Bonus barrier (continuous monitoring)
7. Optional knock-in (advanced feature)

### Data Type Reference

```typescript
// Underlying object
interface Underlying {
  ticker: string;
  name?: string;
}

// Currency type
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

// Basket types
type BasketType = 'single' | 'worst_of' | 'best_of' | 'average'; // CPPN
type BasketTypeRC = 'single' | 'worst_of'; // RC only

// Participation direction
type ParticipationDirection = 'up' | 'down';

// Cap type
type CapType = 'none' | 'capped';

// Coupon frequency (for Regular Income)
type CouponFrequency = 12 | 4 | 2 | 1; // Monthly, Quarterly, Semi-Annual, Annual

// Variant (for Regular Income)
type ReverseConvertibleVariant = 'standard_barrier_rc' | 'low_strike_geared_put';

// Knock-in mode
type KnockInMode = 'EUROPEAN'; // v1: only European (checked at maturity)
```

### API Integration Points

- **Symbol search**: Use existing SymbolInput component
- **Initial fixings**: Fetch current prices from market data API
- **Reference prices**: Optional historical price lookup
- **Validation**: Import validation functions from `terms.ts` files
- **Payoff calculation**: Import engine functions from respective product folders

### File References

- Regular Income types: `/src/products/reverseConvertible/terms.ts`
- Capital Protection types: `/src/products/capitalProtectedParticipation/terms.ts`
- Common types: `/src/products/common/productTypes.ts`
- Existing form reference: `/src/components/input/ProductInputForm.tsx`

---

## Summary Table

| Field Category               | Regular Income               | Capital Protection       | Boosted Growth              |
| ---------------------------- | ---------------------------- | ------------------------ | --------------------------- |
| **Coupons**            | ✅ Yes (main feature)        | ❌ No                    | ❌ No                       |
| **Capital Protection** | ❌ No                        | ✅ Yes (variable)        | ❌ No (always 0)            |
| **Participation**      | ❌ No                        | ✅ Yes (with leverage)   | ✅ Yes (typically 1:1)      |
| **Bonus Feature**      | ❌ No                        | ❌ No                    | ✅ Yes (required)           |
| **Barrier**            | ✅ Yes (conversion trigger)  | ❌ No                    | ✅ Yes (bonus loss trigger) |
| **Knock-In**           | Partial (geared put variant) | ✅ Yes (optional airbag) | ✅ Yes (optional)           |
| **Autocall**           | ✅ Yes (optional)            | ❌ No                    | ❌ No                       |
| **Basket Types**       | Single, Worst-of             | All 4 types              | All 4 types                 |
| **Risk Level**         | Medium                       | Low                      | High                        |
| **Income Focus**       | High                         | Low                      | Low                         |
| **Growth Focus**       | Low                          | Medium                   | High                        |

---

## Questions for Clarification

Developer should clarify with Product Owner:

1. Should there be navigation between the three product pages or separate entry points?
2. Should form state persist when switching between products?
3. Are there pre-set templates for common configurations?
4. What happens if user tries to enable bonus on Capital Protection product (should be blocked)?
5. Should validation errors be shown inline or in a summary section?
6. Are there maximum/minimum values for notional amounts based on currency?
7. Should the bonus barrier monitoring be visualized (timeline/graph)?

---

**Document Version**: 1.0**Last Updated**: 2026-01-01**Related Files**:

- `/src/products/reverseConvertible/terms.ts`
- `/src/products/capitalProtectedParticipation/terms.ts`
- `/src/components/input/ProductInputForm.tsx`
