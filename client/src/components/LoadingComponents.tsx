import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Loading Spinner Component
interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary';
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        'loading-spinner',
        size === 'sm' && 'loading-spinner-sm',
        size === 'lg' && 'loading-spinner-lg', 
        size === 'xl' && 'loading-spinner-xl',
        className
      )}
      {...props}
    />
  );
}

// Dot Loading Animation
export function LoadingDots({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('loading-dots', className)} {...props}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

// Skeleton Loading Components
export function SkeletonLine({ 
  variant = 'full',
  className,
  ...props 
}: {
  variant?: 'full' | 'short' | 'medium';
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'skeleton-line',
        variant === 'short' && 'skeleton-line-short',
        variant === 'medium' && 'skeleton-line-medium',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonAvatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-avatar', className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-card', className)} {...props} />;
}

export function SkeletonButton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton-button', className)} {...props} />;
}

// Progress Components
interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
}

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  indeterminate = false,
  className,
  ...props 
}: ProgressBarProps) {
  if (indeterminate) {
    return <div className={cn('progress-bar-indeterminate', className)} {...props} />;
  }

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('progress-bar', className)} {...props}>
      <div 
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Progress Circle Component
export function ProgressCircle({ 
  value = 0, 
  max = 100,
  size = 32,
  strokeWidth = 4,
  className,
  ...props 
}: {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
} & HTMLAttributes<HTMLDivElement>) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={cn('progress-circle', className)} 
      style={{ width: size, height: size }}
      {...props}
    >
      <svg className="progress-circle-svg" width={size} height={size}>
        <circle
          className="progress-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

// Loading Card Placeholder
export function LoadingCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card-loading', className)} {...props}>
      <div className="card-loading-content">
        <div className="card-loading-header" />
        <div className="card-loading-body">
          <SkeletonLine />
          <SkeletonLine variant="medium" />
          <SkeletonLine variant="short" />
        </div>
      </div>
    </div>
  );
}

// Shimmer Effect Wrapper
export function ShimmerWrapper({ 
  children, 
  className, 
  ...props 
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('shimmer-overlay', className)} {...props}>
      {children}
    </div>
  );
}

// Loading Button Component
interface LoadingButtonProps extends HTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function LoadingButton({ 
  loading = false,
  variant = 'primary',
  disabled = false,
  className,
  children,
  ...props 
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        loading && variant === 'primary' && 'btn-loading',
        loading && variant === 'secondary' && 'btn-secondary-loading',
        !loading && variant === 'primary' && 'btn-primary',
        !loading && variant === 'secondary' && 'btn-secondary',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Table Loading Skeleton
export function TableLoadingSkeleton({ 
  rows = 5, 
  columns = 4,
  className,
  ...props 
}: {
  rows?: number;
  columns?: number;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLine 
              key={colIndex} 
              variant={colIndex === 0 ? 'short' : 'medium'} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Form Loading Skeleton
export function FormLoadingSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="space-y-2">
        <SkeletonLine variant="short" />
        <SkeletonButton />
      </div>
      <div className="space-y-2">
        <SkeletonLine variant="short" />
        <SkeletonButton />
      </div>
      <div className="space-y-2">
        <SkeletonLine variant="short" />
        <SkeletonButton />
      </div>
      <div className="flex justify-end gap-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}