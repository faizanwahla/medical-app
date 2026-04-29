import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  error?: boolean;
  options?: { value: string; label: string }[];
}

/**
 * Select Component - Standardized select/dropdown with optional icon
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ icon, error, options, className = '', children, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-medical-500 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 md:py-3
            ${icon ? 'pl-11' : ''}
            bg-white border rounded-lg text-sm md:text-base
            appearance-none cursor-pointer
            transition-all duration-200
            focus:outline-none
            ${error
              ? 'border-error-500 focus:border-error-600 focus:ring-2 focus:ring-error-100'
              : 'border-neutral-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-100'
            }
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {children}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:text-medical-500 transition-colors" />
      </div>
    );
  }
);

Select.displayName = 'Select';
