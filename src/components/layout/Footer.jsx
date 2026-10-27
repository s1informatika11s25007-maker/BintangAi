import React from 'react';
import { Shield, Lock, FileCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-6 px-4 text-xs mt-12 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-slate-800">SambungJaga AI Superagent Architecture</span>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-slate-500">Versi Final 2026</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] font-medium">
          <span className="flex items-center text-slate-600">
            <Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PostgreSQL RLS Protected
          </span>
          <span className="flex items-center text-slate-600">
            <FileCode className="w-3.5 h-3.5 mr-1 text-sky-600" /> Bitemporal Obligation Kernel (P1–P6)
          </span>
        </div>
      </div>
    </footer>
  );
}
