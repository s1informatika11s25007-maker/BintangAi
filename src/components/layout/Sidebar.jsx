import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  FileCheck2,
  Activity,
  HeartHandshake,
  Cpu,
  BookOpen,
  ClipboardList,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  UserCheck
} from 'lucide-react';
import { fetchDemoAccountsPerRole, ROLE_LABELS } from '../../services/dashboard/staffService';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  currentUser,
  isOffline,
  setIsOffline,
  offlineQueue = [],
  syncOfflineLedger,
  onLogout
}) {
  const menuItems = [
    { id: 'supervisor_dashboard', label: 'Supervisor Dashboard', icon: LayoutDashboard, roles: ['supervisor', 'caregiver', 'admin_hr'] },
    { id: 'caregiver_pwa', label: 'PWA Perawat Mobile', icon: Smartphone, roles: ['caregiver', 'supervisor'] },
    { id: 'handover_contract', label: 'Serah Terima Shift', icon: FileCheck2, roles: ['supervisor', 'caregiver'] },
    { id: 'execution_trace', label: 'Execution Trace', icon: Activity, roles: ['supervisor', 'caregiver', 'admin_hr'] },
    { id: 'family_portal', label: 'Portal Keluarga', icon: HeartHandshake, roles: ['family', 'supervisor'] },
    { id: 'simulator_lab', label: 'Simulator Lab P4', icon: Cpu, roles: ['admin_hr', 'supervisor'] },
    { id: 'rule_library', label: 'Aturan Panti', icon: BookOpen, roles: ['supervisor', 'admin_hr'] },
    { id: 'audit_trail', label: 'Notifikasi & Audit', icon: ClipboardList, roles: ['supervisor', 'admin_hr'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-sky-500/30">
            SJ
          </div>
          <div>
            <h2 className="font-black text-base text-white tracking-tight">SambungJaga AI</h2>
            <p className="text-[10px] text-sky-400 font-bold tracking-wide uppercase">Feature-First Architecture</p>
          </div>
        </div>

        {/* Offline / Online Ledger Indicator */}
        <div className="px-2">
          <div className={`p-3 rounded-xl border text-xs space-y-2 ${
            isOffline ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-300'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center space-x-1.5">
                {isOffline ? <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                <span>{isOffline ? 'P5 Offline Mode' : 'Cloud Sync Online'}</span>
              </span>
              {offlineQueue.length > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {offlineQueue.length} Pending
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIsOffline(!isOffline)}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold underline"
              >
                {isOffline ? 'Hubungkan Online' : 'Simulasi Offline'}
              </button>
              {offlineQueue.length > 0 && (
                <button
                  onClick={syncOfflineLedger}
                  className="text-[10px] bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded font-bold transition flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync P5</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Navigasi Utama</p>
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Account Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt="User Avatar"
            className="w-8 h-8 rounded-lg object-cover border border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-white truncate">{currentUser?.name || currentUser?.full_name || 'Ns. Ratna Sari'}</p>
            <p className="text-[10px] text-slate-400 truncate">{ROLE_LABELS[activeRole]}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
