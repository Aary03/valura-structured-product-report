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
        border
        ${glass ? 'bg-glass backdrop-blur-sm' : 'bg-surface'}
        ${hover ? 'hover:shadow-strong hover:-translate-y-1 transition-all duration-300' : ''}
        shadow-card
        no-break
        ${className}
      `}
      style={{
        borderRadius: 'var(--radius-xl)',
        borderColor: 'var(--border-light)',
        borderWidth: '1px',
      }}
    >
      {children}
    </div>
  );
}

