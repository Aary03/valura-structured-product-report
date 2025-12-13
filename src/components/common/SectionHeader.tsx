/**
 * Section Header Component
 * Premium section header with icon and gradient divider
 */

import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, icon, subtitle, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        {icon && (
          <div className="text-valura-ink">{icon}</div>
        )}
        <h2 className="text-2xl font-bold text-valura-ink">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-text-secondary text-sm mb-3">{subtitle}</p>
      )}
      <div className="h-0.5 bg-valura-mint w-full" style={{ height: '2px' }}></div>
    </div>
  );
}

