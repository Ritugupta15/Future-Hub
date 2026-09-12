import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  size = 'default',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]'
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
