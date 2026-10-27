import React from 'react';
import { Shield, Wifi, WifiOff, RefreshCw, UserCheck, Activity, LogOut } from 'lucide-react';
import { ACTORS, CORE_INNOVATIONS } from '../../types/architecture';

export default function Header({ activeRole, setActiveRole, isOffline, setIsOffline, offlineQueue, syncOfflineLedger, onLogout }) {
  const currentActor = ACTORS.find(a => a.id === activeRole) || ACTORS[0];

  return (
    <header className="bg-white/95 border-b border-slate-200/90 sticky top-0 z-40 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Logo & System Name */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-wide">SambungJaga AI</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Terautentikasi: {currentActor.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Evidence-Verified Care Continuity Superagent Architecture
            </p>
          </div>
        </div>

        {/* Status Indicators, Role Selector & Logout */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Offline/Online PWA Toggle */}
          <button
            onClick={() => {
              if (isOffline && offlineQueue.length > 0) {
                syncOfflineLedger();
              } else {
                setIsOffline(!isOffline);
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isOffline
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isOffline ? `P5 Offline (${offlineQueue.length})` : 'Online Supabase'}</span>
            {isOffline && offlineQueue.length > 0 && <RefreshCw className="w-3 h-3 ml-1 animate-spin text-amber-600" />}
          </button>

          {/* Active Role Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-transparent text-xs text-sky-700 font-bold focus:outline-none cursor-pointer pr-1"
            >
              {ACTORS.map(actor => (
                <option key={actor.id} value={actor.id} className="bg-white text-slate-900">
                  {actor.title}
                </option>
              ))}
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Keluar dari Sesi"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* P1-P6 Core Innovation Ticker */}
      <div className="bg-slate-50/90 border-t border-slate-200/90 px-4 py-1.5 overflow-x-auto text-[11px] text-slate-600 flex items-center space-x-4 whitespace-nowrap scrollbar-none">
        <span className="font-bold text-sky-700 flex items-center">
          <Activity className="w-3 h-3 mr-1 text-sky-600" /> Kernel Inovasi Inti:
        </span>
        {CORE_INNOVATIONS.map(inn => (
          <span key={inn.code} className="inline-flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
            <span className="font-bold text-amber-600">{inn.code}:</span>
            <span className="text-slate-700 font-medium">{inn.title}</span>
          </span>
        ))}
      </div>
    </header>
  );
}
