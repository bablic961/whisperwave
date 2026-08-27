// components/ui/Button/Button.tsx
'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-[#00D4FF]/30',
  secondary: 'bg-white/10 text-white hover:bg-white/20',
  outline: 'border border-white/20 bg-transparent text-white hover:bg-white/5',
  ghost: 'bg-transparent text-white hover:bg-white/10',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] hover:shadow-lg hover:shadow-[#EF4444]/30',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
          isLoading && 'pointer-events-none'
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
