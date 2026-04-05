const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeMap[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;
