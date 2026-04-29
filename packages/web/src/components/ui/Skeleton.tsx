import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton Component - Placeholder during content loading
 * Provides better UX than spinners alone
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = 'h-4 w-full',
  count = 1
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            bg-neutral-200 animate-pulse rounded-md
            ${className}
            ${i > 0 ? 'mt-2' : ''}
          `}
        />
      ))}
    </>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

/**
 * SkeletonTable - Loading state for table data
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-10 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  count?: number;
}

/**
 * SkeletonCard - Loading state for card components
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`border border-neutral-200 rounded-lg p-4 ${i > 0 ? 'mt-4' : ''}`}>
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </>
  );
};
