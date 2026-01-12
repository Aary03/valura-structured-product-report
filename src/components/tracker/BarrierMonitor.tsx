/**
 * Barrier Monitor Component
 * Visual status of barrier protection
 */

import { Shield, ShieldAlert, ShieldX, Award } from 'lucide-react';
import type { PositionValue } from '../../types/investment';
import { getBarrierStatusColor } from '../../services/positionValuation';

interface BarrierMonitorProps {
  value: PositionValue;
  barrierLevel?: number; // as percentage (e.g., 70 for 70%)
  knockInLevel?: number;
  bonusBarrierLevel?: number;
  productType: 'RC' | 'CPPN';
}

export function BarrierMonitor({ 
  value, 
  barrierLevel, 
  knockInLevel,
  bonusBarrierLevel,
  productType 
}: BarrierMonitorProps) {
  // Determine which barrier to show
  const effectiveBarrier = barrierLevel || knockInLevel || bonusBarrierLevel;
  
  if (!effectiveBarrier || value.barrierStatus === 'n/a') {
    return null;
  }

  const currentLevel = (value.worstPerformer?.level || 1) * 100;
  const distanceToBarrier = currentLevel - effectiveBarrier;
  const safetyMarginPct = (distanceToBarrier / effectiveBarrier) * 100;

  // Determine icon and colors
  const getStatusIcon = () => {
    switch (value.barrierStatus) {
      case 'safe':
        return <Shield className="w-6 h-6 text-green-positive" />;
      case 'at_risk':
        return <ShieldAlert className="w-6 h-6 text-yellow-600" />;
      case 'breached':
        return <ShieldX className="w-6 h-6 text-red-negative" />;
      default:
        return <Shield className="w-6 h-6 text-grey-medium" />;
    }
  };

  const getStatusLabel = () => {
    switch (value.barrierStatus) {
      case 'safe':
        return 'SAFE';
      case 'at_risk':
        return 'AT RISK';
      case 'breached':
        return 'BREACHED';
      default:
        return 'N/A';
    }
  };

  const getStatusColor = () => {
    switch (value.barrierStatus) {
      case 'safe':
        return 'bg-green-positive/10 border-green-positive/20';
      case 'at_risk':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'breached':
        return 'bg-red-negative/10 border-red-negative/20';
      default:
        return 'bg-grey-light border-border';
    }
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-medium text-muted">Barrier Protection Status</h3>
            <p className={`text-lg font-bold ${getBarrierStatusColor(value.barrierStatus)}`}>
              {getStatusLabel()}
            </p>
          </div>
        </div>
        
        {value.bonusStatus && value.bonusStatus !== 'n/a' && (
          <BonusStatusBadge status={value.bonusStatus} amount={value.bonusAmount} />
        )}
      </div>

      {/* Status Card */}
      <div className={`rounded-lg border p-4 mb-4 ${getStatusColor()}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted mb-1">Current Level</div>
            <div className="text-2xl font-bold text-valura-ink">
              {currentLevel.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted mb-1">Barrier Level</div>
            <div className="text-2xl font-bold text-valura-ink">
              {effectiveBarrier.toFixed(1)}%
            </div>
          </div>
        </div>

        {value.barrierStatus !== 'breached' && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Safety Margin</span>
              <span className={`font-semibold ${
                safetyMarginPct > 10 ? 'text-green-positive' : 
                safetyMarginPct > 5 ? 'text-yellow-600' : 
                'text-red-negative'
              }`}>
                {distanceToBarrier > 0 ? '+' : ''}{distanceToBarrier.toFixed(1)}% 
                ({safetyMarginPct > 0 ? '+' : ''}{safetyMarginPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2">
        <div className="text-xs text-muted uppercase tracking-wide">Current vs Barrier</div>
        <div className="relative">
          {/* Background track */}
          <div className="w-full bg-grey-light rounded-full h-8 relative overflow-hidden">
            {/* Current level indicator */}
            <div
              className={`h-full transition-all duration-500 ${
                value.barrierStatus === 'safe' ? 'bg-green-positive' :
                value.barrierStatus === 'at_risk' ? 'bg-yellow-500' :
                'bg-red-negative'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, currentLevel))}%`
              }}
            />
            
            {/* Barrier line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-red-negative z-10"
              style={{
                left: `${Math.min(100, Math.max(0, effectiveBarrier))}%`
              }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-red-negative whitespace-nowrap">
                Barrier
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Status message */}
      <div className="mt-4 text-sm">
        {value.barrierStatus === 'safe' && (
          <div className="text-green-positive">
            ✓ Protection is intact. Your principal is safe at current levels.
          </div>
        )}
        {value.barrierStatus === 'at_risk' && (
          <div className="text-yellow-600">
            ⚠ Warning: Close to barrier. Monitor closely to avoid conversion.
          </div>
        )}
        {value.barrierStatus === 'breached' && (
          <div className="text-red-negative">
            ✗ Barrier breached. Physical share delivery will occur at maturity.
          </div>
        )}
      </div>
    </div>
  );
}

function BonusStatusBadge({ status, amount }: { status: 'active' | 'lost'; amount?: number }) {
  if (status === 'active') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
        <Award className="w-5 h-5 text-white" />
        <div className="text-white">
          <div className="text-xs font-medium">Bonus Active</div>
          {amount && (
            <div className="text-sm font-bold">
              +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-grey-light rounded-lg border border-border">
      <Award className="w-5 h-5 text-grey-medium" />
      <div>
        <div className="text-xs font-medium text-muted">Bonus Lost</div>
        <div className="text-xs text-red-negative">Barrier touched</div>
      </div>
    </div>
  );
}
