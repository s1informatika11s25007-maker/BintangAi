import React, { useState, useEffect } from 'react';
import {
  Heart,
  Home,
  CheckSquare,
  ShieldCheck,
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
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  isOffline,
  setIsOffline,
  offlineQueue,
  syncOfflineLedger,
  onLogout
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

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

  const rolesList = [
    { id: 'supervisor', title: 'Supervisor Klinis', icon: Shield, badge: 'A3 Gate' },
    { id: 'caregiver', title: 'Perawat / Caregiver', icon: User, badge: 'PWA' },
    { id: 'family', title: 'Portal Keluarga', icon: Heart, badge: 'PDP' },
    { id: 'admin_hr', title: 'Admin Panti & HR', icon: Cpu, badge: 'P4 Lab' }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const handleRoleSelect = (roleId) => {
    if (setActiveRole) {
      setActiveRole(roleId);
    }
    setRoleMenuOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Top Header Bar (< md) */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-md w-full">
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

      {/* 3. Main Dynamic Collapsible Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 md:top-auto md:left-auto z-50 md:z-30 h-screen md:h-auto md:min-h-full bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out shadow-2xl shrink-0 ${
        isCollapsed ? 'md:w-20' : 'md:w-64'
      } ${
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="md:sticky md:top-0 h-screen flex flex-col justify-between w-full overflow-hidden">

          {/* Top Scrollable Section - Padat tanpa gap berlebihan (justify-start) */}
          <div className="p-3.5 space-y-4 overflow-y-auto scrollbar-none flex-1 flex flex-col justify-start">

            {/* Brand Header & Rail Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl text-white shadow-md shadow-sky-600/30 shrink-0">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                {(!isCollapsed || mobileOpen) && (
                  <div className="min-w-0">
                    <span className="text-lg font-black text-white tracking-tight block leading-tight truncate">
                      Sambung<span className="text-sky-400">Jaga</span>
                    </span>
                    <span className="text-[10px] text-sky-300 font-bold block">Care Superagent</span>
                  </div>
                )}
              </div>

              {/* Desktop Expand/Collapse Rail Toggle */}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                title={isCollapsed ? "Perluas Sidebar" : "Lipat Sidebar (Mode Rail)"}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-sky-400" /> : <ChevronLeft className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Switcher Pill in Sidebar */}
            {(!isCollapsed || mobileOpen) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left hover:border-sky-500/50 transition duration-200 group"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Peran Perangkat</span>
                      <span className="text-xs font-black text-white truncate block capitalize">
                        {rolesList.find(r => r.id === activeRole)?.title || activeRole}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleMenuOpen ? 'rotate-180 text-sky-400' : ''}`} />
                </button>

                {/* Role Dropdown Options */}
                {roleMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in">
                    {rolesList.map(r => {
                      const RIcon = r.icon;
                      const isSelected = activeRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRoleSelect(r.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition text-left ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-md'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <RIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{r.title}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {r.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1.5 text-left">
              {(!isCollapsed || mobileOpen) && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
                  Navigasi Utama
                </span>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed && !mobileOpen ? `${item.label} (${item.desc})` : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed && !mobileOpen ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-xs font-bold transition duration-200 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 font-black'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-md"></span>
                    )}

                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-300'
                      }`} />

                      {(!isCollapsed || mobileOpen) && (
                        <div className="min-w-0 text-left">
                          <span className="truncate block font-bold leading-tight">{item.label}</span>
                          <span className={`text-[10px] truncate block font-normal ${isActive ? 'text-sky-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                      )}
                    </div>

                    {(!isCollapsed || mobileOpen) && item.badgeCount && (
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

            {/* Dynamic System Status Card */}
            {(!isCollapsed || mobileOpen) && (
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-left shrink-0 mt-2">
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
            )}

          </div>

          {/* Bottom Footer Actions */}
          <div className={`p-3 border-t border-slate-800 space-y-2 bg-slate-950/90 shrink-0 ${
            isCollapsed && !mobileOpen ? 'flex flex-col items-center' : ''
          }`}>
            {/* P5 Offline Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (isOffline && offlineQueue.length > 0) syncOfflineLedger();
                else setIsOffline(!isOffline);
              }}
              title={isCollapsed && !mobileOpen ? (isOffline ? `P5 Offline (${offlineQueue.length})` : 'Cloud Sync Online') : undefined}
              className={`w-full flex items-center ${
                isCollapsed && !mobileOpen ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              } rounded-xl text-xs font-bold transition border ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                {(!isCollapsed || mobileOpen) && (
                  <span>{isOffline ? `P5 Offline (${offlineQueue.length})` : 'Cloud Sync Online'}</span>
                )}
              </div>
              {(!isCollapsed || mobileOpen) && isOffline && offlineQueue.length > 0 && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              )}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              title={isCollapsed && !mobileOpen ? "Keluar Sesi" : undefined}
              className={`w-full flex items-center justify-center space-x-2 ${
                isCollapsed && !mobileOpen ? 'p-2.5' : 'px-3.5 py-2.5'
              } rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/30 transition`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {(!isCollapsed || mobileOpen) && <span>Keluar Sesi</span>}
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
