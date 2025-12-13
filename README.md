# Structured Product Payoff Report Generator

A beautiful, scalable, and modular React-based system for generating professional structured product term sheets. Starting with **Reverse Convertible Payoff** reports.

## 📋 Project Overview

This project generates professional term sheet reports similar to the autocallable example, featuring:
- Beautiful blue/grey/white design system
- Real-time data from Financial Modeling Prep API
- Interactive charts and visualizations
- Scalable architecture for multiple product types
- Ready for Valura platform integration

## 📚 Documentation

### Planning Documents
- **[PLAN.md](./PLAN.md)** - Complete implementation plan with phases, tech stack, and architecture
- **[REVERSE_CONVERTIBLE_SPEC.md](./REVERSE_CONVERTIBLE_SPEC.md)** - Detailed product specification and mechanics
- **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** - Component hierarchy and data flow
- **[DESIGN_REFERENCE.md](./DESIGN_REFERENCE.md)** - Visual design system and styling guidelines
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Step-by-step implementation checklist

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Financial Modeling Prep API key

### Installation
```bash
# Initialize project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install react react-dom recharts axios
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom

# Initialize Tailwind
npx tailwindcss init -p
```

### Environment Setup
Create `.env` file:
```
VITE_FMP_API_KEY=your_api_key_here
```

## 🏗️ Architecture

### Tech Stack
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Charting library
- **Axios** - HTTP client
- **Financial Modeling Prep API** - Market data

### Project Structure
```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── product/        # Product-specific components
│   └── charts/         # Chart components
├── services/           # Business logic
│   ├── api/           # API clients
│   └── calculations/  # Payoff calculations
├── types/             # TypeScript definitions
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── styles/            # Global styles
```

## 📊 Reverse Convertible Product

### Key Features
- **Regular Coupons**: Fixed coupon payments (e.g., quarterly)
- **Barrier Protection**: Conversion trigger at barrier level
- **Maturity Payoff**:
  - Above barrier → Cash redemption (100% principal)
  - Below barrier → Share conversion

### Report Sections
1. **Header** - Product name and key features
2. **Product Details** - Specifications table
3. **Suitability** - Investment match criteria
4. **Underlyings Table** - Real-time market data
5. **Payoff Graph** - Visual payoff at maturity
6. **Performance Graph** - Historical price chart
7. **Scenarios Flowchart** - Decision tree visualization

## 🎨 Design System

### Color Palette
- **Primary Blue**: #1E40AF
- **Secondary Blue**: #3B82F6
- **Grey Scale**: #374151, #6B7280, #9CA3AF
- **Status Colors**: Green (#10B981), Red (#EF4444)

See [DESIGN_REFERENCE.md](./DESIGN_REFERENCE.md) for complete design guidelines.

## 🚀 Implementation Phases

1. **Phase 1**: Foundation Setup (Project, Tailwind, API client)
2. **Phase 2**: Core Components (Layout, Product Details, Tables)
3. **Phase 3**: Charts & Calculations (Payoff graphs, calculations)
4. **Phase 4**: Scenarios & Polish (Flowchart, styling)
5. **Phase 5**: Testing & Integration (Tests, module export)

See [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for detailed tasks.

## 📦 Module Integration

### Export Structure
```typescript
// Main export
export { generateReverseConvertibleReport } from './ReverseConvertibleReport';

// Component exports (for customization)
export { PayoffGraph } from './components/PayoffGraph';
export { UnderlyingsTable } from './components/UnderlyingsTable';

// Type exports
export type { ReverseConvertibleConfig } from './types/product';
```

### Usage Example
```typescript
import { generateReverseConvertibleReport } from '@valura/sp-termsheet';

const config = {
  couponRate: 10,
  barrier: 70,
  underlyings: ['AAPL', 'TSLA'],
  maturityDate: '2026-12-31',
  // ... other config
};

const Report = generateReverseConvertibleReport(config);
```

## 🔌 API Integration

### Financial Modeling Prep Endpoints
- `/v3/quote/{symbol}` - Current stock quote
- `/v3/historical-price-full/{symbol}` - Historical prices
- `/v3/analyst-estimates/{symbol}` - Analyst consensus

## 🧮 Payoff Calculation

### Reverse Convertible Logic
```
IF Final_Level >= Barrier:
    Payoff = Principal × 100% + Final_Coupon
    Type = "Cash"
ELSE:
    Shares = Principal / (Initial_Price × Conversion_Ratio)
    Payoff = Shares × Final_Price
    Type = "Shares"
```

## ✅ Next Steps

1. Review all planning documents
2. Start with Phase 1: Foundation Setup
3. Follow the implementation checklist
4. Test with real API data
5. Polish design to match reference
6. Prepare for Valura integration

## 📝 Notes

- This is a **payoff maker**, not a pricer
- Focus on **visualization and reporting**
- Design should match the reference image closely
- Code should be **scalable and modular**
- Ready for **production use** in Valura platform

---

**Ready to build? Start with [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)!** 🚀


