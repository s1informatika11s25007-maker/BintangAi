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
  RefreshCw,
  Activity,
  CheckCircle2
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
          { id: 'caregiver_pwa', label: 'Tugas Harian', desc: 'Aksi & Voice STT Capture', icon: CheckSquare, badgeCount: 5 },
          { id: 'handover_contract', label: 'Serah Terima Shift', desc: 'Kontrak Handover Dua Sisi', icon: FileSignature }
        ];
      case 'supervisor':
        return [
          { id: 'supervisor_dashboard', label: 'Beranda Triage', desc: 'Pengawasan Klinis & A3', icon: Home },
          { id: 'handover_contract', label: 'Serah Terima Shift', desc: 'Kontrak Shift Dua Sisi', icon: FileSignature },
          { id: 'execution_trace', label: 'Execution Trace', desc: 'Inspeksi Alur Keputusan AI', icon: GitPullRequest },
          { id: 'rule_library', label: 'Aturan Panti', desc: 'Protokol & Library Aturan', icon: BookOpen },
          { id: 'audit_trail', label: 'Audit Trail', desc: 'Log Aset SHA-256', icon: ShieldCheck }
        ];
      case 'family':
        return [
          { id: 'family_portal', label: 'Beranda Wali', desc: 'Pemantauan Kondisi Pasien', icon: Home }
        ];
      case 'admin_hr':
      default:
        return [
          { id: 'simulator_lab', label: 'Simulator Lab P4', desc: 'Analisis Kegagalan & HR', icon: Cpu },
          { id: 'rule_library', label: 'Aturan Panti', desc: 'Manajemen Kebijakan', icon: BookOpen },
          { id: 'audit_trail', label: 'Audit Trail', desc: 'Log Aktivitas Sistem', icon: ShieldCheck }
        ];
    }
  };

  const navItems = getNavItemsByRole(activeRole);

  const roleTitles = {
    supervisor: 'Mode Supervisor Klinis',
    caregiver: 'Mode Perawat / Pengasuh',
    family: 'Mode Portal Keluarga',
    admin_hr: 'Mode Admin Panti & HR'
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* 1. Mobile & Tablet Top Header Bar (< md) */}
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

      {/* 3. Main Full-Height Dynamic Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 md:top-auto md:left-auto z-50 md:z-30 h-screen md:h-auto md:min-h-full w-64 bg-[#0c1a30] text-slate-300 transition-transform duration-300 ease-in-out shadow-2xl shrink-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="md:sticky md:top-0 h-screen flex flex-col justify-between w-full overflow-hidden">
          {/* Top & Middle Scrollable Content Container */}
          <div className="p-5 space-y-5 overflow-y-auto scrollbar-none flex-1 flex flex-col justify-between">

            {/* Top Section */}
            <div className="space-y-4">

              {/* Brand Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 shrink-0">
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

              {/* Navigation Menu Links */}
              <nav className="space-y-1.5 pt-1 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
                  Navigasi Utama
                </span>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 relative group ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-black'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      {/* Active Accent Left Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-md"></span>
                      )}

                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        <div className="min-w-0 text-left">
                          <span className="truncate block font-bold leading-tight">{item.label}</span>
                          <span className={`text-[10px] truncate block font-normal ${isActive ? 'text-sky-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {item.badgeCount && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ml-1 ${
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

            {/* Dynamic System Status Card (Fills Vertical Space Smoothly) */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-left shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Status Perangkat
              </span>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Graf Bitemporal:</span>
                  <span className="text-emerald-400 font-bold font-mono">Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verifikasi Bukti:</span>
                  <span className="text-sky-400 font-bold font-mono">OK</span>
                </div>
              </div>
            </div>

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
        </div>
      </aside>
    </>
  );
}
