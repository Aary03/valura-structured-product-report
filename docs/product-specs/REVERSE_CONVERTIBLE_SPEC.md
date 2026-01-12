# Reverse Convertible Payoff - Product Specification

## Product Overview

A Reverse Convertible is a structured product that pays regular coupons but converts to shares of the underlying asset if the asset price falls below a barrier at maturity.

## Key Mechanics

### Coupon Payments

- **Frequency**: Typically quarterly, semi-annual, or annual
- **Rate**: Fixed percentage of principal (e.g., 8-12% annually)
- **Payment**: Cash payment on coupon dates
- **Condition**: Usually unconditional (always paid)

### Maturity Payoff

#### Scenario 1: Above Barrier (Cash Redemption)

- **Condition**: Final underlying level ≥ Barrier level
- **Payoff**:
  - Return 100% of principal in cash
  - Plus final coupon payment (if applicable)

#### Scenario 2: Below Barrier (Share Conversion)

- **Condition**: Final underlying level < Barrier level
- **Payoff**:
  - Convert to shares of underlying asset
  - Number of shares = Principal / (Initial Price × Conversion Ratio)
  - Or: Principal / Final Price (depending on structure)
  - No cash redemption

### Key Parameters

| Parameter                  | Description               | Example        |
| -------------------------- | ------------------------- | -------------- |
| **Principal**        | Initial investment amount | $100,000       |
| **Coupon Rate**      | Annual coupon percentage  | 10%            |
| **Coupon Frequency** | Payment frequency         | Quarterly      |
| **Barrier**          | Conversion trigger level  | 70% of initial |
| **Maturity**         | Product expiration        | 12 months      |
| **Underlying**       | Reference asset(s)        | AAPL, TSLA     |
| **Conversion Ratio** | Shares per unit           | 1.0            |
| **Currency**         | Denomination              | USD            |

## Payoff Formula

### At Maturity:

```
IF Final_Level >= Barrier:
    Payoff = Principal × 100% + Final_Coupon
    Type = "Cash"
  
ELSE:
    Shares = Principal / (Initial_Price × Conversion_Ratio)
    Payoff = Shares × Final_Price
    Type = "Shares"
```

### Payoff Graph Characteristics:

- **Step function** at barrier level
- **Above barrier**: Flat line at 100% (cash redemption)
- **Below barrier**: Linear decline (share value decreases with price)
- **Barrier point**: Discontinuity in payoff curve

## Example Calculation

### Inputs:

- Principal: $100,000
- Coupon Rate: 10% p.a.
- Barrier: 70% of initial
- Initial Price: $100
- Final Price: $60 (40% decline)
- Conversion Ratio: 1.0

### Result:

- Final Level = $60 / $100 = 60%
- Since 60% < 70% (barrier): **CONVERSION**
- Shares = $100,000 / ($100 × 1.0) = 1,000 shares
- Share Value = 1,000 × $60 = $60,000
- **Loss**: $40,000 (40% of principal)

### If Final Price = $80:

- Final Level = $80 / $100 = 80%
- Since 80% ≥ 70% (barrier): **CASH REDEMPTION**
- Payoff = $100,000 + Final Coupon
- **Return**: Principal + coupons

## Risk Profile

### Investor Risks:

1. **Conversion Risk**: If underlying falls below barrier, investor receives shares worth less than principal
2. **Market Risk**: No capital protection below barrier
3. **Liquidity Risk**: Product is typically not tradeable
4. **Credit Risk**: Issuer default risk

### Investor Benefits:

1. **High Coupon**: Above-market coupon payments
2. **Capital Protection**: Above barrier (if structure includes it)
3. **Potential Upside**: If converted and underlying recovers

## Suitability Criteria

✅ **Suitable for investors who:**

- Seek regular income above market rates
- Are neutral to moderately bullish on underlying
- Can tolerate conversion risk
- Understand share conversion mechanics
- Have medium risk tolerance

❌ **Not suitable for investors who:**

- Require full capital protection
- Are bearish on underlying
- Cannot tolerate share conversion
- Need liquidity before maturity
- Have low risk tolerance

## Comparison with Autocallable

| Feature                    | Reverse Convertible | Autocallable           |
| -------------------------- | ------------------- | ---------------------- |
| **Coupon**           | Fixed, regular      | Conditional on barrier |
| **Early Redemption** | No                  | Yes (autocall)         |
| **Maturity Payoff**  | Cash or shares      | Cash only              |
| **Barrier**          | Conversion trigger  | Protection level       |
| **Risk**             | Conversion risk     | Reinvestment risk      |
| **Upside**           | Limited (shares)    | Limited (fixed)        |

## Data Requirements for Report

### From Financial Modeling Prep API:

1. **Current Quote**: Spot price, market cap, volume
2. **Historical Prices**: For performance chart (1-2 years)
3. **Analyst Estimates**: Consensus rating, target price
4. **Company Profile**: Name, sector, industry

### Calculated Fields:

1. **Performance**: (Spot - Initial) / Initial × 100
2. **Distance to Barrier**: (Spot - Barrier) / Initial × 100
3. **Intrinsic Value**: Current payoff if matured today
4. **Breakeven**: Price level for 100% return

## Report Visualization Requirements

### Payoff Graph:

- X-axis: Final underlying level (0% to 150%)
- Y-axis: Payoff percentage (0% to 120%)
- Barrier line: Vertical dashed line at barrier %
- Payoff curve: Step function with discontinuity
- Current value: Green circle showing intrinsic value

### Performance Graph:

- X-axis: Time (historical dates)
- Y-axis: Price normalized to current spot (80% to 120%)
- Multiple lines: One per underlying
- Barrier reference: Horizontal dashed line
- Strike reference: Optional horizontal line

### Scenarios Flowchart:

```
At Maturity
    │
    ├─ Is Final Level ≥ Barrier?
    │   │
    │   ├─ YES → Cash Redemption
    │   │         Return: 100% Principal + Final Coupon
    │   │
    │   └─ NO → Share Conversion
    │            Return: Shares × Final Price
    │            (May result in loss)
```

---

This specification will guide the implementation of the Reverse Convertible payoff calculator and report generator.
