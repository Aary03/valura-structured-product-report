/**
 * Scenario Lab Component
 * Unified scenario testing: Today | Maturity | Stress | Replay tabs
 * Uses evaluatePosition with proper scenario overrides
 */

import { useState, useMemo } from 'react';
import { Play, Target, Zap, RotateCcw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { InvestmentPosition } from '../../types/investment';
import { evaluatePosition, type ScenarioOverrides, type PositionSnapshot, formatSnapshotCurrency } from '../../services/positionEvaluator';

interface ScenarioLabProps {
  position: InvestmentPosition;
  currentMarketData: { underlyingPrices: number[]; timestamp: Date };
  currency: string;
}

export function ScenarioLab({ position, currentMarketData, currency }: ScenarioLabProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'maturity' | 'stress' | 'replay'>('today');
  const [stressLevel, setStressLevel] = useState<number>(100); // Percentage of initial
  const [assumeBarrierTouched, setAssumeBarrierTouched] = useState(false);

  // Tab: TODAY - Uses current live prices
  const todaySnapshot = useMemo(() => {
    return evaluatePosition(position, currentMarketData, {});
  }, [position, currentMarketData]);

  // Tab: MATURITY - Calculate at maturity with various scenarios
  const maturityScenarios = useMemo(() => {
    const scenarios = [
      { name: 'Strong Rally', level: 1.30, emoji: '📈📈', color: 'green' },
      { name: 'Moderate Gain', level: 1.15, emoji: '📈', color: 'green' },
      { name: 'Flat', level: 1.00, emoji: '➡️', color: 'gray' },
      { name: 'Moderate Loss', level: 0.85, emoji: '📉', color: 'orange' },
      { name: 'Barrier Touch', level: 0.70, emoji: '⚠️', color: 'red' },
      { name: 'Deep Loss', level: 0.50, emoji: '📉📉', color: 'red' },
    ];

    return scenarios.map(s => {
      const snapshot = evaluatePosition(position, currentMarketData, {
        assumeMaturityToday: true,
        overrideWorstOfLevel: s.level,
      });

      return {
        ...s,
        snapshot,
      };
    });
  }, [position, currentMarketData]);

  // Tab: STRESS - Interactive stress testing with slider
  const stressSnapshot = useMemo(() => {
    return evaluatePosition(position, currentMarketData, {
      overrideWorstOfLevel: stressLevel / 100,
      overrideBarrierState: assumeBarrierTouched ? 'touched' : 'none',
    });
  }, [position, currentMarketData, stressLevel, assumeBarrierTouched]);

  return (
    <div className="section-card">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-valura-ink mb-2">Scenario Lab</h3>
        <p className="text-sm text-muted">
          Test different market outcomes using rule-based calculations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b-2 border-border">
        {[
          { id: 'today', label: 'Today', icon: Play },
          { id: 'maturity', label: 'Maturity', icon: Target },
          { id: 'stress', label: 'Stress Test', icon: Zap },
          { id: 'replay', label: 'Replay', icon: RotateCcw, disabled: true },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all relative ${
              activeTab === tab.id
                ? 'text-blue-primary'
                : tab.disabled
                ? 'text-muted opacity-40 cursor-not-allowed'
                : 'text-muted hover:text-valura-ink'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.disabled && (
              <span className="text-xs">(Premium)</span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'today' && (
        <TodayView snapshot={todaySnapshot} currency={currency} />
      )}

      {activeTab === 'maturity' && (
        <MaturityView scenarios={maturityScenarios} currency={currency} />
      )}

      {activeTab === 'stress' && (
        <StressView
          snapshot={stressSnapshot}
          currency={currency}
          stressLevel={stressLevel}
          onStressLevelChange={setStressLevel}
          assumeBarrierTouched={assumeBarrierTouched}
          onBarrierToggle={setAssumeBarrierTouched}
        />
      )}

      {activeTab === 'replay' && (
        <div className="p-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 text-center">
          <div className="text-purple-600 mb-3">
            <RotateCcw className="w-12 h-12 mx-auto mb-3" />
          </div>
          <h4 className="text-lg font-bold text-valura-ink mb-2">Historical Replay</h4>
          <p className="text-sm text-muted max-w-md mx-auto">
            Premium feature: Replay your investment using actual historical price data. 
            Requires historical OHLC data subscription.
          </p>
        </div>
      )}
    </div>
  );
}

// TODAY VIEW
function TodayView({ snapshot, currency }: { snapshot: PositionSnapshot; currency: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Play className="w-6 h-6 text-blue-600" />
        <h4 className="text-lg font-bold text-blue-700">Current Live Valuation</h4>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="text-xs text-muted mb-1">Indicative Value</div>
          <div className="text-xl font-bold text-valura-ink">
            {formatSnapshotCurrency(snapshot.indicativeOutcomeValue, currency)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-xs text-muted mb-1">Net P&L</div>
          <div className={`text-xl font-bold ${
            snapshot.netPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {snapshot.netPnL >= 0 ? '+' : ''}{formatSnapshotCurrency(snapshot.netPnL, currency)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-xs text-muted mb-1">Settlement Type</div>
          <div className="text-lg font-semibold text-valura-ink">
            {snapshot.settlement.type === 'cash' ? '💵 Cash' : '📊 Physical'}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-xs text-muted mb-1">Risk Status</div>
          <div className={`text-lg font-bold ${
            snapshot.riskStatus === 'SAFE' ? 'text-green-600' :
            snapshot.riskStatus === 'WATCH' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {snapshot.riskStatus}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-blue-900">
        <strong>Live Calculation:</strong> Using current market prices as of{' '}
        {snapshot.dataFreshness.pricesAsOf.toLocaleString()}
      </div>
    </div>
  );
}

// MATURITY VIEW
function MaturityView({ scenarios, currency }: { scenarios: any[]; currency: string }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted mb-4">
        Projected outcomes at maturity under different market scenarios
      </div>

      {scenarios.map((scenario, idx) => {
        const isProfit = scenario.snapshot.netPnL >= 0;
        const isBreached = scenario.snapshot.riskStatus === 'TRIGGERED';

        return (
          <div
            key={idx}
            className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
              scenario.color === 'green' 
                ? 'bg-green-50 border-green-300' 
                : scenario.color === 'gray'
                ? 'bg-grey-light border-border'
                : scenario.color === 'orange'
                ? 'bg-orange-50 border-orange-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{scenario.emoji}</div>
                <div>
                  <h4 className="text-lg font-bold text-valura-ink">{scenario.name}</h4>
                  <p className="text-sm text-muted">Level at {(scenario.level * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-valura-ink">
                  {formatSnapshotCurrency(scenario.snapshot.indicativeOutcomeValue, currency)}
                </div>
                <div className={`text-lg font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {isProfit ? '+' : ''}{formatSnapshotCurrency(scenario.snapshot.netPnL, currency)}
                  ({scenario.snapshot.netPnLPct >= 0 ? '+' : ''}{scenario.snapshot.netPnLPct.toFixed(1)}%)
                </div>
                <div className="text-sm font-medium text-muted mt-1">
                  {scenario.snapshot.settlement.type === 'cash' ? '💵 Cash' : '📊 Physical Shares'}
                </div>
              </div>
            </div>

            {isBreached && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <div className="text-sm text-red-700">
                  <strong>Why:</strong> {scenario.snapshot.reasonText}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// STRESS VIEW
function StressView({
  snapshot,
  currency,
  stressLevel,
  onStressLevelChange,
  assumeBarrierTouched,
  onBarrierToggle,
}: {
  snapshot: PositionSnapshot;
  currency: string;
  stressLevel: number;
  onStressLevelChange: (level: number) => void;
  assumeBarrierTouched: boolean;
  onBarrierToggle: (touched: boolean) => void;
}) {
  const isProfit = snapshot.netPnL >= 0;

  return (
    <div className="space-y-6">
      {/* Interactive Controls */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-purple-700 mb-4">Interactive Stress Testing</h4>

        {/* Stress Level Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-valura-ink">
              Basket Level: {stressLevel}%
            </label>
            <button
              onClick={() => onStressLevelChange(100)}
              className="text-xs text-blue-primary hover:underline font-medium"
            >
              Reset to 100%
            </button>
          </div>

          <input
            type="range"
            min="30"
            max="150"
            value={stressLevel}
            onChange={(e) => onStressLevelChange(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, 
                #ef4444 0%, 
                #f59e0b ${((stressLevel - 30) / 120) * 100}%, 
                #e5e7eb ${((stressLevel - 30) / 120) * 100}%, 
                #e5e7eb 100%)`
            }}
          />

          <div className="flex justify-between text-xs text-muted mt-2">
            <span>30% (Deep Stress)</span>
            <span>100% (Initial)</span>
            <span>150% (Strong Rally)</span>
          </div>
        </div>

        {/* Barrier Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={assumeBarrierTouched}
              onChange={(e) => onBarrierToggle(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium text-valura-ink">
              Assume Barrier Touched (Force Physical Delivery)
            </span>
          </label>
        </div>
      </div>

      {/* Stress Test Result */}
      <div className={`rounded-xl p-6 border-2 ${
        isProfit 
          ? 'bg-green-50 border-green-400' 
          : 'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isProfit ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
            <h4 className="text-lg font-bold text-valura-ink">Stress Test Outcome</h4>
          </div>

          <div className={`px-4 py-2 rounded-lg font-bold ${
            snapshot.riskStatus === 'SAFE' ? 'bg-green-500 text-white' :
            snapshot.riskStatus === 'WATCH' ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {snapshot.riskStatus}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted mb-1">Indicative Value</div>
            <div className="text-2xl font-bold text-valura-ink">
              {formatSnapshotCurrency(snapshot.indicativeOutcomeValue, currency)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted mb-1">P&L Impact</div>
            <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {snapshot.netPnL >= 0 ? '+' : ''}{formatSnapshotCurrency(snapshot.netPnL, currency)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-xs text-muted mb-1">Settlement</div>
            <div className="text-lg font-semibold text-valura-ink">
              {snapshot.settlement.type === 'cash' ? '💵 Cash' : '📊 Physical'}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {snapshot.riskStatus === 'TRIGGERED' && (
          <div className="p-4 bg-red-100 rounded-lg border border-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-900">
                <strong>Stress Scenario Triggered:</strong> {snapshot.reasonText}
              </div>
            </div>
          </div>
        )}

        {snapshot.settlement.shares && snapshot.settlement.shares.length > 0 && (
          <div className="mt-4 p-4 bg-orange-100 rounded-lg border border-orange-300">
            <div className="text-sm font-semibold text-orange-900 mb-2">
              Physical Delivery Details:
            </div>
            {snapshot.settlement.shares.map((share, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-muted">
                  {share.quantity.toLocaleString()} shares of {share.symbol}
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {formatSnapshotCurrency(share.marketValue, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
