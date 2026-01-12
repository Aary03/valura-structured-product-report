/**
 * Unified Risk Monitor Component
 * Shows SAFE/WATCH/TRIGGERED status with all key levels
 * Standardized across all product types
 */

import { Shield, ShieldAlert, ShieldX } from 'lucide-react';
import type { PositionSnapshot } from '../../services/positionEvaluator';

interface UnifiedRiskMonitorProps {
  snapshot: PositionSnapshot;
}

export function UnifiedRiskMonitor({ snapshot }: UnifiedRiskMonitorProps) {
  const getStatusIcon = () => {
    switch (snapshot.riskStatus) {
      case 'SAFE':
        return <Shield className="w-8 h-8 text-green-600" />;
      case 'WATCH':
        return <ShieldAlert className="w-8 h-8 text-yellow-600" />;
      case 'TRIGGERED':
        return <ShieldX className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (snapshot.riskStatus) {
      case 'SAFE':
        return 'from-green-50 to-emerald-100 border-green-400';
      case 'WATCH':
        return 'from-yellow-50 to-orange-100 border-yellow-400';
      case 'TRIGGERED':
        return 'from-red-50 to-rose-100 border-red-400';
    }
  };

  const getStatusLabel = () => {
    switch (snapshot.riskStatus) {
      case 'SAFE':
        return 'Protected';
      case 'WATCH':
        return 'Watch Zone';
      case 'TRIGGERED':
        return 'Protection Breached';
    }
  };

  return (
    <div className="section-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-valura-ink">Risk Monitor</h3>
            <p className={`text-sm font-semibold ${
              snapshot.riskStatus === 'SAFE' ? 'text-green-600' :
              snapshot.riskStatus === 'WATCH' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              Status: {getStatusLabel()}
            </p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${
          snapshot.riskStatus === 'SAFE' 
            ? 'bg-green-500 text-white' 
            : snapshot.riskStatus === 'WATCH'
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {snapshot.riskStatus}
        </div>
      </div>

      {/* Key Levels Table */}
      {snapshot.keyLevels.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide">
            Key Level Monitoring
          </div>
          
          {snapshot.keyLevels.map((level, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                level.status === 'safe' 
                  ? 'bg-green-50 border-green-300' 
                  : level.status === 'at_risk'
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-valura-ink mb-1">
                    {level.label}
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-muted">Current: </span>
                      <span className="text-lg font-bold text-valura-ink">
                        {level.current.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Level: </span>
                      <span className="text-lg font-bold text-valura-ink">
                        {level.level.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Distance: </span>
                      <span className={`text-lg font-bold ${
                        level.status === 'safe' ? 'text-green-600' :
                        level.status === 'at_risk' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {level.distance >= 0 ? '+' : ''}{level.distance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                  level.status === 'safe' 
                    ? 'bg-green-500 text-white' 
                    : level.status === 'at_risk'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {level.status === 'safe' ? '✓ SAFE' :
                   level.status === 'at_risk' ? '⚠ WATCH' :
                   '✗ BREACHED'}
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-3 relative">
                <div className="w-full bg-grey-light rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      level.status === 'safe' ? 'bg-green-500' :
                      level.status === 'at_risk' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, level.current))}%`
                    }}
                  />
                  {/* Level marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-red-600 z-10"
                    style={{
                      left: `${Math.min(100, Math.max(0, level.level))}%`
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600 whitespace-nowrap">
                      {level.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
