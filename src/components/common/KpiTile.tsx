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
    primary: 'bg-primary-blue-bg text-primary-blue',
    success: 'bg-success-bg text-success-fg',
    warning: 'bg-warning-bg text-warning-fg',
    danger: 'bg-danger-bg text-danger-fg',
  };

  return (
    <div
      className={`
        bg-surface p-5 border
        shadow-card hover:shadow-strong hover:-translate-y-1
        transition-all duration-300
        ${className}
      `}
      style={{
        borderRadius: 'var(--radius-xl)',
        borderColor: 'var(--border-light)',
        borderWidth: '1px',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBgClasses[gradient]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{subtitle}</div>
    </div>
  );
}

