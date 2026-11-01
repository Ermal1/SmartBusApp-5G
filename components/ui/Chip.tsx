'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
  variant?: 'default' | 'primary';
}

export default function Chip({
  active = false,
  variant = 'default',
  className = '',
  children,
  ...props
}: ChipProps) {
  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // All chips use soft pastel backgrounds - equal visual weight, no highlighting
  const variantClasses = {
    default: 'bg-[#FDF2D8] border-[rgba(0,0,0,0.06)] text-gray-700 hover:bg-[#FFF8E8]',
    primary: 'bg-[#FDF2D8] border-[rgba(0,0,0,0.06)] text-gray-700 hover:bg-[#FFF8E8]',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} focus:ring-gray-300/40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
