import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6 px-6 md:px-12 text-slate-500 font-sans shrink-0 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-black text-xs shadow-sm">
            B
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight">
            Bintang<span className="text-indigo-600">Ai</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">
            Platform Pembelajaran SD Inklusif
          </span>
        </div>

        <p className="text-slate-400 font-medium text-[11px]">
          © {new Date().getFullYear()} BintangAi. Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
