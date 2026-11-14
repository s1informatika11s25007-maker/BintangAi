import React from 'react';

const Footer = ({ className = '' }) => {
  return (
    <footer className={`w-full bg-white border-t border-slate-100 py-4 px-6 md:px-12 text-slate-400 font-sans shrink-0 mt-auto ${className}`}>
      <div className="w-full flex items-center justify-between text-[11px] font-medium">
        <p>© {new Date().getFullYear()} BintangAi. Hak Cipta Dilindungi.</p>
        <div className="hidden sm:flex items-center gap-3 text-slate-400 font-bold">
          <span>Inklusi & AI</span>
          <span>•</span>
          <span>BintangAi</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
