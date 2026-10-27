import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  LayoutDashboard,
  FileSignature,
  GitPullRequest,
  Users,
  Cpu,
  BookOpen,
  ShieldAlert,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  LogOut,
  Menu,
  X,
  CheckCircle2
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

  const navGroups = [
    {
      groupTitle: 'MODUL UTAMA',
      items: [
        { id: 'caregiver_pwa', label: 'Pengasuh PWA Mobile', icon: Smartphone, badge: 'P5' },
        { id: 'supervisor_dashboard', label: 'Dashboard Supervisor', icon: LayoutDashboard, badge: 'P1-P3' },
        { id: 'handover_contract', label: 'Serah Terima Shift', icon: FileSignature, badge: 'Dual' },
      ]
    },
    {
      groupTitle: 'SISTEM & AUDIT',
      items: [
        { id: 'execution_trace', label: 'Execution Trace Viewer', icon: GitPullRequest, badge: 'Trace' },
        { id: 'family_portal', label: 'Family Portal', icon: Users, badge: 'PDP' },
        { id: 'simulator_lab', label: 'Simulator P4 & Lab', icon: Cpu, badge: 'P4' },
        { id: 'rule_library', label: 'Rule Library', icon: BookOpen, badge: 'v2.1' },
        { id: 'audit_trail', label: 'Audit Trail [A]', icon: ShieldAlert, badge: 'SHA256' },
      ]
    }
  ];

  // Specific profile metadata per logged-in role
  const roleProfiles = {
    supervisor: { name: 'Ns. Ratna Sari, M.Kep', title: 'Supervisor Klinis', badge: 'A3 Authority', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    caregiver: { name: 'Suster Dewi Pertiwi', title: 'Pengasuh / Perawat', badge: 'Shift Pagi', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    family: { name: 'Wali Ibu Hj. Aminah', title: 'Keluarga Pasien', badge: 'Consent PDP', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    admin_hr: { name: 'Admin Panti & HR', title: 'Pengelola SDM', badge: 'P4 Simulator', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    orchestrator: { name: 'Care Superagent AI', title: 'Orchestrator Kernel', badge: 'System Master', color: 'bg-sky-100 text-sky-900 border-sky-300' }
  };

  const currentProfile = roleProfiles[activeRole] || roleProfiles.supervisor;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar with Hamburger Menu */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-600 rounded-xl text-white shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900">SambungJaga AI</h1>
            <p className="text-[10px] text-slate-500 font-medium">{currentProfile.name}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 shadow-xl md:shadow-none shrink-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Top Header Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-md shadow-sky-500/20 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">SambungJaga AI</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                Superagent Kernel
              </span>
            </div>
          </div>
        </div>

        {/* STATIC USER PROFILE CARD (No Dropdown - Matched to Logged-in User) */}
        <div className="px-4 py-3 mx-4 my-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-1.5 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-600 text-white font-bold shrink-0 shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">{currentProfile.name}</h4>
              <p className="text-[10px] text-slate-500 font-semibold truncate">{currentProfile.title}</p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px]">
            <span className={`px-2 py-0.5 rounded-full font-bold border ${currentProfile.color}`}>
              {currentProfile.badge}
            </span>
            <span className="text-emerald-700 font-bold flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Terautentikasi
            </span>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 scrollbar-none">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                {group.groupTitle}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isActive ? 'bg-sky-700/60 text-sky-100' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions: P5 Offline Toggle & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {/* Offline/Online PWA Toggle */}
          <button
            onClick={() => {
              if (isOffline && offlineQueue.length > 0) {
                syncOfflineLedger();
              } else {
                setIsOffline(!isOffline);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition border ${
              isOffline
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isOffline ? `P5 Offline (${offlineQueue.length})` : 'Cloud Sync Online'}</span>
            </div>
            {isOffline && offlineQueue.length > 0 && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Keluar dari Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
