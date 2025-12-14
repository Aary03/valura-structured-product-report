/**
 * Pill / Badge Component
 * Standardized pill component for consistent styling across the app
 */

import { ReactNode } from 'react';

export type PillVariant =
  | 'default'
  | 'success'
  | 'danger'
  | 'warning'
  | 'primary'
  | 'info'
  | 'teal'
  | 'purple'
  | 'coral';

interface PillProps {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
  icon?: ReactNode;
}

export function Pill({ children, variant = 'default', className = '', icon }: PillProps) {
  const baseClasses =
    'inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all ring-1 ring-white/60 shadow-soft';
  
  const variantClasses = {
    default: 'bg-surface border-border-light text-text-primary',
    primary: 'bg-primary-blue-bg border-primary-blue text-primary-blue',
    success: 'bg-success-bg border-success-border/40 text-success-fg',
    danger: 'bg-danger-bg border-danger-border/40 text-danger-fg',
    warning: 'bg-warning-bg border-warning-border/40 text-warning-fg',
    info: 'bg-info-bg border-info-border/40 text-info-fg',
    teal: 'bg-accent-teal-bg border-accent-teal text-accent-teal-dark',
    purple: 'bg-accent-purple-bg border-accent-purple text-accent-purple-dark',
    coral: 'bg-accent-coral-bg border-accent-coral text-accent-coral-dark',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

