/**
 * EXAMPLE: How to Use Standalone Position Card in Valura
 * 
 * This shows exactly how to integrate the modular card into your existing lifecycle page
 */

import React from 'react';
import { StandalonePositionCard } from './src/components/modular/StandalonePositionCard';

// ============================================================================
// EXAMPLE 1: Basic Integration
// ============================================================================

export function ValuraLifecyclePage_Example1() {
  // Your existing Valura data
  const investmentData = {
    id: 'valura_position_12345',
    productTerms: {
      productType: 'RC',
      notional: 100000,
      currency: 'USD',
      basketType: 'worst_of',
      underlyings: [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'MSFT', name: 'Microsoft Corp.' },
      ],
      initialFixings: [150, 300], // Prices when trade was made
      tenorMonths: 12,
      couponRatePA: 0.10,
      couponFreqPerYear: 4,
      couponType: 'guaranteed',
      conversionRatio: 1.0,
      variant: 'standard_barrier_rc',
      barrierPct: 0.70,
    },
    inceptionDate: '2026-01-01',
    maturityDate: '2027-01-01',
    notional: 100000,
    initialFixings: [150, 300],
    couponHistory: [
      { date: '2026-04-01', amount: 2500, paid: true, description: 'Q1 Coupon' },
      { date: '2026-07-01', amount: 2500, paid: true, description: 'Q2 Coupon' },
      { date: '2026-10-01', amount: 2500, paid: false, description: 'Q3 Coupon' },
      { date: '2027-01-01', amount: 2500, paid: false, description: 'Q4 Coupon' },
    ],
    daysElapsed: 180,
    daysRemaining: 185,
    createdAt: '2026-01-01',
    updatedAt: '2026-07-12',
  };

  // Current live market prices
  const currentPrices = [165, 285]; // AAPL: $165, MSFT: $285

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Your Investment Lifecycle</h1>

      {/* Your existing Valura UI components */}
      <div className="mb-8">
        {/* ... your existing timeline, documents, etc ... */}
      </div>

      {/* DROP IN THE MODULAR CARD */}
      <StandalonePositionCard
        position={investmentData}
        marketPrices={currentPrices}
        showAI={true}
      />

      {/* Rest of your page */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: CPPN with Knock-In (Your FI/MSTR Case)
// ============================================================================

export function ValuraLifecyclePage_FI_MSTR_Example() {
  const position = {
    id: 'cppn_fi_mstr',
    productTerms: {
      productType: 'CPPN',
      notional: 100000,
      currency: 'USD',
      tenorMonths: 12,
      underlyings: [
        { ticker: 'FI', name: 'Fiserv Inc.' },
        { ticker: 'MSTR', name: 'MicroStrategy Inc.' },
      ],
      initialFixings: [70, 400], // Example initial prices
      basketType: 'worst_of',
      capitalProtectionPct: 100,
      participationDirection: 'up',
      participationStartPct: 100,
      participationRatePct: 120,
      capType: 'none',
      knockInEnabled: true,
      knockInMode: 'EUROPEAN',
      knockInLevelPct: 90,
      downsideStrikePct: 90,
      bonusEnabled: false,
    },
    inceptionDate: '2026-01-01',
    maturityDate: '2027-01-01',
    notional: 100000,
    initialFixings: [70, 400],
    couponHistory: [], // CPPN has no coupons
    daysElapsed: 0,
    daysRemaining: 365,
    createdAt: '2026-01-13',
    updatedAt: '2026-01-13',
  };

  // Current market prices (FI down, MSTR down)
  const currentPrices = [63.80, 365]; // Both down ~9%

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">FI/MSTR Participation Note</h1>

      {/* THE MODULAR CARD */}
      <StandalonePositionCard
        position={position}
        marketPrices={currentPrices}
        showAI={true}
        className="mb-8"
      />

      {/* AI Will Explain:
        - Why showing physical delivery (knock-in triggered)
        - Why loss of 8.86%
        - What 1,428 shares means
        - How scenarios range from -50% to +30%
        - What to watch (barrier levels)
      */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: With AI Disabled (Faster Loading)
// ============================================================================

export function ValuraLifecyclePage_NoAI() {
  const position = { /* ... */ };
  const prices = [165, 285];

  return (
    <StandalonePositionCard
      position={position}
      marketPrices={prices}
      showAI={false} // Disable AI for faster load
    />
  );
}

// ============================================================================
// EXAMPLE 4: Custom Styling
// ============================================================================

export function ValuraLifecyclePage_Styled() {
  const position = { /* ... */ };
  const prices = [165, 285];

  return (
    <StandalonePositionCard
      position={position}
      marketPrices={prices}
      className="max-w-4xl mx-auto shadow-2xl" // Custom classes
      showAI={true}
    />
  );
}

// ============================================================================
// EXAMPLE 5: Multiple Positions
// ============================================================================

export function ValuraLifecyclePage_MultiplePositions() {
  const positions = [
    { /* position 1 */ },
    { /* position 2 */ },
    { /* position 3 */ },
  ];

  const allPrices = [
    [165, 285],
    [180, 320],
    [140, 275],
  ];

  return (
    <div className="space-y-8">
      {positions.map((position, idx) => (
        <StandalonePositionCard
          key={position.id}
          position={position}
          marketPrices={allPrices[idx]}
          showAI={true}
        />
      ))}
    </div>
  );
}

// ============================================================================
// DATA PREPARATION HELPER
// ============================================================================

/**
 * Convert your Valura data format to InvestmentPosition format
 */
export function convertValuraDataToPosition(valuraData: any) {
  return {
    id: valuraData.positionId,
    productTerms: {
      productType: valuraData.productType,
      notional: valuraData.notionalAmount,
      currency: valuraData.currency,
      basketType: valuraData.basketMethod,
      underlyings: valuraData.stocks.map((s: any) => ({
        ticker: s.symbol,
        name: s.companyName,
      })),
      initialFixings: valuraData.initialPrices,
      tenorMonths: valuraData.tenorMonths,
      // Map rest of your fields...
      ...valuraData.productConfig,
    },
    inceptionDate: valuraData.tradeDate,
    maturityDate: valuraData.maturityDate,
    notional: valuraData.notionalAmount,
    initialFixings: valuraData.initialPrices,
    couponHistory: valuraData.coupons || [],
    daysElapsed: calculateDaysSince(valuraData.tradeDate),
    daysRemaining: calculateDaysUntil(valuraData.maturityDate),
    createdAt: valuraData.createdAt,
    updatedAt: new Date().toISOString().split('T')[0],
  };
}

function calculateDaysSince(date: string): number {
  return Math.ceil((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function calculateDaysUntil(date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
}
