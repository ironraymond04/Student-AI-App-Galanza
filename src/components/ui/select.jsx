// src/components/ui/select.jsx
import React, { useState } from "react";

export const Select = ({ children, onValueChange }) => {
  return <div className="inline-block relative">{children}</div>;
};

export const SelectTrigger = ({ children, className, ...props }) => {
  return (
    <button
      className={`border px-3 py-2 rounded w-full text-left ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder, children }) => {
  return <span>{children || placeholder}</span>;
};

export const SelectContent = ({ children }) => {
  return (
    <div className="absolute mt-1 w-full bg-white border rounded shadow z-10">
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children, onClick }) => {
  return (
    <div
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => {
        if (onClick) onClick(value);
      }}
    >
      {children}
    </div>
  );
};
