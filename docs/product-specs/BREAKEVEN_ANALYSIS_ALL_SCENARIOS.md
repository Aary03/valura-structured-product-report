# Break-Even Analysis - All Structured Product Scenarios

## Product Types & Break-Even Logic

### 1. **Standard CPPN** (100% Capital Protection)
**Configuration:**
- `capitalProtectionPct` = 100
- `bonusEnabled` = false
- `knockInEnabled` = false

**Break-Even:**
- ✅ **Always profitable** (minimum 100% return)
- No break-even needed - you can't lose money
- Display: "You're protected - minimum 100% return"

---

### 2. **CPPN with Partial Protection** (e.g., 90%)
**Configuration:**
- `capitalProtectionPct` = 90
- `participationStartPct` = 100
- `participationRatePct` = 150
- `bonusEnabled` = false
- `knockInEnabled` = false

**Break-Even Formula:**
```
100 = P + a × (X - K)
X = K + (100 - P) / a
X = 100 + (100 - 90) / 1.5 = 106.67%
```

**Display:**
- Breakeven: **106.67%**
- Floor: **90%**
- Message: "Need basket to reach 106.67% to break even"

---

### 3. **CPPN with Cap**
**Configuration:**
- `capitalProtectionPct` = 100
- `participationRatePct` = 120
- `capLevelPct` = 125

**Break-Even:**
- ✅ **Always profitable** (100% protection)
- Cap limits upside to 125%
- Display: "Protected at 100%, capped at 125%"

**If partial protection with cap (P=90, Cap=110):**
```
Check if cap allows reaching 100%:
Max payoff = 110% (cap)
If cap ≥ 100: Break-even possible
If cap < 100: Break-even IMPOSSIBLE
```

---

### 4. **CPPN with Knock-In (Airbag)**
**Configuration:**
- `capitalProtectionPct` = 100
- `knockInEnabled` = true
- `knockInLevelPct` = 70

**Break-Even:**
- ✅ **Always profitable IF barrier not breached** (100% protection)
- ⚠️ **Conditional:** If X < 70% at maturity, switches to geared-put
- Display: "Protected at 100% (unless barrier breached at maturity)"

**Formula if KI breached:**
```
Payoff = 100 × X / S
Break-even: 100 = 100 × X / S  →  X = S
```

---

### 5. **CPPN with Partial Protection + Knock-In** (Most Complex)
**Configuration:**
- `capitalProtectionPct` = 90
- `participationStartPct` = 100
- `participationRatePct` = 150
- `knockInEnabled` = true
- `knockInLevelPct` = 70

**Break-Even:**
- **Above 70%:** Standard break-even = 106.67%
- **Below 70%:** Geared-put break-even = S (downside strike)
- ⚠️ **Two regimes:** Need to explain both

**Display:**
- "If barrier NOT breached: Break-even at **106.67%**"
- "If barrier breached at maturity: Downside participation applies"

---

### 6. **Bonus Certificate** (Bonus Floor ≥ 100%)
**Configuration:**
- `capitalProtectionPct` = 0
- `bonusEnabled` = true
- `bonusLevelPct` = 108
- `bonusBarrierPct` = 60

**Break-Even:**
- ✅ **Always profitable IF barrier NEVER breached** (108% minimum)
- ❌ **Always loss IF barrier breached** (max 60% at barrier)
- **Conditional break-even** - depends on barrier path

**Display:**
- "You're always profitable if barrier not breached (min 108%)"
- "⚠️ Don't let stocks touch 60% during product life"
- "If breached: 1:1 downside tracking (no protection)"

---

### 7. **Bonus Certificate with Low Bonus** (Bonus Floor < 100%)
**Configuration:**
- `capitalProtectionPct` = 0
- `bonusEnabled` = true
- `bonusLevelPct` = 95
- `bonusBarrierPct` = 60
- `participationStartPct` = 100
- `participationRatePct` = 120

**Break-Even:**
- **If barrier not breached:**
  - Below 100%: Get 95% (loss)
  - Above 100%: Participation kicks in
  - Break-even: Where participation reaches 100%
  
```
100 = 100 + 1.2 × (X - 100)
X = 100
```

**Display:**
- "Break-even at **100%** (if barrier not breached)"
- "Below 100%: Get 95% bonus (5% loss)"
- "Above 100%: Get stock gains (120% participation)"

---

### 8. **Bonus Certificate with Cap**
**Configuration:**
- `capitalProtectionPct` = 0
- `bonusEnabled` = true
- `bonusLevelPct` = 108
- `bonusBarrierPct` = 60
- `capLevelPct` = 125

**Break-Even:**
- Same as Bonus Certificate
- Cap limits upside to 125%
- Bonus floor still 108% (always profitable if barrier not breached)

**Display:**
- "Always profitable if barrier not breached (108%-125% range)"

---

### 9. **Downside Participation** (Rare)
**Configuration:**
- `capitalProtectionPct` = 100
- `participationDirection` = 'down'
- `participationStartPct` = 100
- `participationRatePct` = 120

**Break-Even:**
```
Payoff increases as X decreases (inverse)
100 = P + a × (K - X)
100 = 100 + 1.2 × (100 - X)
X = 100
```

**Display:**
- "Break-even at **100%**"
- "Below 100%: Higher returns (downside participation)"
- "Above 100%: Protected at 100%"

---

## Summary Table

| Scenario | Break-Even Type | Investor Message |
|----------|----------------|------------------|
| Standard CPPN (P=100%) | Always Profitable | "Protected - minimum 100% return" |
| Partial Protection (P=90%) | Single Level | "Need X% to break even" |
| CPPN with Cap | Varies | "Protected at X%, capped at Y%" or "Impossible" |
| CPPN with Knock-In (P=100%) | Conditional | "Protected unless barrier breached" |
| Partial + Knock-In | Two Regimes | "Two scenarios depending on barrier" |
| Bonus Cert (BL≥100%) | Conditional | "Always profitable if barrier never touched" |
| Bonus Cert (BL<100%) | Single Level | "Need X% if barrier not breached" |
| Bonus with Cap | Conditional | "Range-bound if barrier not breached" |
| Downside Participation | Inverse | "Profit from declines" |

---

## UI/UX Recommendations

### Visual Hierarchy
1. **Primary Message** - Large, bold (e.g., "Always Profitable")
2. **Conditions** - Secondary text (e.g., "if barrier not breached")
3. **Details** - Tertiary text (e.g., "minimum 108% return")

### Color Coding
- **Green** - Always profitable, protected scenarios
- **Yellow/Amber** - Conditional scenarios (barrier-dependent)
- **Orange** - Single break-even level needed
- **Red** - Impossible or high-risk scenarios

### Icon Usage
- 🎁 **Gift** - Bonus certificate scenarios
- 🛡️ **Shield** - Capital protection
- 🎯 **Target** - Standard break-even level
- ⚠️ **Alert** - Conditional/warning scenarios
- 📈 **Trend** - Participation features

### Card Layouts

#### Layout 1: Always Profitable (Green Gradient)
```
┌────────────────────────────────────┐
│ 🎁 Break-Even Analysis             │
│                                    │
│    Always Profitable! ✓            │
│    Minimum Return: 108%            │
│                                    │
│ ⚠️ Condition: Barrier not breached │
│    Don't let stocks touch 60%      │
└────────────────────────────────────┘
```

#### Layout 2: Single Level (Amber)
```
┌────────────────────────────────────┐
│ 🎯 Break-Even Analysis             │
│                                    │
│    Breakeven Level: 106.67%        │
│    Current Floor: 90%              │
│                                    │
│ ℹ️  Above 106.67%: Profit          │
│    Below 106.67%: Loss (min 90%)   │
└────────────────────────────────────┘
```

#### Layout 3: Conditional/Two Regimes (Multi-card)
```
┌────────────────────────────────────┐
│ 🎯 Break-Even Analysis             │
│                                    │
│ Scenario 1: Barrier Not Breached   │
│    Breakeven: 106.67%              │
│    Floor: 90%                      │
│                                    │
│ Scenario 2: Barrier Breached       │
│    Downside participation applies  │
│    Geared-put formula              │
└────────────────────────────────────┘
```

---

## Implementation Priorities

### Must-Have (Current)
✅ Bonus certificate with bonus floor ≥ 100%
✅ Standard CPPN with full protection
✅ Partial protection with single break-even

### Should-Have (Phase 2)
- [ ] Knock-in conditional messaging
- [ ] Cap validation (impossible scenarios)
- [ ] Two-regime display for partial + knock-in

### Nice-to-Have (Phase 3)
- [ ] Downside participation
- [ ] Bonus with bonus floor < 100%
- [ ] Interactive break-even calculator

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Status:** Analysis Complete - Ready for Implementation
