import React from 'react';

const Input = ({ label, error, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-sm font-medium text-primary">{label}</label>}
      <input aria-label={label}
        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
