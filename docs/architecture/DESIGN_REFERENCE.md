# Design Reference Guide

## Layout Structure (Based on Reference Image)

### Page Layout (Single Page, 3-Column Grid)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header: Product Name Badge]                    [Autocallable] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐  ┌────────────────────────────────┐ │
│  │ Product Details      │  │ Is it your investment match?   │ │
│  │ - Key Features       │  │ - Criteria checklist           │ │
│  │ - Specifications     │  │                                │ │
│  │ - Underlying Logos   │  │                                │ │
│  └──────────────────────┘  └────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────┐  ┌────────────────────────────────┐ │
│  │ [Video Placeholder]  │  │ More about the underlyings    │ │
│  │                      │  │ - Performance Table            │ │
│  │                      │  │ - Analyst Data                 │ │
│  └──────────────────────┘  └────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────┐  ┌────────────────────────────────┐ │
│  │ Payoff at Maturity   │  │ Underlying Performance         │ │
│  │ [Line Chart]         │  │ [Multi-line Chart]             │ │
│  └──────────────────────┘  └────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Understand the Scenarios                                  │ │
│  │ [Flowchart with decision tree]                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Footer: Date, Document ID, Page Number]                      │
└─────────────────────────────────────────────────────────────────┘
```

## Color Palette

### Primary Colors
```css
/* Blue Shades */
--blue-primary: #1E40AF;      /* Main blue (header badge) */
--blue-secondary: #3B82F6;    /* Secondary blue */
--blue-light: #DBEAFE;        /* Light blue background */
--blue-accent: #2563EB;       /* Accent blue */

/* Grey Shades */
--grey-dark: #374151;         /* Dark grey text */
--grey-medium: #6B7280;       /* Medium grey */
--grey-light: #9CA3AF;        /* Light grey */
--grey-border: #E5E7EB;       /* Border grey */
--grey-background: #F9FAFB;   /* Page background */

/* Status Colors */
--green-positive: #10B981;    /* Positive performance ▲ */
--red-negative: #EF4444;      /* Negative performance ▼ */
--white: #FFFFFF;             /* White backgrounds */
```

### Usage Guidelines
- **Header Badge**: Blue primary background, white text
- **Section Backgrounds**: White with subtle shadow
- **Text**: Dark grey for headings, medium grey for body
- **Borders**: Light grey
- **Charts**: Blue for main data, grey for reference lines
- **Performance Indicators**: Green for positive, red for negative

## Typography

### Font Sizes
```css
/* Headers */
--text-4xl: 2.25rem;    /* Main product title */
--text-3xl: 1.875rem;   /* Section headers */
--text-2xl: 1.5rem;     /* Subsection headers */
--text-xl: 1.25rem;     /* Card titles */
--text-lg: 1.125rem;    /* Emphasized text */
--text-base: 1rem;      /* Body text */
--text-sm: 0.875rem;    /* Small text, captions */
--text-xs: 0.75rem;     /* Very small text */
```

### Font Weights
- **Bold (700)**: Headers, important numbers
- **Semibold (600)**: Subheaders, labels
- **Regular (400)**: Body text
- **Light (300)**: Secondary text

## Component Styling

### Header Badge
```css
.header-badge {
  background: var(--blue-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 700;
  font-size: 1.5rem;
}
```

### Card/Section Container
```css
.section-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--grey-border);
}
```

### Table Styling
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--grey-background);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--grey-dark);
  border-bottom: 2px solid var(--grey-border);
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--grey-border);
  color: var(--grey-dark);
}
```

### Performance Indicator
```css
.performance-positive {
  color: var(--green-positive);
}

.performance-negative {
  color: var(--red-negative);
}

.performance-indicator::before {
  content: "▲"; /* or "▼" */
  margin-right: 0.25rem;
}
```

## Chart Styling

### Payoff Chart
- **Main Line**: Blue (#3B82F6), stroke width 2
- **Barrier Line**: Grey dashed (#9CA3AF), stroke width 1
- **Intrinsic Value Marker**: Green circle (#10B981), radius 6
- **Grid Lines**: Light grey (#E5E7EB)
- **Axis Labels**: Medium grey (#6B7280), font size 0.875rem

### Performance Chart
- **Line Colors**: 
  - Underlying 1: Green (#10B981)
  - Underlying 2: Red (#EF4444)
  - Underlying 3: Yellow/Orange (#F59E0B)
  - Underlying 4: Blue (#3B82F6)
- **Barrier Line**: Grey dashed (#9CA3AF)
- **Line Width**: 2px
- **Point Radius**: 3px (on hover)

## Spacing System

```css
/* Padding */
--p-xs: 0.5rem;    /* 8px */
--p-sm: 0.75rem;   /* 12px */
--p-md: 1rem;      /* 16px */
--p-lg: 1.5rem;    /* 24px */
--p-xl: 2rem;      /* 32px */

/* Margin */
--m-xs: 0.5rem;
--m-sm: 0.75rem;
--m-md: 1rem;
--m-lg: 1.5rem;
--m-xl: 2rem;
--m-2xl: 3rem;

/* Gap (for grid/flex) */
--gap-sm: 1rem;
--gap-md: 1.5rem;
--gap-lg: 2rem;
```

## Grid Layout

### Main Container
```css
.main-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Full-width sections */
.full-width {
  grid-column: 1 / -1;
}
```

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .main-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Flowchart Styling

### Decision Node
```css
.decision-node {
  background: var(--blue-light);
  border: 2px solid var(--blue-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: var(--blue-primary);
}
```

### Outcome Box
```css
.outcome-box-positive {
  background: #D1FAE5;  /* Light green */
  border: 2px solid var(--green-positive);
  border-radius: 0.5rem;
  padding: 1rem;
}

.outcome-box-negative {
  background: #FEE2E2;  /* Light red */
  border: 2px solid var(--red-negative);
  border-radius: 0.5rem;
  padding: 1rem;
}
```

## Icons & Symbols

- **Calendar Icon**: For observation dates
- **Checkmark**: For suitability criteria
- **Arrow Up (▲)**: Positive performance
- **Arrow Down (▼)**: Negative performance
- **Play Button**: For video placeholder

## Print/PDF Styling

```css
@media print {
  .main-container {
    page-break-inside: avoid;
  }
  
  .section-card {
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .no-print {
    display: none;
  }
}
```

## Accessibility

### Color Contrast
- Text on white: Minimum 4.5:1 ratio
- Text on blue: White text for readability
- Interactive elements: Clear focus states

### ARIA Labels
```tsx
<button aria-label="Play product explanation video">
  <PlayIcon />
</button>

<table aria-label="Underlying assets performance data">
  {/* table content */}
</table>
```

## Animation & Interactions

### Hover Effects
```css
.section-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.data-table tr:hover {
  background: var(--grey-background);
}
```

### Loading States
- Skeleton loaders for tables
- Spinner for charts
- Shimmer effect for data cards

---

**Use this as a reference when implementing each component to ensure visual consistency!**


