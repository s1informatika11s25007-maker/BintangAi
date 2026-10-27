import React from 'react';
import { Heart, Shield, LogIn, UserPlus } from 'lucide-react';

export default function PublicHeader({ onGoToLanding, onGoToLogin, onGoToRegister }) {
  return (
    <header className="bg-white/95 border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
        {/* Brand Logo matching reference */}
        <div
          onClick={onGoToLanding}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition flex items-center justify-center">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-black text-sky-900 tracking-tight">
            Sambung<span className="text-sky-600">.Jaga</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
          <button onClick={onGoToLanding} className="hover:text-sky-600 transition">Beranda</button>
          <a href="#fitur" className="hover:text-sky-600 transition">Fitur</a>
          <a href="#cara-kerja" className="hover:text-sky-600 transition">Tentang Kami</a>
          <a href="#testimoni" className="hover:text-sky-600 transition">Kontak</a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onGoToLogin}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition"
          >
            Masuk
          </button>

          <button
            onClick={onGoToRegister}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition"
          >
            Daftar
          </button>
        </div>
      </div>
    </header>
  );
}
