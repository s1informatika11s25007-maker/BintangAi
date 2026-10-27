import React from 'react';
import { Shield, LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function PublicHeader({ onGoToLanding, onGoToLogin, onGoToRegister }) {
  return (
    <header className="bg-white/95 border-b border-slate-200/90 sticky top-0 z-40 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
        {/* Public Logo */}
        <div
          onClick={onGoToLanding}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">SambungJaga AI</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                Care Superagent
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block font-medium">
              Evidence-Verified Care Continuity Architecture
            </p>
          </div>
        </div>

        {/* Auth Navigation Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onGoToLogin}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition"
          >
            <LogIn className="w-3.5 h-3.5 text-sky-600" />
            <span>Masuk / Login</span>
          </button>

          <button
            onClick={onGoToRegister}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar / Register</span>
          </button>
        </div>
      </div>
    </header>
  );
}
