import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
