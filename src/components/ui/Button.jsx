import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100",
    secondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    outline: "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
