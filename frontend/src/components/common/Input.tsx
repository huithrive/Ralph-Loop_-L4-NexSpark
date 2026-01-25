'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    hint,
    icon,
    fullWidth = false,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('relative', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2 font-rajdhani uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={clsx(
              // Base styles
              'w-full px-4 py-3 rounded-md transition-all duration-200',
              'bg-surface bg-opacity-60 border-2',
              'text-text-primary placeholder:text-text-muted',
              'font-rajdhani',

              // Focus styles
              'focus:outline-none focus:ring-3 focus:ring-gold focus:ring-opacity-30',

              // States
              {
                'border-border-subtle focus:border-gold': !error,
                'border-error focus:border-error focus:ring-error': error,
                'pl-10': icon,
              },

              className
            )}
            ref={ref}
            {...props}
          />
        </div>

        {(hint || error) && (
          <div className="mt-2 text-sm">
            {error ? (
              <p className="text-error font-medium">{error}</p>
            ) : (
              <p className="text-text-muted">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    hint,
    fullWidth = false,
    id,
    rows = 4,
    ...props
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('relative', { 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary mb-2 font-rajdhani uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          rows={rows}
          className={clsx(
            // Base styles
            'w-full px-4 py-3 rounded-md transition-all duration-200',
            'bg-surface bg-opacity-60 border-2',
            'text-text-primary placeholder:text-text-muted',
            'font-rajdhani resize-vertical',

            // Focus styles
            'focus:outline-none focus:ring-3 focus:ring-gold focus:ring-opacity-30',

            // States
            {
              'border-border-subtle focus:border-gold': !error,
              'border-error focus:border-error focus:ring-error': error,
            },

            className
          )}
          ref={ref}
          {...props}
        />

        {(hint || error) && (
          <div className="mt-2 text-sm">
            {error ? (
              <p className="text-error font-medium">{error}</p>
            ) : (
              <p className="text-text-muted">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';