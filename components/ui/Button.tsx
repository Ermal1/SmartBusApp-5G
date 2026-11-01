'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-soft' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[var(--primary)] text-white hover:opacity-90 shadow-md hover:shadow-lg active:scale-95 focus:ring-[var(--primary)]',
    'primary-soft': 'bg-[var(--primary-soft)] border border-[var(--primary)]/35 text-[var(--primary-foreground)] hover:bg-[var(--primary-soft-2)] active:scale-95 focus:ring-[var(--primary)]/40',
    secondary: 'bg-[var(--secondary)] text-[var(--primary-foreground)] hover:opacity-90 border border-[var(--primary)]/20 active:scale-95 focus:ring-[var(--primary)]/40',
    ghost: 'text-[var(--primary-foreground)] hover:bg-[var(--muted)] active:scale-95 focus:ring-[var(--primary)]/40',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
