# Bonus Certificate (Boosted Growth) - Product Specification

## Overview

**Product Code:** `CPPN` with special configuration  
**Product Name Display:** "Boosted Growth"  
**Description:** Participation product with NO capital protection but offers guaranteed bonus return if barrier is never breached. High risk, high reward structure.

**Risk Level:** High  
**Income Focus:** Low  
**Growth Focus:** High

---

## Product Characteristics

This product combines:
- **No capital protection** (100% downside exposure)
- **Guaranteed bonus return** if barrier never breached
- **1:1 participation** in underlying performance
- **Continuous barrier monitoring** (not just at maturity)
- Optional cap on upside
- Optional knock-in feature for additional structure

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
- **Description:** Technical discriminator (shared with Capital Protection)

---

## Underlying Assets

### Basket Type
- **Field Name:** `basketType`
- **Type:** String
- **Options:**
  - `'single'` - Single underlying asset
  - `'worst_of'` - Worst performer of 2-3 underlyings
  - `'best_of'` - Best performer of 2-3 underlyings
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

## Capital Protection (CRITICAL - MUST BE ZERO)

### Capital Protection Percentage
- **Field Name:** `capitalProtectionPct`
- **Type:** Number
- **FIXED VALUE:** `0`
- **Description:** Bonus Certificate has NO capital protection
- **Validation:** MUST equal 0 (this distinguishes it from Capital Protection product)

---

## Participation Parameters

### Participation Direction
- **Field Name:** `participationDirection`
- **Type:** String
- **Options:** `'up'`, `'down'`
- **Typical Value:** `'up'` (for bonus certificates)
- **Description:**
  - `'up'` = participate in upside moves
  - `'down'` = participate in downside moves (rare)

### Participation Start Level
- **Field Name:** `participationStartPct`
- **Type:** Number (percentage as whole number)
- **Example:** 100 = participation starts at 100% of initial
- **Range:** 0 to 300
- **Typical Value:** 100 (at-the-money)
- **Description:** Strike level where participation begins

### Participation Rate
- **Field Name:** `participationRatePct`
- **Type:** Number (percentage as whole number)
- **Example:** 100 = 100% participation (1:1)
- **Range:** 0 to 500
- **Typical Value:** 100 (1:1 participation)
- **Description:** Multiplier for performance beyond participation start

---

## Cap Feature (Optional)

### Cap Type
- **Field Name:** `capType`
- **Type:** String
- **Options:**
  - `'none'` - Unlimited upside
  - `'capped'` - Maximum return is limited
- **Default:** Can be either

### Cap Level (Required if Capped)
- **Field Name:** `capLevelPct`
- **Type:** Number (percentage as whole number)
- **Example:** 140 = maximum 140% return
- **Range:** Must be > participationStartPct
- **Required:** Only when capType = 'capped'

---

## Bonus Feature (REQUIRED - DEFINING FEATURE)

### Bonus Enabled
- **Field Name:** `bonusEnabled`
- **Type:** Boolean
- **FIXED VALUE:** `true`
- **Description:** MUST BE TRUE for Boosted Growth product - this is the defining feature

### Bonus Level
- **Field Name:** `bonusLevelPct`
- **Type:** Number (percentage as whole number)
- **Example:** 108 = 108% return (8% gain)
- **Range:** 100 to 200
- **Required:** Yes (when bonusEnabled = true)
- **Description:** Guaranteed return if barrier never breached during product life, paid at maturity

### Bonus Barrier
- **Field Name:** `bonusBarrierPct`
- **Type:** Number (percentage as whole number)
- **Example:** 60 = 60% of initial
- **Range:** 0 to 100 (must be < 100)
- **Required:** Yes (when bonusEnabled = true)
- **Description:** If underlying touches this level at ANY time, bonus is lost
- **Monitoring:** Continuous (not just at maturity)

---

## Knock-In Feature (Optional - Advanced)

Can be combined with bonus for additional downside protection mechanism.

### Knock-In Enabled
- **Field Name:** `knockInEnabled`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Adds European knock-in barrier

### Knock-In Mode
- **Field Name:** `knockInMode`
- **Type:** String
- **Fixed Value:** `'EUROPEAN'`
- **Description:** Checked only at maturity (not continuous)

### Knock-In Level
- **Field Name:** `knockInLevelPct`
- **Type:** Number (percentage as whole number)
- **Example:** 70 = 70% of initial
- **Range:** 0 to 300
- **Required:** Yes (if knockInEnabled = true)
- **Description:** If final level < KI, switches to geared-put payoff
- **Note:** Often set same as bonus barrier

### Downside Strike
- **Field Name:** `downsideStrikePct`
- **Type:** Number (percentage as whole number)
- **Example:** 70 = 70% of initial
- **Range:** 0 to 300
- **Required:** Optional
- **Default:** Defaults to knockInLevelPct if not provided
- **Description:** Used in geared-put formula when knock-in triggers

---

## Auto-Sync Behavior

When both `bonusEnabled` AND `knockInEnabled` are true:
- `bonusBarrierPct` automatically syncs to `knockInLevelPct`
- This creates coherent product logic
- Developer can allow manual override if needed

---

## Payoff Logic

### Scenario 1: Bonus Barrier NEVER Breached
- Investor receives `bonusLevelPct` return (guaranteed)
- Example: 108% → 8% gain regardless of final level
- This is the "best case" scenario

### Scenario 2: Bonus Barrier IS Breached

Falls back to regular participation payoff:

**If knockInEnabled AND final < knockInLevelPct:**
- Switches to geared-put formula
- Payoff = notional × (finalLevel / downsideStrikePct)

**Otherwise:**
- Standard participation payoff applies
- Payoff = notional × [participationStartPct + participationRate × (finalLevel - participationStartPct)]
- Subject to cap if capType = 'capped'

---

## Validation Rules

### Critical Rules
1. **CRITICAL:** `capitalProtectionPct` MUST equal 0
2. **CRITICAL:** `bonusEnabled` MUST be true
3. **CRITICAL:** `bonusLevelPct` MUST be between 100-200
4. **CRITICAL:** `bonusBarrierPct` MUST be between 0-100 (and < 100)

### Basic Validation
5. `notional` must be > 0
6. `tenorMonths` must be > 0
7. For single basket: exactly 1 underlying required
8. For other baskets: 2-3 underlyings required, all unique tickers
9. `initialFixings` array length must match underlyings array length
10. All initial fixings must be > 0

### Participation Validation
11. `participationStartPct` must be between 0-300
12. `participationRatePct` must be between 0-500
13. If `capType` = 'capped': `capLevelPct` must be > participationStartPct

### Knock-In Validation (if enabled)
14. If `knockInEnabled`: `knockInLevelPct` required and between 0-300
15. If `knockInEnabled`: `downsideStrikePct` must be between 0-300

---

## TypeScript Types

```typescript
// Bonus Certificate Terms
interface BonusCertificateTerms {
  // Basic Info
  productType: 'CPPN';
  notional: number;
  currency: Currency;
  tenorMonths: number;
  
  // Underlyings
  basketType: BasketType;
  underlyings: Underlying[];
  initialFixings?: number[];
  
  // Capital Protection (MUST BE ZERO)
  capitalProtectionPct: 0;
  
  // Participation
  participationDirection: ParticipationDirection;
  participationStartPct: number;
  participationRatePct: number;
  
  // Cap (optional)
  capType: CapType;
  capLevelPct?: number;
  
  // Bonus Feature (REQUIRED)
  bonusEnabled: true;
  bonusLevelPct: number;
  bonusBarrierPct: number;
  
  // Knock-In (optional)
  knockInEnabled?: boolean;
  knockInMode?: 'EUROPEAN';
  knockInLevelPct?: number;
  downsideStrikePct?: number;
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
   - Fixed to "Boosted Growth"
   - Display risk warning

2. **Basic Terms**
   - Notional amount input
   - Currency dropdown
   - Tenor (months) input

3. **Underlying Selection**
   - Basket type selector
   - Symbol search/input (1-3 underlyings based on basket type)
   - Initial fixings (auto-fetched or manual override)

4. **Participation Configuration**
   - Direction selector (typically 'up')
   - Start level (typically 100)
   - Participation rate (typically 100 for 1:1)

5. **Cap Configuration** (Optional Section)
   - Toggle: Capped / Uncapped
   - If capped: Cap level input

6. **BONUS FEATURE** (Prominent Section - Hero Feature)
   - Bonus level input (guaranteed return)
   - Bonus barrier input (continuous monitoring)
   - Visual indicator showing barrier monitoring is continuous
   - Warning: "If barrier breached, bonus is lost"

7. **Knock-In Feature** (Advanced/Optional Section - Collapsed by default)
   - Toggle: Enable/Disable
   - If enabled:
     - Knock-in level
     - Downside strike (optional)
     - Auto-sync option with bonus barrier

### UI/UX Recommendations

- **Highlight Bonus Section:** Use prominent styling (larger card, different color)
- **Risk Warning:** Display clear warning about no capital protection
- **Barrier Visualization:** Show continuous monitoring timeline/graph
- **Auto-Sync Indicator:** Show when bonus barrier and knock-in level sync
- **Validation Feedback:** Real-time validation with clear error messages
- **Preset Templates:** Offer common configurations (e.g., "60% Barrier, 8% Bonus")

---

## API Integration Points

### Symbol Search
- Use existing `SymbolInput` component
- Allow multiple selections based on basket type

### Initial Fixings
- Fetch current prices from market data API
- Allow manual override if needed

### Validation
- Import validation from `/src/products/capitalProtectedParticipation/terms.ts`
- Add bonus-specific validation (capitalProtectionPct === 0, bonusEnabled === true)

### Payoff Calculation
- Import engine from `/src/products/capitalProtectedParticipation/engine.ts`
- Bonus feature is already implemented in the CPPN engine

---

## Related Files

- **Product Engine:** `/src/products/capitalProtectedParticipation/engine.ts`
- **Type Definitions:** `/src/products/capitalProtectedParticipation/terms.ts`
- **Common Types:** `/src/products/common/productTypes.ts`
- **Existing Form:** `/src/components/input/ProductInputForm.tsx` (reference)

---

## Example Configuration

```typescript
const typicalBonusCertificate: BonusCertificateTerms = {
  // Basic
  productType: 'CPPN',
  notional: 100000,
  currency: 'USD',
  tenorMonths: 12,
  
  // Underlying
  basketType: 'single',
  underlyings: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
  initialFixings: [150.00],
  
  // NO Protection
  capitalProtectionPct: 0,
  
  // 1:1 Participation
  participationDirection: 'up',
  participationStartPct: 100,
  participationRatePct: 100,
  
  // No Cap
  capType: 'none',
  
  // Bonus Feature (8% bonus if barrier not breached)
  bonusEnabled: true,
  bonusLevelPct: 108,
  bonusBarrierPct: 60,
  
  // No Knock-In
  knockInEnabled: false,
};
```

---

## Product Differentiation

This product is distinguished from Capital Protection by:
1. `capitalProtectionPct` = 0 (no protection)
2. `bonusEnabled` = true (has bonus feature)
3. Continuous barrier monitoring (bonus barrier)
4. Higher risk/reward profile

---

**Document Version:** 1.0  
**Last Updated:** January 6, 2026  
**Status:** Standalone Module - Ready for Implementation



