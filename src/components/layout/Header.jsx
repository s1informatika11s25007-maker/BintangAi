import React, { useState, useEffect } from 'react';
import { Bell, Heart, Shield, User, LogOut, X, Sparkles, Check } from 'lucide-react';
import { fetchDemoAccountsPerRole, ROLE_LABELS } from '../../services/dashboard/staffService';

export default function Header({
  activeRole,
  currentUser,
  notifications = [],
  onDeleteNotification,
  onClearRoleNotifications,
  userAvatar,
  setUserAvatar,
  onLogout
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  useEffect(() => {
    async function loadAccounts() {
      const accs = await fetchDemoAccountsPerRole();
      setAvailableAccounts(accs);
    }
    loadAccounts();
  }, []);

  const roleNotifications = notifications.filter(n => n.recipient_role === activeRole || n.recipient_role === 'all');
  const unreadCount = roleNotifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 transition">
      <div className="flex items-center justify-between">
        {/* Left Branding Mobile */}
        <div className="flex items-center space-x-3 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight">SambungJaga AI</h1>
            <p className="text-[10px] text-sky-600 font-bold">Feature-First Architecture</p>
          </div>
        </div>

        {/* Desktop Search / Status Title */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Ekosistem Tata Kelola Perawatan Lansia Terverifikasi</span>
        </div>

        {/* Right Action Icons & User Avatar */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative focus:outline-none"
              title="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fade-in text-slate-900">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-xs text-slate-900">Notifikasi Aktivitas ({roleNotifications.length})</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onClearRoleNotifications?.(activeRole)}
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-bold"
                    >
                      Bersihkan
                    </button>
                    <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {roleNotifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada notifikasi baru.</p>
                  ) : (
                    roleNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 relative group ${
                          n.type === 'urgent'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : n.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px]">{n.title}</span>
                          <button
                            onClick={() => onDeleteNotification?.(n.id)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] opacity-90">{n.message}</p>
                        <p className="text-[9px] opacity-60 font-mono">
                          {new Date(n.created_at || Date.now()).toLocaleTimeString('id-ID')} WIB
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Modal Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none border border-slate-200/80"
            title="Pengaturan Profil"
          >
            <img
              src={userAvatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt="User Avatar"
              className="w-7 h-7 rounded-lg object-cover border border-slate-300"
            />
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {currentUser?.name || currentUser?.full_name || ROLE_LABELS[activeRole]}
            </span>
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      {isProfileOpen && (
        <div
          onClick={() => setIsProfileOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-slate-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Profil Pengguna</h3>
              <button onClick={() => setIsProfileOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <img
                src={userAvatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt="Avatar Large"
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-sky-500 shadow-md"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {currentUser?.name || currentUser?.full_name || 'Ns. Ratna Sari, M.Kep'}
                </h4>
                <p className="text-xs text-sky-600 font-semibold">{ROLE_LABELS[activeRole]}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ganti Foto Profil (URL Image)</label>
              <input
                type="text"
                value={userAvatar}
                onChange={(e) => setUserAvatar(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={onLogout}
                className="w-1/2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white text-xs py-2.5 rounded-xl font-bold transition shadow-md shadow-sky-600/20"
              >
                Selesai & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
