import React, { useState } from 'react';
import {
  Heart,
  Home,
  CheckSquare,
  Mic,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  FileSignature,
  GitPullRequest,
  Cpu,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  isOffline,
  setIsOffline,
  offlineQueue,
  syncOfflineLedger,
  onLogout
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dynamic Navigation Items per Role
  const getNavItemsByRole = (role) => {
    switch (role) {
      case 'caregiver':
        return [
          { id: 'supervisor_dashboard', label: 'Beranda', icon: Home },
          { id: 'caregiver_pwa', label: 'Tugas Harian', icon: CheckSquare, badgeCount: 5 },
          { id: 'execution_trace', label: 'Observasi Suara', icon: Mic },
          { id: 'handover_contract', label: 'Kewajiban', icon: ShieldCheck },
          { id: 'audit_trail', label: 'Notifikasi', icon: Bell, badgeCount: 3 },
          { id: 'rule_library', label: 'Profil', icon: User }
        ];
      case 'supervisor':
        return [
          { id: 'supervisor_dashboard', label: 'Beranda Triage', icon: Home },
          { id: 'handover_contract', label: 'Serah Terima Shift', icon: FileSignature },
          { id: 'execution_trace', label: 'Execution Trace', icon: GitPullRequest },
          { id: 'simulator_lab', label: 'Simulator Lab P4', icon: Cpu },
          { id: 'audit_trail', label: 'Notifikasi & Audit', icon: Bell, badgeCount: 3 },
          { id: 'rule_library', label: 'Profil Supervisor', icon: User }
        ];
      case 'family':
        return [
          { id: 'family_portal', label: 'Beranda Wali', icon: Home },
          { id: 'supervisor_dashboard', label: 'Ringkasan Perawatan', icon: CheckSquare },
          { id: 'execution_trace', label: 'Kondisi Orang Tua', icon: Heart },
          { id: 'audit_trail', label: 'Notifikasi', icon: Bell, badgeCount: 1 },
          { id: 'rule_library', label: 'Profil Wali', icon: User }
        ];
      default: // admin_hr / orchestrator
        return [
          { id: 'supervisor_dashboard', label: 'Beranda Admin', icon: Home },
          { id: 'simulator_lab', label: 'Simulator P4 & HR', icon: Cpu },
          { id: 'rule_library', label: 'Aturan Panti', icon: BookOpen },
          { id: 'audit_trail', label: 'Notifikasi & Audit', icon: Bell, badgeCount: 2 },
          { id: 'family_portal', label: 'Profil Admin', icon: User }
        ];
    }
  };

  const navItems = getNavItemsByRole(activeRole);

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* 1. Mobile & Tablet Top Bar (Visible on screens < md) */}
      <div className="md:hidden bg-[#0c1a30] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800/80 shadow-md w-full">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-sky-600 rounded-lg text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="text-base font-black text-white tracking-tight">
            Sambung<span className="text-sky-400">Jaga</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition focus:outline-none"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden transition-opacity duration-300"
        ></div>
      )}

      {/* 3. Main Full-Height Sidebar (Sticky Desktop / Slide Drawer Mobile) */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0c1a30] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl shrink-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>

        {/* Top Scrollable Section */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-none flex-1 flex flex-col justify-start">

          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-600/30 shrink-0">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight block leading-tight">
                  Sambung<span className="text-sky-400">Jaga</span>
                </span>
                <span className="text-[10px] text-sky-300 font-bold block">Care System</span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2 pt-2 flex-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block text-left mb-2">
              Menu Utama
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-black'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badgeCount && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive ? 'bg-white text-sky-700' : 'bg-rose-600 text-white'
                    }`}>
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-[#091426] shrink-0">
          {/* P5 Offline Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isOffline && offlineQueue.length > 0) syncOfflineLedger();
              else setIsOffline(!isOffline);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isOffline ? `P5 Offline (${offlineQueue.length})` : 'Cloud Sync Online'}</span>
            </div>
            {isOffline && offlineQueue.length > 0 && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
