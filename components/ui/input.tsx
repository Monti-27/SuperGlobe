import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white shadow-sm shadow-black/5 transition-[border-color,background-color,box-shadow] placeholder:text-white/28 focus-visible:border-white/20 focus-visible:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/8 disabled:cursor-not-allowed disabled:opacity-50',
          type === 'search' &&
            '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
          type === 'file' &&
            'p-0 pr-3 italic text-white/32 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-white/10 file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-white',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
