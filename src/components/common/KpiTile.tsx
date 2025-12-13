/**
 * KPI Tile Component
 * Premium KPI display with icon, value, and subtitle
 */

import { ReactNode } from 'react';

interface KpiTileProps {
  icon: ReactNode;
  value: string;
  subtitle: string;
  gradient?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function KpiTile({ icon, value, subtitle, gradient = 'primary', className = '' }: KpiTileProps) {
  const iconBgClasses = {
    primary: 'bg-valura-mint-100 text-valura-ink',
    success: 'bg-success-bg text-success-fg',
    warning: 'bg-warning-bg text-warning-fg',
    danger: 'bg-danger-bg text-danger-fg',
  };

  return (
    <div
      className={`
        bg-surface rounded-xl p-4 border border-border
        shadow-card hover:shadow-card hover:-translate-y-0.5
        transition-all duration-200
        ${className}
      `}
      style={{
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBgClasses[gradient]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-valura-ink mb-1">{value}</div>
      <div className="text-sm text-muted">{subtitle}</div>
    </div>
  );
}

