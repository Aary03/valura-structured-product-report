/**
 * Position Tracker Page
 * Main page for tracking structured product investments
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Plus, RefreshCw, Download, Trash2, Edit2, TrendingDown, DollarSign, Award } from 'lucide-react';
import type { InvestmentPosition, PositionValue, PositionMarketData } from '../types/investment';
import { loadAllInvestmentPositions, deleteInvestmentPosition } from '../services/investmentStorage';
import { calculatePositionValue } from '../services/positionValuation';
import { PositionValueCard } from '../components/tracker/PositionValueCard';
import { SettlementPreview } from '../components/tracker/SettlementPreview';
import { BarrierMonitor } from '../components/tracker/BarrierMonitor';
import { CouponTimeline } from '../components/tracker/CouponTimeline';
import { UnderlyingPerformance } from '../components/tracker/UnderlyingPerformance';
import { ScenarioAnalysis } from '../components/tracker/ScenarioAnalysis';
import { TimeSimulator } from '../components/tracker/TimeSimulator';
import { MoneyFlowVisualization } from '../components/tracker/MoneyFlowVisualization';
import { AutocallMonitor } from '../components/tracker/AutocallMonitor';
import { AutocallStepDownCard } from '../components/tracker/AutocallStepDownCard';
import { CppnDetailsCard } from '../components/tracker/CppnDetailsCard';
import { fmpClient } from '../services/api/financialModelingPrep';
import { calcLevels, worstOf, bestOf, averageOf } from '../products/common/basket';

// Helper function to fetch current price for a symbol
async function fetchQuote(symbol: string): Promise<{ price: number; symbol: string }> {
  const response = await fmpClient.get<Array<{ symbol: string; price: number }>>(
    fmpClient.quote.quote(symbol)
  );
  const quote = Array.isArray(response) ? response[0] : response;
  return {
    symbol: quote.symbol,
    price: quote.price,
  };
}

interface PositionWithValue {
  position: InvestmentPosition;
  value: PositionValue;
  marketData: PositionMarketData;
}

export function PositionTrackerPage() {
  const [positions, setPositions] = useState<InvestmentPosition[]>([]);
  const [positionsWithValues, setPositionsWithValues] = useState<PositionWithValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load positions on mount
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const loaded = loadAllInvestmentPositions();
      setPositions(loaded);

      // Fetch market data and calculate values
      await refreshPositionValues(loaded);
    } catch (err) {
      console.error('Error loading positions:', err);
      setError('Failed to load investment positions');
    } finally {
      setLoading(false);
    }
  };

  const refreshPositionValues = async (positionsToRefresh: InvestmentPosition[]) => {
    if (positionsToRefresh.length === 0) {
      setPositionsWithValues([]);
      return;
    }

    setRefreshing(true);
    const results: PositionWithValue[] = [];

    for (const position of positionsToRefresh) {
      try {
        // Fetch current prices for all underlyings
        const underlyingPrices: number[] = [];
        for (const underlying of position.productTerms.underlyings) {
          const quote = await fetchQuote(underlying.ticker);
          underlyingPrices.push(quote.price);
        }

        const marketData: PositionMarketData = {
          underlyingPrices,
          timestamp: new Date(),
        };

        const value = calculatePositionValue(position, marketData);

        results.push({
          position,
          value,
          marketData,
        });
      } catch (err) {
        console.error(`Error fetching data for position ${position.id}:`, err);
      }
    }

    setPositionsWithValues(results);
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    await refreshPositionValues(positions);
  };

  const handleDelete = async (positionId: string, positionName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${positionName}" from your tracker?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      deleteInvestmentPosition(positionId);
      await loadPositions();
    } catch (err) {
      console.error('Error deleting position:', err);
      setError('Failed to delete position');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-grey-background">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="section-card text-center py-12">
            <RefreshCw className="w-12 h-12 text-blue-primary animate-spin mx-auto mb-4" />
            <p className="text-muted">Loading your investments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-background">
      <Header onRefresh={handleRefresh} refreshing={refreshing} />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-negative/10 border border-red-negative/20 rounded-lg p-4">
            <p className="text-red-negative">{error}</p>
          </div>
        )}

        {positions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <PortfolioSummary positionsWithValues={positionsWithValues} />

            {/* Individual Positions */}
            <div className="space-y-6">
              {positionsWithValues.map(({ position, value, marketData }) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  value={value}
                  marketData={marketData}
                  onDelete={() => handleDelete(position.id, position.name || `${position.productTerms.productType} Position`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ onRefresh, refreshing }: { onRefresh?: () => void; refreshing?: boolean }) {
  return (
    <div className="bg-white border-b border-grey-border py-6">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-primary/10 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-valura-ink">Live Position Tracker</h1>
              <p className="text-muted mt-1">Track your structured product investments in real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Prices
              </button>
            )}
            <a href="#" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Position
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative text-center py-20 px-8">
        <div className="max-w-2xl mx-auto">
          {/* Icon */}
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:rotate-6 transition-transform">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Start Tracking Your Investments
          </h2>
          <p className="text-lg text-grey-dark mb-8 max-w-lg mx-auto">
            Generate a structured product report and save it to your tracker to see real-time valuations, 
            scenario analysis, and beautiful insights.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-valura-ink mb-1">Live Valuation</div>
              <div className="text-sm text-muted">Real-time position values</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-valura-ink mb-1">Scenario Analysis</div>
              <div className="text-sm text-muted">8 different outcomes</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-pink-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-valura-ink mb-1">Returns Tracking</div>
              <div className="text-sm text-muted">Monitor your profits</div>
            </div>
          </div>

          {/* CTA Button */}
          <a 
            href="#" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Create Your First Position
          </a>
        </div>
      </div>
    </div>
  );
}

function PortfolioSummary({ positionsWithValues }: { positionsWithValues: PositionWithValue[] }) {
  if (positionsWithValues.length === 0) return null;

  const totalInvested = positionsWithValues.reduce((sum, p) => sum + p.value.initialInvestment, 0);
  const totalCurrentValue = positionsWithValues.reduce((sum, p) => sum + p.value.currentMarketValue, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const percentageReturn = (totalReturn / totalInvested) * 100;
  const isPositive = totalReturn >= 0;

  return (
    <div className={`section-card overflow-hidden relative ${
      isPositive 
        ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600' 
        : 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-600'
    } text-white`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Portfolio Overview</h2>
            <p className="text-sm opacity-90">Your investment performance snapshot</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all">
            <div className="text-sm opacity-90 mb-2">Total Positions</div>
            <div className="text-4xl font-bold">{positionsWithValues.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all">
            <div className="text-sm opacity-90 mb-2">Total Invested</div>
            <div className="text-4xl font-bold">
              ${(totalInvested / 1000).toFixed(0)}K
            </div>
            <div className="text-xs opacity-75 mt-1">
              ${totalInvested.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all">
            <div className="text-sm opacity-90 mb-2">Current Value</div>
            <div className="text-4xl font-bold">
              ${(totalCurrentValue / 1000).toFixed(0)}K
            </div>
            <div className="text-xs opacity-75 mt-1">
              ${totalCurrentValue.toLocaleString()}
            </div>
          </div>
          <div className={`backdrop-blur-sm rounded-lg p-4 transition-all ${
            isPositive ? 'bg-green-400/30 hover:bg-green-400/40' : 'bg-red-400/30 hover:bg-red-400/40'
          }`}>
            <div className="text-sm opacity-90 mb-2">Total Return</div>
            <div className="text-4xl font-bold flex items-center gap-2">
              {isPositive ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
              {percentageReturn >= 0 ? '+' : ''}{percentageReturn.toFixed(1)}%
            </div>
            <div className="text-sm font-semibold mt-1">
              {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PositionCard({
  position,
  value,
  marketData,
  onDelete,
}: {
  position: InvestmentPosition;
  value: PositionValue;
  marketData: PositionMarketData;
  onDelete: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const terms = position.productTerms;
  const currency = terms.currency;
  const productType = terms.productType;

  // Calculate basket level for CPPN products
  let basketLevelPct = 100;
  if (productType === 'CPPN') {
    const levels = calcLevels(marketData.underlyingPrices, position.initialFixings);
    if (terms.basketType === 'single') {
      basketLevelPct = levels[0] * 100;
    } else if (terms.basketType === 'worst_of') {
      basketLevelPct = worstOf(levels).worstLevel * 100;
    } else if (terms.basketType === 'best_of') {
      basketLevelPct = bestOf(levels).bestLevel * 100;
    } else {
      basketLevelPct = averageOf(levels) * 100;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-border overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-border ${
        value.percentageReturn >= 0
          ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50'
          : 'bg-gradient-to-r from-red-50 via-rose-50 to-pink-50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-valura-ink">
                {position.name || `${productType} Position`}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                productType === 'RC' 
                  ? 'bg-blue-primary/20 text-blue-primary border border-blue-primary/30' 
                  : 'bg-purple-500/20 text-purple-700 border border-purple-500/30'
              }`}>
                {productType === 'RC' ? 'Reverse Convertible' : 
                 terms.bonusEnabled ? 'Bonus Certificate' : 'Participation Note'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="font-medium">Underlyings:</span>
              <span className="font-mono">{terms.underlyings.map(u => u.ticker).join(', ')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <>
                <button className="p-2 text-muted hover:text-blue-primary hover:bg-blue-primary/10 rounded-lg transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-muted hover:text-red-negative hover:bg-red-negative/10 rounded-lg transition-colors group"
                  title="Remove from tracker"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <span className="text-sm font-medium text-red-700">Delete?</span>
                <button
                  onClick={() => {
                    onDelete();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-grey-light text-valura-ink text-sm font-semibold rounded hover:bg-grey-medium transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 bg-gradient-to-b from-white to-grey-light/20">
        {/* Value Card */}
        <PositionValueCard value={value} currency={currency} />

        {/* Money Flow Visualization */}
        <MoneyFlowVisualization 
          value={value} 
          currency={currency}
          initialInvestment={position.notional}
        />

        {/* Time Simulator - NEW! */}
        <TimeSimulator position={position} currentMarketData={marketData} />

        {/* Scenario Analysis */}
        <ScenarioAnalysis position={position} currentMarketData={marketData} />

        {/* Settlement Preview */}
        <SettlementPreview 
          value={value} 
          currency={currency}
          worstTicker={value.worstPerformer?.ticker}
        />

        {/* Autocall Monitor (if enabled) */}
        {productType === 'RC' && terms.autocallEnabled && (
          <>
            {terms.autocallStepDown && terms.autocallStepDownLevels ? (
              <AutocallStepDownCard
                terms={terms}
                currentBasketLevel={value.worstPerformer?.level || 1}
                inceptionDate={position.inceptionDate}
                couponsToDate={value.couponsReceivedToDate}
                currency={currency}
              />
            ) : (
              <AutocallMonitor
                terms={terms}
                currentLevel={value.worstPerformer?.level || 1}
                couponsReceivedToDate={value.couponsReceivedToDate}
                currency={currency}
              />
            )}
          </>
        )}

        {/* Barrier Monitor (if applicable) */}
        {productType === 'RC' && (
          <BarrierMonitor
            value={value}
            barrierLevel={terms.variant === 'standard_barrier_rc' ? terms.barrierPct! * 100 : undefined}
            knockInLevel={terms.variant === 'low_strike_geared_put' ? (terms.knockInBarrierPct || terms.strikePct!) * 100 : undefined}
            productType="RC"
          />
        )}

        {productType === 'CPPN' && (
          <>
            {/* CPPN Explanation Card */}
            <CppnDetailsCard 
              terms={terms}
              value={value}
              basketLevel={basketLevelPct}
            />

            <BarrierMonitor
              value={value}
              knockInLevel={terms.knockInEnabled ? terms.knockInLevelPct : undefined}
              bonusBarrierLevel={terms.bonusEnabled ? terms.bonusBarrierPct : undefined}
              productType="CPPN"
            />
          </>
        )}

        {/* Coupon Timeline (RC only) */}
        {productType === 'RC' && position.couponHistory.length > 0 && (
          <CouponTimeline coupons={position.couponHistory} currency={currency} />
        )}

        {/* Underlying Performance */}
        <UnderlyingPerformance
          value={value}
          underlyings={terms.underlyings}
          initialPrices={position.initialFixings}
          currentPrices={marketData.underlyingPrices}
          currency={currency}
        />
      </div>
    </div>
  );
}
