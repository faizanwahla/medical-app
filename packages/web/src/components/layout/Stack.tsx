import React from 'react';

interface StackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  fullWidth?: boolean;
}

const spacingMap = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

/**
 * Stack component - Flexible layout component for rows and columns
 * Combines flex display with consistent spacing
 */
export const Stack: React.FC<StackProps> = ({
  children,
  className = '',
  direction = 'col',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  fullWidth = false,
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';

  return (
    <div className={`
      flex ${directionClass}
      ${spacingMap[spacing]}
      ${alignMap[align]}
      ${justifyMap[justify]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
