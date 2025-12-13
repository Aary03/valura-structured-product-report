/**
 * Pill / Badge Component
 * Standardized pill component for consistent styling across the app
 */

import { ReactNode } from 'react';

export type PillVariant = 'default' | 'success' | 'danger' | 'warning';

interface PillProps {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
  icon?: ReactNode;
}

export function Pill({ children, variant = 'default', className = '', icon }: PillProps) {
  const baseClasses = 'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all';
  
  const variantClasses = {
    default: 'bg-surface-2 border-border text-valura-ink',
    success: 'bg-success-bg border-success-fg/20 text-success-fg',
    danger: 'bg-danger-bg border-danger-fg/20 text-danger-fg',
    warning: 'bg-warning-bg border-warning-fg/20 text-warning-fg',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

