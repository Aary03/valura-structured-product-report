/**
 * Time Simulator Component
 * Interactive time-based simulation showing how position value evolves
 */

import { useState, useMemo } from 'react';
import { Play, Pause, TrendingUp, TrendingDown, Clock, Zap, AlertTriangle, Gift, DollarSign } from 'lucide-react';
import type { InvestmentPosition, PositionMarketData } from '../../types/investment';
import { calculatePositionValue, formatCurrency, formatPercentage } from '../../services/positionValuation';

interface TimeSimulatorProps {
  position: InvestmentPosition;
  currentMarketData: PositionMarketData;
}

export function TimeSimulator({ position, currentMarketData }: TimeSimulatorProps) {
  const today = new Date();
  const inceptionDate = new Date(position.inceptionDate);
  const maturityDate = new Date(position.maturityDate);
  
  const totalDays = Math.ceil((maturityDate.getTime() - inceptionDate.getTime()) / (1000 * 60 * 60 * 24));
  const actualDaysElapsed = Math.max(0, Math.ceil((today.getTime() - inceptionDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const [simulatedDays, setSimulatedDays] = useState(actualDaysElapsed);
  const [priceScenario, setPriceScenario] = useState<number>(0); // 0 = current prices, others = multiplier from initial
  const [isPlaying, setIsPlaying] = useState(false);

  const currency = position.productTerms.currency;
  
  // Price scenarios - relative to INITIAL price
  const priceScenarios = [
    { label: 'Deep Loss', value: 0.5, color: 'from-red-500 to-red-600', emoji: '📉📉', isActual: false },
    { label: 'Loss', value: 0.85, color: 'from-orange-500 to-red-500', emoji: '📉', isActual: false },
    { label: 'Current', value: 0, color: 'from-blue-500 to-cyan-600', emoji: '📍', isActual: true },
    { label: 'Gain', value: 1.15, color: 'from-green-500 to-emerald-500', emoji: '📈', isActual: false },
    { label: 'Strong Gain', value: 1.30, color: 'from-green-600 to-teal-600', emoji: '📈📈', isActual: false },
  ];

  // Animate through time
  useMemo(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setSimulatedDays(prev => {
          if (prev >= totalDays) {
            setIsPlaying(false);
            return totalDays;
          }
          return Math.min(prev + 1, totalDays);
        });
      }, 50); // Speed: 50ms per day
      return () => clearInterval(interval);
    }
  }, [isPlaying, totalDays]);

  // Calculate simulated date
  const simulatedDate = new Date(inceptionDate.getTime() + simulatedDays * 24 * 60 * 60 * 1000);

  // Calculate position value at simulated time with price scenario
  const simulatedValue = useMemo(() => {
    // Get initial prices
    const initialPrices = position.initialFixings;
    
    // Calculate simulated prices FROM INITIAL, not from current
    // Exception: if priceScenario is 0, use actual current prices
    const selectedScenario = priceScenarios.find(s => s.value === priceScenario);
    const simulatedPrices = selectedScenario?.isActual
      ? currentMarketData.underlyingPrices
      : initialPrices.map(initial => initial * priceScenario);
    
    // Calculate which coupons would have been paid by this date
    const paidCoupons = position.couponHistory.filter(coupon => {
      const couponDate = new Date(coupon.date);
      return couponDate <= simulatedDate;
    });

    // Create a temporary position with simulated coupon status
    const tempPosition = {
      ...position,
      couponHistory: position.couponHistory.map(c => ({
        ...c,
        paid: paidCoupons.some(pc => pc.date === c.date),
      })),
      daysElapsed: simulatedDays,
      daysRemaining: Math.max(0, totalDays - simulatedDays),
    };

    return calculatePositionValue(tempPosition, {
      underlyingPrices: simulatedPrices,
      timestamp: simulatedDate,
    });
  }, [simulatedDays, priceScenario, currentMarketData, position, simulatedDate, totalDays, priceScenarios]);

  // Calculate checkpoints (coupon dates, autocall dates, maturity)
  const checkpoints = useMemo(() => {
    const points: Array<{
      day: number;
      type: 'coupon' | 'maturity';
      label: string;
      amount: number;
    }> = [];
    
    // Add coupon dates
    position.couponHistory.forEach((coupon, index) => {
      const couponDate = new Date(coupon.date);
      const couponDays = Math.ceil((couponDate.getTime() - inceptionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (couponDays >= 0 && couponDays <= totalDays) {
        points.push({
          day: couponDays,
          type: 'coupon',
          label: `Coupon ${index + 1}`,
          amount: coupon.amount,
        });
      }
    });
    
    // Add maturity
    points.push({
      day: totalDays,
      type: 'maturity',
      label: 'Maturity',
      amount: 0,
    });

    return points;
  }, [position, inceptionDate, totalDays]);

  const progressPct = (simulatedDays / totalDays) * 100;
  const isAtMaturity = simulatedDays >= totalDays;
  const isBarrierBreach = simulatedValue.barrierStatus === 'breached';
  const isPhysicalDelivery = simulatedValue.settlementType === 'physical_shares';

  return (
    <div className="section-card overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-valura-ink">⏰ Time Simulator</h3>
              <p className="text-sm text-muted">Control time & market to see your investment evolve</p>
            </div>
          </div>
          
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isAtMaturity}
            className={`p-3 rounded-full transition-all ${
              isAtMaturity
                ? 'bg-grey-light text-muted cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl transform hover:scale-110 shadow-lg'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* LIVE Value Display - ENHANCED */}
      <div className={`rounded-xl p-6 mb-6 transition-all duration-500 ${
        isBarrierBreach
          ? 'bg-gradient-to-br from-red-100 via-orange-100 to-red-50 border-4 border-red-400 shadow-2xl'
          : simulatedValue.percentageReturn >= 0
          ? 'bg-gradient-to-br from-green-100 via-emerald-100 to-green-50 border-4 border-green-400 shadow-xl'
          : 'bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-50 border-4 border-yellow-400 shadow-xl'
      }`}>
        {/* Breach Warning */}
        {isBarrierBreach && (
          <div className="mb-4 p-4 bg-red-500 rounded-xl text-white animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <div className="font-bold text-lg">⚠️ BARRIER BREACHED - Physical Delivery Triggered!</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted mb-1">📅 Simulated Date</div>
            <div className="font-bold text-valura-ink text-sm">
              {simulatedDate.toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">⏱️ Progress</div>
            <div className="font-bold text-valura-ink">
              {simulatedDays} / {totalDays} days
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">💰 Value</div>
            <div className="text-2xl font-bold text-valura-ink">
              {formatCurrency(simulatedValue.currentMarketValue, currency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">📈 Return</div>
            <div className={`text-2xl font-bold flex items-center gap-1 ${
              simulatedValue.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {simulatedValue.percentageReturn >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {formatPercentage(simulatedValue.percentageReturn)}
            </div>
          </div>
        </div>

        {/* Settlement Details */}
        {isPhysicalDelivery && simulatedValue.sharesReceived ? (
          <div className="pt-4 border-t-2 border-orange-300 space-y-2">
            <div className="font-bold text-orange-700 mb-2">📊 Physical Share Delivery:</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-xs text-muted">Shares Delivered</div>
                <div className="text-xl font-bold text-valura-ink">
                  {simulatedValue.sharesReceived.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-xs text-muted">Market Value</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(simulatedValue.sharesMarketValue || 0, currency)}
                </div>
              </div>
              {simulatedValue.couponsReceivedToDate > 0 && (
                <div className="bg-green-100/80 rounded-lg p-3 border border-green-400">
                  <div className="text-xs text-muted">+ Coupons</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(simulatedValue.couponsReceivedToDate, currency)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t-2 border-green-300 space-y-2">
            <div className="font-bold text-green-700 mb-2">💵 Cash Redemption:</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="text-xs text-muted">Principal</div>
                <div className="text-xl font-bold text-valura-ink">
                  {formatCurrency(simulatedValue.initialInvestment, currency)}
                </div>
              </div>
              {simulatedValue.couponsReceivedToDate > 0 && (
                <div className="bg-green-100/80 rounded-lg p-3 border border-green-400">
                  <div className="text-xs text-muted">+ Coupons</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(simulatedValue.couponsReceivedToDate, currency)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Time Slider with Checkpoints */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-valura-ink flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time Control: Day {simulatedDays} of {totalDays}
          </label>
          <button
            onClick={() => {
              setSimulatedDays(actualDaysElapsed);
              setIsPlaying(false);
            }}
            className="px-3 py-1 text-xs text-white bg-blue-primary hover:bg-blue-secondary rounded-lg font-medium transition-all"
          >
            Reset to Today
          </button>
        </div>
        
        {/* Slider with checkpoint markers */}
        <div className="relative mb-8">
          <input
            type="range"
            min="0"
            max={totalDays}
            value={simulatedDays}
            onChange={(e) => {
              setSimulatedDays(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, 
                #8b5cf6 0%, 
                #ec4899 ${progressPct}%, 
                #e5e7eb ${progressPct}%, 
                #e5e7eb 100%)`
            }}
          />
          
          {/* Checkpoint Markers */}
          {checkpoints.map((checkpoint, idx) => (
            <div
              key={idx}
              className="absolute top-0 transform -translate-x-1/2 -translate-y-1"
              style={{ left: `${(checkpoint.day / totalDays) * 100}%` }}
            >
              <div className={`w-3 h-3 rounded-full ${
                checkpoint.type === 'coupon' ? 'bg-green-500' : 'bg-purple-600'
              } border-2 border-white shadow-lg`} />
              {simulatedDays === checkpoint.day && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    checkpoint.type === 'coupon' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-600 text-white'
                  } shadow-xl`}>
                    {checkpoint.label}
                    {checkpoint.type === 'coupon' && ` - ${formatCurrency(checkpoint.amount, currency)}`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-muted mb-4">
          <span>🚀 {inceptionDate.toLocaleDateString()}</span>
          <span className={simulatedDays === actualDaysElapsed ? 'text-blue-primary font-bold text-sm' : ''}>
            {simulatedDays === actualDaysElapsed && '👉 '}Today
          </span>
          <span>🏁 {maturityDate.toLocaleDateString()}</span>
        </div>

        {/* Progress Bar with percentage */}
        <div className="bg-grey-light rounded-full h-10 relative overflow-hidden shadow-inner">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${
              isBarrierBreach
                ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-valura-ink">
            {progressPct.toFixed(1)}% Complete {isAtMaturity && '✓'}
          </div>
        </div>
      </div>

      {/* Price Scenario Selector - ENHANCED */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-valura-ink mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Market Scenario: 
          <span className="text-blue-primary">
            {priceScenarios.find(s => s.value === priceScenario)?.label}
          </span>
          <span className="text-muted text-xs">
            ({priceScenario > 1 ? '+' : ''}{((priceScenario - 1) * 100).toFixed(0)}%)
          </span>
        </label>
        
        <div className="grid grid-cols-5 gap-2">
          {priceScenarios.map((scenario) => (
            <button
              key={scenario.value}
              onClick={() => setPriceScenario(scenario.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                priceScenario === scenario.value
                  ? `bg-gradient-to-br ${scenario.color} text-white border-white shadow-2xl transform scale-110 ring-4 ring-purple-300`
                  : 'bg-white border-border hover:border-gray-400 hover:shadow-lg hover:scale-105'
              }`}
            >
              <div className="text-3xl mb-1">{scenario.emoji}</div>
              <div className={`text-xs font-semibold mb-1 ${
                priceScenario === scenario.value ? 'text-white' : 'text-valura-ink'
              }`}>
                {scenario.label}
              </div>
              <div className={`text-xs ${
                priceScenario === scenario.value ? 'text-white/90 font-bold' : 'text-muted'
              }`}>
                {scenario.isActual ? 'Now' : 
                 `${scenario.value > 1 ? '+' : ''}${((scenario.value - 1) * 100).toFixed(0)}%`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live vs Simulated Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl">
          <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">
            📍 Live (Actual Today)
          </div>
          <div className="text-sm text-muted">Day {actualDaysElapsed}</div>
          <div className="text-lg font-bold text-blue-600 mt-1">
            {formatCurrency(simulatedValue.initialInvestment, currency)}
          </div>
          <div className="text-xs text-muted">+ ongoing coupons</div>
        </div>

        <div className={`p-4 rounded-xl border-2 ${
          simulatedDays === actualDaysElapsed
            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400'
        }`}>
          <div className={`text-xs font-semibold mb-1 uppercase tracking-wide ${
            simulatedDays === actualDaysElapsed ? 'text-blue-600' : 'text-purple-600'
          }`}>
            {simulatedDays === actualDaysElapsed ? '📍 Live (Actual Today)' : '🎮 Simulated'}
          </div>
          <div className="text-sm text-muted">Day {simulatedDays}</div>
          <div className={`text-lg font-bold mt-1 ${
            simulatedDays === actualDaysElapsed ? 'text-blue-600' : 'text-purple-600'
          }`}>
            {formatCurrency(simulatedValue.currentMarketValue, currency)}
          </div>
          <div className={`text-xs font-semibold ${
            simulatedValue.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(simulatedValue.percentageReturn)} return
          </div>
        </div>
      </div>

      {/* Maturity Message - ENHANCED */}
      {isAtMaturity && (
        <div className={`mt-6 p-6 rounded-2xl text-white text-center shadow-2xl ${
          simulatedValue.percentageReturn >= 0
            ? 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600'
            : 'bg-gradient-to-r from-red-500 via-rose-600 to-pink-600'
        }`}>
          <div className="text-3xl font-bold mb-3">
            {simulatedValue.percentageReturn >= 0 ? '🎉' : '📊'} Investment Matured!
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm opacity-90">Final Value</div>
              <div className="text-2xl font-bold">
                {formatCurrency(simulatedValue.currentMarketValue, currency)}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm opacity-90">Total Return</div>
              <div className="text-2xl font-bold">
                {formatPercentage(simulatedValue.percentageReturn)}
              </div>
            </div>
          </div>

          {isPhysicalDelivery ? (
            <div className="bg-orange-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="font-bold mb-2">Settlement: Physical Shares</div>
              <div className="text-lg">
                {simulatedValue.sharesReceived?.toLocaleString()} shares worth {formatCurrency(simulatedValue.sharesMarketValue || 0, currency)}
              </div>
              {simulatedValue.couponsReceivedToDate > 0 && (
                <div className="text-sm mt-2">
                  + {formatCurrency(simulatedValue.couponsReceivedToDate, currency)} in coupons
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="font-bold mb-2">Settlement: Cash Redemption ✓</div>
              <div className="text-lg">
                {formatCurrency(simulatedValue.initialInvestment, currency)} principal 
                {simulatedValue.couponsReceivedToDate > 0 && (
                  <> + {formatCurrency(simulatedValue.couponsReceivedToDate, currency)} coupons</>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkpoint reached notification */}
      {checkpoints.some(cp => cp.day === simulatedDays && cp.type === 'coupon') && !isAtMaturity && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white shadow-xl animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <Gift className="w-6 h-6" />
            <div className="font-bold text-lg">
              💰 Coupon Payment Received: {formatCurrency(
                checkpoints.find(cp => cp.day === simulatedDays)?.amount || 0, 
                currency
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
