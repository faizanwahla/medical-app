import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
}

/**
 * Textarea Component - Standardized textarea with error state support
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, helperText, className = '', ...props }, ref) => {
    return (
      <>
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 md:py-3
            bg-white border rounded-lg text-sm md:text-base
            transition-all duration-200
            focus:outline-none
            resize-vertical
            ${error
              ? 'border-error-500 focus:border-error-600 focus:ring-2 focus:ring-error-100'
              : 'border-neutral-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-100'
            }
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {helperText && (
          <p className={`text-xs mt-1 ${error ? 'text-error-600' : 'text-neutral-500'}`}>
            {helperText}
          </p>
        )}
      </>
    );
  }
);

Textarea.displayName = 'Textarea';
