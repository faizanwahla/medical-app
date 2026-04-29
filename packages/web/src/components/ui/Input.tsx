import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

/**
 * Input Component - Standardized input with optional icon and error state
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, helperText, className = '', ...props }, ref) => {
    return (
      <>
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-medical-500 transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 md:py-3
              ${icon ? 'pl-11' : ''}
              bg-white border rounded-lg text-sm md:text-base
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
          />
        </div>
        {helperText && (
          <p className={`text-xs mt-1 ${error ? 'text-error-600' : 'text-neutral-500'}`}>
            {helperText}
          </p>
        )}
      </>
    );
  }
);

Input.displayName = 'Input';
