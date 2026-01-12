/**
 * Scenario Analysis Component
 * Shows different redemption scenarios based on various price movements
 */

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { InvestmentPosition, PositionValue } from '../../types/investment';
import { calculatePositionValue, formatCurrency } from '../../services/positionValuation';

interface ScenarioAnalysisProps {
  position: InvestmentPosition;
  currentMarketData: { underlyingPrices: number[]; timestamp: Date };
}

interface ScenarioResult {
  name: string;
  description: string;
  priceChange: number; // percentage
  colors: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
  icon: React.ReactNode;
  value: PositionValue;
}

export function ScenarioAnalysis({ position, currentMarketData }: ScenarioAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  const currency = position.productTerms.currency;
  const initialPrices = position.initialFixings;

  // Define scenarios with different price movements FROM INITIAL PRICE
  const scenarios: Array<{ name: string; description: string; multiplier: number; priceChange: number }> = [
    { name: 'Strong Rally', description: 'Stock up 30%', multiplier: 1.30, priceChange: 30 },
    { name: 'Moderate Gain', description: 'Stock up 15%', multiplier: 1.15, priceChange: 15 },
    { name: 'Slight Gain', description: 'Stock up 5%', multiplier: 1.05, priceChange: 5 },
    { name: 'Current Price', description: 'At current level', multiplier: 0, priceChange: 0 }, // Special: use actual current
    { name: 'Slight Loss', description: 'Stock down 5%', multiplier: 0.95, priceChange: -5 },
    { name: 'Moderate Loss', description: 'Stock down 15%', multiplier: 0.85, priceChange: -15 },
    { name: 'Barrier Touch', description: 'Stock at barrier', multiplier: 0.70, priceChange: -30 },
    { name: 'Deep Loss', description: 'Stock down 50%', multiplier: 0.50, priceChange: -50 },
  ];

  // Calculate values for each scenario
  const scenarioResults: ScenarioResult[] = scenarios.map(scenario => {
    // Calculate from INITIAL prices, not current prices
    // This ensures scenarios are relative to start, not current position
    const simulatedPrices = scenario.multiplier === 0 
      ? currentMarketData.underlyingPrices // Use current prices for "Current Price" scenario
      : initialPrices.map(initialPrice => initialPrice * scenario.multiplier); // Apply scenario to initial price
    
    const value = calculatePositionValue(position, {
      underlyingPrices: simulatedPrices,
      timestamp: new Date(),
    });

    // Color scheme based on outcome
    let colors;
    let icon;
    if (scenario.priceChange >= 15) {
      colors = {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
        border: 'border-green-500',
        text: 'text-green-700',
        icon: 'text-green-600',
      };
      icon = <TrendingUp className="w-8 h-8" />;
    } else if (scenario.priceChange >= 0) {
      colors = {
        bg: 'bg-gradient-to-br from-green-50/50 to-green-100/50',
        border: 'border-green-400',
        text: 'text-green-600',
        icon: 'text-green-500',
      };
      icon = <TrendingUp className="w-8 h-8" />;
    } else if (scenario.priceChange >= -10) {
      colors = {
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        icon: 'text-yellow-600',
      };
      icon = <Minus className="w-8 h-8" />;
    } else if (scenario.priceChange >= -20) {
      colors = {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-500',
        text: 'text-orange-700',
        icon: 'text-orange-600',
      };
      icon = <TrendingDown className="w-8 h-8" />;
    } else {
      colors = {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-500',
        text: 'text-red-700',
        icon: 'text-red-600',
      };
      icon = <TrendingDown className="w-8 h-8" />;
    }

    return {
      name: scenario.name,
      description: scenario.description,
      priceChange: scenario.priceChange,
      colors,
      icon,
      value,
    };
  });

  return (
    <div className="section-card">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-valura-ink mb-2">Scenario Analysis</h3>
        <p className="text-muted">See how your investment performs under different market conditions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'overview'
              ? 'text-blue-primary'
              : 'text-muted hover:text-valura-ink'
          }`}
        >
          Quick Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-primary rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'detailed'
              ? 'text-blue-primary'
              : 'text-muted hover:text-valura-ink'
          }`}
        >
          Detailed Breakdown
          {activeTab === 'detailed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-primary rounded-t" />
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioResults.map((scenario, index) => (
            <ScenarioCard key={index} scenario={scenario} currency={currency} />
          ))}
        </div>
      )}

      {/* Detailed Tab */}
      {activeTab === 'detailed' && (
        <div className="space-y-4">
          {scenarioResults.map((scenario, index) => (
            <DetailedScenarioCard
              key={index}
              scenario={scenario}
              currency={currency}
              initialInvestment={position.notional}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScenarioCard({
  scenario,
  currency,
}: {
  scenario: ScenarioResult;
  currency: string;
}) {
  const profit = scenario.value.currentMarketValue - scenario.value.initialInvestment;
  const profitPct = scenario.value.percentageReturn;
  const isBarrierBreach = scenario.value.barrierStatus === 'breached';
  const isPhysicalDelivery = scenario.value.settlementType === 'physical_shares';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 ${scenario.colors.border} ${scenario.colors.bg} p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isBarrierBreach ? 'ring-2 ring-red-400' : ''
      }`}
    >
      {/* Breach Warning Badge */}
      {isBarrierBreach && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Icon */}
      <div className={`mb-3 ${scenario.colors.icon}`}>
        {scenario.icon}
      </div>

      {/* Title */}
      <div className="mb-2">
        <h4 className={`font-bold ${scenario.colors.text}`}>{scenario.name}</h4>
        <p className="text-xs text-muted">{scenario.description}</p>
      </div>

      {/* Value */}
      <div className="space-y-1">
        <div className={`text-2xl font-bold ${scenario.colors.text}`}>
          {formatCurrency(scenario.value.currentMarketValue, currency)}
        </div>
        <div className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)}
          <span className="ml-1">({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Settlement Type Badge */}
      <div className="mt-3 space-y-1">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
            isPhysicalDelivery
              ? 'bg-orange-500/20 text-orange-700 border border-orange-300'
              : 'bg-green-500/20 text-green-700 border border-green-300'
          }`}
        >
          {isPhysicalDelivery ? '📊 Shares' : '💵 Cash'}
        </span>
        
        {isPhysicalDelivery && scenario.value.sharesReceived && (
          <div className="text-xs text-muted mt-1">
            {scenario.value.sharesReceived.toLocaleString()} shares
          </div>
        )}
      </div>
    </div>
  );
}

function DetailedScenarioCard({
  scenario,
  currency,
  initialInvestment,
}: {
  scenario: ScenarioResult;
  currency: string;
  initialInvestment: number;
}) {
  const profit = scenario.value.currentMarketValue - initialInvestment;
  const isBarrierBreach = scenario.value.barrierStatus === 'breached';
  const isPhysicalDelivery = scenario.value.settlementType === 'physical_shares';

  return (
    <div
      className={`rounded-xl border-2 ${scenario.colors.border} ${scenario.colors.bg} p-6 transition-all duration-300 hover:shadow-xl ${
        isBarrierBreach ? 'ring-4 ring-red-300/50 shadow-2xl' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-white/50 ${scenario.colors.icon} ${
            isBarrierBreach ? 'animate-pulse' : ''
          }`}>
            {scenario.icon}
          </div>
          <div>
            <h4 className={`text-lg font-bold ${scenario.colors.text}`}>{scenario.name}</h4>
            <p className="text-sm text-muted">{scenario.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${scenario.colors.text}`}>
            {formatCurrency(scenario.value.currentMarketValue, currency)}
          </div>
          <div className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)}
          </div>
        </div>
      </div>

      {/* CRITICAL: Barrier Breach Warning */}
      {isBarrierBreach && (
        <div className="mb-4 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-red-700 text-lg">⚠️ BARRIER BREACHED</div>
              <div className="text-sm text-red-600">Physical share delivery triggered</div>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Details - ENHANCED */}
      {isPhysicalDelivery && scenario.value.sharesReceived ? (
        <div className="mb-4 p-5 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl">
          <div className="text-sm font-bold text-orange-700 mb-3 uppercase tracking-wide">
            📊 Physical Share Delivery
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-sm text-muted">Shares Delivered</span>
              <span className="text-2xl font-bold text-valura-ink">
                {scenario.value.sharesReceived.toLocaleString()} shares
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-sm text-muted">Current Market Value</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatCurrency(scenario.value.sharesMarketValue || 0, currency)}
              </span>
            </div>

            {scenario.value.worstPerformer && (
              <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                <span className="text-sm text-muted">Share Price ({scenario.value.worstPerformer.ticker})</span>
                <span className="text-lg font-semibold text-valura-ink">
                  {formatCurrency(scenario.value.worstPerformer.currentPrice, currency)}
                </span>
              </div>
            )}

            {scenario.value.couponsReceivedToDate > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-100/60 rounded-lg border border-green-300">
                <span className="text-sm text-muted">+ Coupons Received</span>
                <span className="text-xl font-bold text-green-600">
                  +{formatCurrency(scenario.value.couponsReceivedToDate, currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl">
          <div className="text-sm font-bold text-green-700 mb-3 uppercase tracking-wide">
            ✅ Cash Redemption
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-sm text-muted">Principal Return</span>
              <span className="text-2xl font-bold text-valura-ink">
                {formatCurrency(initialInvestment, currency)}
              </span>
            </div>

            {scenario.value.couponsReceivedToDate > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-100/60 rounded-lg border border-green-300">
                <span className="text-sm text-muted">+ Coupons Received</span>
                <span className="text-xl font-bold text-green-600">
                  +{formatCurrency(scenario.value.couponsReceivedToDate, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <span className="text-sm font-semibold text-white">Total Cash Received</span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(scenario.value.currentMarketValue, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Return Summary */}
      <div className={`p-4 rounded-xl border-2 ${
        profit >= 0 
          ? 'bg-green-50 border-green-300' 
          : 'bg-red-50 border-red-300'
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-valura-ink">Your Net Return:</span>
          <div className="text-right">
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)}
            </div>
            <div className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({scenario.value.percentageReturn >= 0 ? '+' : ''}{scenario.value.percentageReturn.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
