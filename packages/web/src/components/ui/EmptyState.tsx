import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component - Consistent empty/error state display
 * Used when no data is available or errors occur
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-12 h-12" />,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-neutral-300 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2 text-center">{title}</h3>
      {description && (
        <p className="text-neutral-500 text-center max-w-sm mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            <Button
              variant="primary"
              size="md"
              onClick={action.onClick}
              loading={action.loading}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="md"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ErrorState Component - Specialized empty state for errors
 */
export const ErrorState: React.FC<Omit<EmptyStateProps, 'icon'>> = (props) => {
  return (
    <EmptyState
      icon={<AlertCircle className="w-12 h-12 text-error-600" />}
      {...props}
    />
  );
};
