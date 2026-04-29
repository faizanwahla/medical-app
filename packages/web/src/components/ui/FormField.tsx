import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
  className?: string;
}

/**
 * FormField Component - Standardized form field wrapper
 * Provides consistent styling, error handling, and accessibility
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  helperText,
  className = '',
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-700">
          {label}
          {required && <span className="text-error-600 ml-1">*</span>}
        </label>
        {error && (
          <span className="inline-flex items-center gap-1 text-sm text-error-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </span>
        )}
      </div>
      {children}
      {helperText && !error && (
        <p className="text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};
