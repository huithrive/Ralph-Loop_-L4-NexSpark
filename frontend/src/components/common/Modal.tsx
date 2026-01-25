'use client';

import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-modal backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          'relative bg-surface border border-border-subtle rounded-xl shadow-2xl',
          'animate-fade-in',

          // Sizes
          {
            'max-w-md w-full mx-4': size === 'sm',
            'max-w-lg w-full mx-4': size === 'md',
            'max-w-2xl w-full mx-4': size === 'lg',
            'max-w-4xl w-full mx-4': size === 'xl',
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border-subtle">
            <h2 className="text-xl font-bold text-text-primary font-antonio uppercase tracking-wide">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={clsx('p-6', { 'pt-6': !title })}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Footer for consistent action layout
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={clsx(
          'flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle',
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

ModalFooter.displayName = 'ModalFooter';