import React from 'react';

export const Button = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const base = 'px-4 py-2 rounded font-medium transition-colors cursor:pointer';
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 cursor:pointer',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 cursor:pointer',
    destructive: 'border border-red-600 bg-red-600 text-white hover:bg-red-700 cursor:pointer',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
