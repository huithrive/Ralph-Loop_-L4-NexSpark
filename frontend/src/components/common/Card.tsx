'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    hover = true,
    padding = 'md',
    children,
    ...props
  }, ref) => {
    return (
      <div
        className={clsx(
          // Base styles
          'rounded-xl border transition-all duration-300',

          // Variants
          {
            // Default: Surface background
            'bg-surface border-border-subtle backdrop-blur-sm':
              variant === 'default',

            // Glass: More transparent
            'bg-card border-border-subtle backdrop-blur-md':
              variant === 'glass',

            // Glow: With ambient glow
            'bg-surface border-gold shadow-glow-gold':
              variant === 'glow',
          },

          // Hover effects
          {
            'hover:border-gold hover:shadow-glow-gold hover:translate-y-[-2px]':
              hover && variant === 'default',
            'hover:bg-opacity-90':
              hover && variant === 'glass',
          },

          // Padding
          {
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },

          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={clsx(
          'border-b border-border-subtle pb-4 mb-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        className={clsx(
          'text-xl font-bold text-text-primary font-antonio uppercase tracking-wide',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Content
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={clsx(className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={clsx(
          'border-t border-border-subtle pt-4 mt-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';