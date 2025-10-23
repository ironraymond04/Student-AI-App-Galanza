import React from "react";

export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
