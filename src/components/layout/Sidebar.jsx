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
  Users,
  Cpu,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  Search
} from 'lucide-react';
import { ACTORS } from '../../types/architecture';

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

  // Role-specific navigation items matching reference image layout
  const getNavItemsByRole = (role) => {
    switch (role) {
      case 'caregiver':
        return [
          { id: 'supervisor_dashboard', label: 'Beranda', icon: Home },
          { id: 'caregiver_pwa', label: 'Tugas Harian', icon: CheckSquare, badge: '5' },
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
          { id: 'audit_trail', label: 'Audit Trail [A]', icon: Bell, badgeCount: 3 },
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
          { id: 'audit_trail', label: 'Audit Log [A]', icon: Bell, badgeCount: 2 },
          { id: 'family_portal', label: 'Profil Admin', icon: User }
        ];
    }
  };

  const navItems = getNavItemsByRole(activeRole);

  // Profile info per role matching reference
  const roleProfiles = {
    supervisor: { name: 'Ns. Ratna Sari, M.Kep', roleTitle: 'Supervisor Panti', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' },
    caregiver: { name: 'Rina Sari, Amd.Kep', roleTitle: 'Pengasuh / Perawat', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7890f?auto=format&fit=crop&w=120&q=80' },
    family: { name: 'Rina Wijaya', roleTitle: 'Wali Ibu Hj. Aminah', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80' },
    admin_hr: { name: 'Budi Santoso', roleTitle: 'Admin Panti / HR', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80' }
  };

  const currentProfile = roleProfiles[activeRole] || roleProfiles.supervisor;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Bar */}
      <div className="md:hidden bg-[#0c1a30] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-sky-600 rounded-lg text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="text-base font-black text-white">Sambung<span className="text-sky-400">Jaga</span></span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-800 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Main Left Sidebar matching reference image (#0c1a30 dark navy) */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0c1a30] text-slate-300 flex flex-col justify-between transition-transform duration-200 shadow-2xl shrink-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>

        <div className="p-6 space-y-6">
          {/* Logo Brand matching reference */}
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-600/30">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Sambung<span className="text-sky-400">Jaga</span>
            </span>
          </div>

          {/* User Profile Info Card matching reference */}
          <div className="flex items-center space-x-3 pt-2 pb-4 border-b border-slate-800/80">
            <img
              src={currentProfile.avatar}
              alt={currentProfile.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-sky-500/80 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{currentProfile.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">{currentProfile.roleTitle}</p>
            </div>
          </div>

          {/* Navigation Links matching reference */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-black'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badgeCount && (
                    <span className="bg-rose-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-[#091426]">
          {/* P5 Offline Toggle */}
          <button
            onClick={() => {
              if (isOffline && offlineQueue.length > 0) syncOfflineLedger();
              else setIsOffline(!isOffline);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition border ${
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
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
