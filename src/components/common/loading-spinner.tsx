import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}  aria-label='loading' data-testid="loading-spinner">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-primary-600`}
        aria-label="Loading"
      />
    </div>
  );
}