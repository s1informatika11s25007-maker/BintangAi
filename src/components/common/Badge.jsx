import React from 'react';

export default function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    info: 'bg-sky-50 text-sky-800 border-sky-300 font-bold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    warning: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    danger: 'bg-rose-50 text-rose-900 border-rose-300 font-bold',
    kernel: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    neutral: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
}
