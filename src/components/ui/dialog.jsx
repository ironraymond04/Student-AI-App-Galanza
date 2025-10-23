import React from "react";


export const Dialog = ({ children, open = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 max-w-lg w-full ${className}`}>
      {children}
    </div>
  );
};


export const DialogHeader = ({ children, className = "" }) => {
  return <div className={`mb-2 ${className}`}>{children}</div>;
};


export const DialogTitle = ({ children, className = "" }) => {
  return <h2 className={`text-lg font-bold ${className}`}>{children}</h2>;
};


export const DialogFooter = ({ children, className = "" }) => {
  return <div className={`mt-4 flex justify-end gap-2 ${className}`}>{children}</div>;
};
