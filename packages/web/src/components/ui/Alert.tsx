import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  className?: string;
}

const variantConfig = {
  success: {
    bgClass: 'bg-success-50',
    borderClass: 'border-success-200',
    titleClass: 'text-success-900',
    messageClass: 'text-success-700',
    icon: CheckCircle,
    iconClass: 'text-success-600',
  },
  error: {
    bgClass: 'bg-error-50',
    borderClass: 'border-error-200',
    titleClass: 'text-error-900',
    messageClass: 'text-error-700',
    icon: AlertCircle,
    iconClass: 'text-error-600',
  },
  warning: {
    bgClass: 'bg-warning-50',
    borderClass: 'border-warning-200',
    titleClass: 'text-warning-900',
    messageClass: 'text-warning-700',
    icon: AlertTriangle,
    iconClass: 'text-warning-600',
  },
  info: {
    bgClass: 'bg-info-50',
    borderClass: 'border-info-200',
    titleClass: 'text-info-900',
    messageClass: 'text-info-700',
    icon: Info,
    iconClass: 'text-info-600',
  },
};

/**
 * Alert Component - Consistent messaging for success, error, warning, and info states
 */
export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  onClose,
  dismissible = true,
  className = '',
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 p-4
        rounded-lg border
        ${config.bgClass} ${config.borderClass}
        ${className}
      `}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={`font-semibold text-sm mb-1 ${config.titleClass}`}>
            {title}
          </h3>
        )}
        <p className={`text-sm ${config.messageClass}`}>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
