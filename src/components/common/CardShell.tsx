/**
 * Card Shell Component
 * Premium card wrapper with hover effects and glass option
 */

import { ReactNode } from 'react';

interface CardShellProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export function CardShell({ children, className = '', glass = false, hover = true }: CardShellProps) {
  return (
    <div
      className={`
        rounded-xl border border-border
        ${glass ? 'bg-glass backdrop-blur-sm' : 'bg-surface'}
        ${hover ? 'hover:shadow-card hover:-translate-y-0.5 transition-all duration-200' : ''}
        shadow-card
        ${className}
      `}
      style={{
        borderRadius: 'var(--radius-xl)',
      }}
    >
      {children}
    </div>
  );
}

