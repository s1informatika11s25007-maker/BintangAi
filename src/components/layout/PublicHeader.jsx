import React from 'react';
import { Heart, LogIn, UserPlus } from 'lucide-react';

export default function PublicHeader({ onGoToLogin, onGoToRegister, onGoToLanding }) {
  return (
    <header className="bg-white/95 border-b border-slate-200/90 px-6 py-4 sticky top-0 z-40 backdrop-blur-md shadow-xs w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand Logo */}
        <div
          onClick={onGoToLanding}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Sambung<span className="text-sky-600">Jaga</span>
          </span>
        </div>

        {/* Navigation Menu Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-600">
          <a href="#fitur" className="hover:text-sky-600 transition">Fitur Utama</a>
          <a href="#cara-kerja" className="hover:text-sky-600 transition">Cara Kerja</a>
          <a href="#testimoni" className="hover:text-sky-600 transition">Testimoni</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onGoToLogin}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition border border-slate-200"
          >
            <LogIn className="w-3.5 h-3.5 text-sky-600" />
            <span>Masuk</span>
          </button>

          <button
            onClick={onGoToRegister}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
        </div>

      </div>
    </header>
  );
}
