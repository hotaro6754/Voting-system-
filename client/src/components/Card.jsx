import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('glass-card p-6 bg-white', className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
