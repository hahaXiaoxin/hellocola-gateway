interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} rounded-full border-primary-200 border-t-primary-500 animate-spin`}
      />
    </div>
  );
}

export default LoadingSpinner;
