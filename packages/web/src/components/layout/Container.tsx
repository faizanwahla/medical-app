import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Container component - Responsive wrapper with max-width constraints
 * Mobile: full width with padding
 * Tablet: max-width 96% with padding
 * Desktop: max-width 1200px centered
 */
export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  maxWidth = 'xl'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'w-full',
  };

  return (
    <div className={`
      w-full mx-auto px-4 md:px-6 lg:px-8
      ${maxWidthClasses[maxWidth]}
      ${className}
    `}>
      {children}
    </div>
  );
};
