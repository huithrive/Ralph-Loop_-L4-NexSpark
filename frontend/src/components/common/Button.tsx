'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-gold focus-visible:ring-opacity-30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'font-antonio font-bold uppercase tracking-widest',
          'border-2 rounded-md',

          // Variants
          {
            // Primary: Gold background
            'bg-gold text-black border-gold hover:brightness-110 hover:translate-x-1 hover:shadow-glow-gold':
              variant === 'primary' && !disabled && !loading,

            // Secondary: Transparent with blue border
            'bg-transparent text-blue border-blue hover:bg-blue hover:bg-opacity-10 hover:shadow-glow-blue':
              variant === 'secondary' && !disabled && !loading,

            // Ghost: Transparent with subtle border
            'bg-transparent text-text-primary border-border-subtle hover:bg-surface hover:bg-opacity-50':
              variant === 'ghost' && !disabled && !loading,

            // Danger: Error color
            'bg-error text-white border-error hover:brightness-110':
              variant === 'danger' && !disabled && !loading,
          },

          // Sizes
          {
            'text-sm px-3 py-2 h-8': size === 'sm',
            'text-base px-4 py-3 h-10': size === 'md',
            'text-lg px-6 py-4 h-12': size === 'lg',
          },

          // Loading state
          {
            'cursor-wait': loading,
          },

          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';