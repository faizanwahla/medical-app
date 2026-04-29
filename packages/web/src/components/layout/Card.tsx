import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

const paddingMap = {
  sm: 'p-3 md:p-4',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

const shadowMap = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

/**
 * Card component - Reusable card container with consistent styling
 * Features: padding, shadows, hover effects, responsive design
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border border-neutral-200 bg-white
        ${paddingMap[padding]}
        ${shadowMap[shadow]}
        transition-all duration-200
        ${hoverable ? 'hover:shadow-lg hover:border-medical-300 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
