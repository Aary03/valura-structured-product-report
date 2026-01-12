# Structured Product Payoff Report Generator - Implementation Plan

## 🎯 Project Overview
Build a scalable, modular structured product payoff report generator that creates beautiful, professional term sheets similar to the autocallable example. Starting with **Reverse Convertible Payoff** as the first product type.

## 🏗️ Architecture & Tech Stack

### Recommended Stack:
- **Frontend Framework**: React + TypeScript (for modularity and scalability)
- **Styling**: Tailwind CSS + CSS Modules (for the blue/grey/white design system)
- **Charts/Graphs**: Recharts or Chart.js (for payoff and performance graphs)
- **Data Fetching**: Axios (for Financial Modeling Prep API)
- **Build Tool**: Vite (fast, modern build tool)
- **State Management**: React Context API or Zustand (lightweight, scalable)

### Project Structure:
```
valura-sp-termsheet/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Card.tsx
│   │   ├── product/           # Product-specific components
│   │   │   ├── ReverseConvertible/
│   │   │   │   ├── ReverseConvertibleReport.tsx
│   │   │   │   ├── ProductDetails.tsx
│   │   │   │   ├── SuitabilitySection.tsx
│   │   │   │   ├── UnderlyingsTable.tsx
│   │   │   │   ├── PayoffGraph.tsx
│   │   │   │   ├── PerformanceGraph.tsx
│   │   │   │   └── ScenariosFlowchart.tsx
│   │   │   └── Autocallable/  # Future product types
│   │   └── charts/            # Chart components
│   │       ├── PayoffChart.tsx
│   │       └── PerformanceChart.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── financialModelingPrep.ts  # API client
│   │   │   └── types.ts                   # API response types
│   │   └── calculations/
│   │       ├── reverseConvertible.ts     # Payoff calculations
│   │       └── utils.ts                  # Helper functions
│   ├── types/
│   │   ├── product.ts                    # Product type definitions
│   │   └── report.ts                      # Report data types
│   ├── hooks/
│   │   ├── useProductData.ts             # Data fetching hook
│   │   └── usePayoffCalculation.ts       # Calculation hook
│   ├── styles/
│   │   ├── globals.css                    # Global styles
│   │   └── theme.css                      # Color scheme (blue/grey/white)
│   ├── utils/
│   │   ├── formatters.ts                 # Number/date formatters
│   │   └── validators.ts                 # Input validation
│   └── App.tsx
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 📊 Reverse Convertible Payoff - Key Features

### Product Mechanics:
- **Coupon Payments**: Regular fixed coupon payments (e.g., quarterly)
- **Maturity Payoff**:
  - If underlying ≥ barrier: Return 100% principal + final coupon
  - If underlying < barrier: Convert to shares (worst-of or single underlying)
- **Key Parameters**:
  - Principal amount
  - Coupon rate (%)
  - Coupon frequency
  - Barrier level (%)
  - Underlying asset(s)
  - Maturity date
  - Conversion ratio

### Report Sections (Similar to Autocallable):

1. **Header Section**
   - Product name: "Reverse Convertible [Coupon Rate]%"
   - Key features badge (Duration, Currency, Barrier, etc.)

2. **Product Details Card**
   - Specifications table:
     - Coupon rate
     - Coupon frequency
     - Barrier level
     - Maturity date
     - Underlying asset(s)
     - Conversion ratio
     - Delivery method (Cash/Shares)

3. **Suitability Section**
   - "Is it your investment match?"
   - Criteria checklist:
     - Income-seeking investors
     - Neutral to moderately bullish on underlying
     - Can tolerate conversion risk

4. **Underlyings Table**
   - Columns: Asset, Initial Fixing, Current Spot, Performance, Analyst Consensus, Target Price
   - Data from Financial Modeling Prep API

5. **Payoff at Maturity Graph**
   - X-axis: Final underlying level (%)
   - Y-axis: Payoff (%)
   - Shows:
     - Barrier line (dashed)
     - Payoff curve (step function at barrier)
     - Current intrinsic value (green circle)

6. **Underlying Performance Graph**
   - Historical price chart (normalized)
   - Multiple underlyings (if applicable)
   - Barrier reference line

7. **Scenarios Flowchart**
   - At maturity decision tree:
     - Above barrier → Cash redemption
     - Below barrier → Share conversion

## 🎨 Design System

### Color Palette (Blue/Grey/White):
```css
Primary Blue: #1E40AF (or similar)
Secondary Blue: #3B82F6
Light Blue: #DBEAFE
Grey: #6B7280, #9CA3AF
Dark Grey: #374151
White: #FFFFFF
Background: #F9FAFB
Green (positive): #10B981
Red (negative): #EF4444
```

### Typography:
- Headers: Bold, larger font sizes
- Body: Clean, readable sans-serif
- Numbers: Monospace for tables

### Layout:
- Single page layout (printable)
- Grid-based responsive design
- Professional spacing and padding
- Card-based sections with subtle shadows

## 🔌 Financial Modeling Prep API Integration

### Required Endpoints:
1. **Stock Quote**: Get current price
   - `/v3/quote/{symbol}`
   
2. **Historical Prices**: For performance chart
   - `/v3/historical-price-full/{symbol}`
   
3. **Analyst Estimates**: For consensus data
   - `/v3/analyst-estimates/{symbol}`

### Data Mapping:
- Map API responses to our product types
- Handle errors gracefully
- Cache data appropriately
- Support multiple underlyings

## 🧮 Payoff Calculation Logic

### Reverse Convertible Payoff Function:
```typescript
function calculateReverseConvertiblePayoff(
  finalLevel: number,      // Final underlying level (%)
  initialLevel: number,    // Initial fixing
  barrier: number,         // Barrier level (%)
  principal: number,       // Investment amount
  couponRate: number,      // Annual coupon rate
  conversionRatio: number  // Shares per unit
): {
  payoff: number;
  type: 'cash' | 'shares';
  shares?: number;
  cash?: number;
}
```

### Graph Data Generation:
- Generate payoff curve points (0% to 150% of initial)
- Calculate intrinsic value at current spot
- Generate historical performance data

## 📦 Module Integration (Valura Platform)

### Export Strategy:
- Main export: `generateReport(productConfig)`
- Component exports for custom layouts
- Type definitions for TypeScript support
- CSS bundle for styling

### Configuration Interface:
```typescript
interface ReverseConvertibleConfig {
  productName: string;
  couponRate: number;
  couponFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  barrier: number; // as percentage
  maturityDate: string; // ISO date
  underlyings: string[]; // Stock symbols
  principal: number;
  currency: string;
  conversionRatio: number;
  delivery: 'cash' | 'shares' | 'both';
}
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Set up React + TypeScript + Vite project
- [ ] Configure Tailwind CSS with design system
- [ ] Create base layout components (Header, Footer, Card)
- [ ] Set up Financial Modeling Prep API client
- [ ] Create type definitions

### Phase 2: Core Components (Days 3-4)
- [ ] Product Details component
- [ ] Suitability Section component
- [ ] Underlyings Table component (with API integration)
- [ ] Basic styling and layout

### Phase 3: Charts & Calculations (Days 5-6)
- [ ] Payoff calculation logic
- [ ] Payoff at Maturity graph component
- [ ] Underlying Performance graph component
- [ ] Historical data fetching and processing

### Phase 4: Scenarios & Polish (Days 7-8)
- [ ] Scenarios Flowchart component
- [ ] Data validation and error handling
- [ ] Responsive design refinement
- [ ] Print/PDF styling

### Phase 5: Testing & Integration (Days 9-10)
- [ ] Unit tests for calculations
- [ ] Component testing
- [ ] API error handling
- [ ] Module export setup for Valura integration
- [ ] Documentation

## 🔧 Technical Considerations

### Performance:
- Lazy load chart components
- Memoize calculations
- Optimize API calls (batch requests)
- Virtual scrolling for large datasets

### Scalability:
- Abstract product types (interface-based)
- Plugin architecture for new product types
- Configurable themes
- Internationalization ready

### Error Handling:
- API failure fallbacks
- Invalid input validation
- Graceful degradation
- User-friendly error messages

### Accessibility:
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

## 📝 Next Steps

1. **Initialize Project**: Set up Vite + React + TypeScript
2. **Design System**: Create Tailwind config with color palette
3. **API Setup**: Configure Financial Modeling Prep API client
4. **First Component**: Build Product Details section
5. **Iterate**: Build remaining components one by one

## 🎯 Success Criteria

- ✅ Beautiful, professional design matching reference
- ✅ Accurate payoff calculations
- ✅ Real-time data from Financial Modeling Prep API
- ✅ Fully responsive and printable
- ✅ Clean, maintainable, scalable code
- ✅ Ready for Valura platform integration
- ✅ Type-safe with TypeScript

---

**Ready to start?** Let's begin with Phase 1: Foundation setup!


