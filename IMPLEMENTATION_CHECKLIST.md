# Implementation Checklist - Reverse Convertible Payoff Report

## ✅ Phase 1: Foundation Setup

### Project Initialization

- [ ] Initialize Vite + React + TypeScript project
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [ ] Install core dependencies
  ```bash
  npm install react react-dom
  npm install -D @types/react @types/react-dom typescript
  ```
- [ ] Install Tailwind CSS
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Install charting library
  ```bash
  npm install recharts
  ```
- [ ] Install HTTP client
  ```bash
  npm install axios
  ```
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Configure Tailwind with design system colors
- [ ] Set up project folder structure

### Design System Setup

- [ ] Create `tailwind.config.js` with color palette
- [ ] Create `src/styles/theme.css` with CSS variables
- [ ] Create `src/styles/globals.css` with base styles
- [ ] Test color scheme matches reference (blue/grey/white)

### API Client Setup

- [ ] Create `src/services/api/financialModelingPrep.ts`
- [ ] Set up API key configuration (environment variables)
- [ ] Create API client functions:
  - [ ] `getQuote(symbol: string)`
  - [ ] `getHistoricalPrices(symbol: string, period: string)`
  - [ ] `getAnalystEstimates(symbol: string)`
- [ ] Create error handling utilities
- [ ] Create response type definitions

### Type Definitions

- [ ] Create `src/types/product.ts` with `ReverseConvertibleConfig`
- [ ] Create `src/types/report.ts` with report data types
- [ ] Create `src/types/api.ts` with API response types
- [ ] Export all types from index

---

## ✅ Phase 2: Core Components

### Layout Components

- [ ] Create `src/components/common/Header.tsx`
  - [ ] Product title display
  - [ ] Key features badge
  - [ ] Styling matches reference
- [ ] Create `src/components/common/Footer.tsx`
  - [ ] Date display
  - [ ] Document ID
  - [ ] Page number
- [ ] Create `src/components/common/Card.tsx`
  - [ ] Reusable card container
  - [ ] Shadow and border styling

### Product Details Component

- [ ] Create `src/components/product/ReverseConvertible/ProductDetails.tsx`
- [ ] Build specifications table:
  - [ ] Coupon rate
  - [ ] Coupon frequency
  - [ ] Barrier level
  - [ ] Maturity date
  - [ ] Underlying asset(s)
  - [ ] Conversion ratio
  - [ ] Delivery method
- [ ] Display underlying logos/names
- [ ] Match styling from reference

### Suitability Section

- [ ] Create `src/components/product/ReverseConvertible/SuitabilitySection.tsx`
- [ ] Add section title: "Is it your investment match?"
- [ ] Create criteria checklist:
  - [ ] Income-seeking investors
  - [ ] Neutral to moderately bullish
  - [ ] Can tolerate conversion risk
- [ ] Add checkmark icons
- [ ] Style to match reference

### Underlyings Table

- [ ] Create `src/components/product/ReverseConvertible/UnderlyingsTable.tsx`
- [ ] Create table structure with columns:
  - [ ] Underlyings
  - [ ] Initial fixing
  - [ ] Spot
  - [ ] Performance (with ▲/▼ indicators)
  - [ ] Analysts estimates
  - [ ] Analyst consensus
  - [ ] Target price
- [ ] Integrate with API data
- [ ] Add loading state
- [ ] Add error handling
- [ ] Format numbers and percentages
- [ ] Style to match reference

---

## ✅ Phase 3: Charts & Calculations

### Payoff Calculation Service

- [ ] Create `src/services/calculations/reverseConvertible.ts`
- [ ] Implement `calculatePayoff()` function
- [ ] Implement `generatePayoffCurve()` function
- [ ] Implement `calculateIntrinsicValue()` function
- [ ] Add unit tests for calculations
- [ ] Handle edge cases (barrier = 0, barrier = 100, etc.)

### Payoff Graph Component

- [ ] Create `src/components/product/ReverseConvertible/PayoffGraph.tsx`
- [ ] Set up Recharts LineChart
- [ ] Configure axes:
  - [ ] X-axis: Reference value (0% to 150%)
  - [ ] Y-axis: Payoff (0% to 125%)
- [ ] Draw payoff curve (step function)
- [ ] Add barrier line (dashed, grey)
- [ ] Add intrinsic value marker (green circle)
- [ ] Add legend
- [ ] Add description text below graph
- [ ] Style to match reference

### Performance Graph Component

- [ ] Create `src/components/product/ReverseConvertible/PerformanceGraph.tsx`
- [ ] Set up Recharts LineChart with multiple lines
- [ ] Configure axes:
  - [ ] X-axis: Dates
  - [ ] Y-axis: Percentage (normalized)
- [ ] Plot historical data for each underlying
- [ ] Add barrier reference line (horizontal, dashed)
- [ ] Add legend with colors
- [ ] Normalize data to current spot prices
- [ ] Add description text
- [ ] Style to match reference

### Data Processing

- [ ] Create `src/hooks/useProductData.ts`
  - [ ] Fetch underlying data from API
  - [ ] Transform API responses
  - [ ] Handle loading/error states
  - [ ] Cache data appropriately
- [ ] Create `src/hooks/usePayoffCalculation.ts`
  - [ ] Generate payoff curve
  - [ ] Calculate intrinsic value
  - [ ] Memoize calculations

---

## ✅ Phase 4: Scenarios & Polish

### Scenarios Flowchart

- [ ] Create `src/components/product/ReverseConvertible/ScenariosFlowchart.tsx`
- [ ] Design flowchart layout:
  - [ ] "At maturity" header
  - [ ] Decision node: "Is Final Level ≥ Barrier?"
  - [ ] YES branch → Cash Redemption box
  - [ ] NO branch → Share Conversion box
- [ ] Add icons (calendar, checkmark, etc.)
- [ ] Style decision nodes and outcome boxes
- [ ] Match reference design

### Main Report Component

- [ ] Create `src/components/product/ReverseConvertible/ReverseConvertibleReport.tsx`
- [ ] Compose all sections:
  - [ ] Header
  - [ ] Product Details
  - [ ] Suitability Section
  - [ ] Underlyings Table
  - [ ] Payoff Graph
  - [ ] Performance Graph
  - [ ] Scenarios Flowchart
  - [ ] Footer
- [ ] Implement grid layout
- [ ] Add responsive design
- [ ] Ensure single-page layout

### Styling & Polish

- [ ] Review all components against reference
- [ ] Adjust spacing and padding
- [ ] Ensure color consistency
- [ ] Add hover effects where appropriate
- [ ] Optimize for print/PDF
- [ ] Test responsive breakpoints
- [ ] Add loading skeletons
- [ ] Add error boundaries

### Data Formatting

- [ ] Create `src/utils/formatters.ts`:
  - [ ] `formatCurrency(amount, currency)`
  - [ ] `formatPercentage(value)`
  - [ ] `formatDate(date)`
  - [ ] `formatNumber(value, decimals)`
- [ ] Apply formatters throughout components

---

## ✅ Phase 5: Testing & Integration

### Unit Tests

- [ ] Test payoff calculations
- [ ] Test data transformation functions
- [ ] Test formatters
- [ ] Test API client error handling

### Component Tests

- [ ] Test ProductDetails rendering
- [ ] Test UnderlyingsTable with mock data
- [ ] Test PayoffGraph with various scenarios
- [ ] Test error states

### Integration Tests

- [ ] Test full report generation
- [ ] Test with multiple underlyings
- [ ] Test with different barrier levels
- [ ] Test API integration (with mocks)

### Module Export Setup

- [ ] Create `src/index.ts` for exports
- [ ] Export main component
- [ ] Export types
- [ ] Export utilities
- [ ] Create package.json with proper exports
- [ ] Test module import in separate project

### Documentation

- [ ] Create README.md with:
  - [ ] Installation instructions
  - [ ] Usage examples
  - [ ] API configuration
  - [ ] Props documentation
- [ ] Add JSDoc comments to all exports
- [ ] Create example usage file

### Performance Optimization

- [ ] Add React.memo to expensive components
- [ ] Memoize calculations
- [ ] Optimize re-renders
- [ ] Lazy load chart components
- [ ] Test with large datasets

### Final Review

- [ ] Code review and cleanup
- [ ] Remove console.logs
- [ ] Check for TypeScript errors
- [ ] Check for linting errors
- [ ] Test in different browsers
- [ ] Verify accessibility
- [ ] Test print/PDF export

---

## 🎯 Quick Start Commands

```bash
# Initialize project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install react react-dom recharts axios
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom

# Initialize Tailwind
npx tailwindcss init -p

# Start development server
npm run dev

# Build for production
npm run build
```

## 📝 Environment Variables

Create `.env` file:

```
VITE_FMP_API_KEY=your_api_key_here
```

## 🔑 Key Files to Create First

1. `src/types/product.ts` - Type definitions
2. `src/services/api/financialModelingPrep.ts` - API client
3. `src/services/calculations/reverseConvertible.ts` - Payoff logic
4. `src/components/product/ReverseConvertible/ReverseConvertibleReport.tsx` - Main component

---

**Start with Phase 1 and work through systematically!** 🚀
