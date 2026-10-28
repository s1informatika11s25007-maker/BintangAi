import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, User, Camera, Upload, LogOut, CheckCircle2, Shield } from 'lucide-react';
import { formatDateID, formatTimeID } from '../../utils/formatters';
import Modal from '../common/Modal';

export default function Header({ activeRole, userAvatar, setUserAvatar, onLogout }) {
  const [now, setNow] = useState(new Date());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleProfiles = {
    supervisor: { name: 'Ns. Ratna Sari, M.Kep', roleTitle: 'Supervisor Klinis', email: 'supervisor.ratna@sambungjaga.id', defaultAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' },
    caregiver: { name: 'Suster Dewi Pertiwi, Amd.Kep', roleTitle: 'Pengasuh / Perawat', email: 'dewi.caregiver@sambungjaga.id', defaultAvatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7890f?auto=format&fit=crop&w=120&q=80' },
    family: { name: 'Rina Wijaya', roleTitle: 'Wali Ibu Hj. Aminah', email: 'keluarga.aminah@gmail.com', defaultAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80' },
    admin_hr: { name: 'Budi Santoso', roleTitle: 'Admin Panti / HR', email: 'admin.hr@sambungjaga.id', defaultAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80' }
  };

  const currentProfile = roleProfiles[activeRole] || roleProfiles.supervisor;
  const displayAvatar = userAvatar || currentProfile.defaultAvatar;

  // Handle local file upload (converts file to Data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUserAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL change
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setUserAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl('');
    }
  };

  // Preset Avatar selector
  const presetAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1594824813566-88855ce7890f?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  ];

  return (
    <>
      <header className="bg-white/95 border-b border-slate-200/90 px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md shadow-xs w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Left Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari penghuni, tugas, atau kewajiban..."
              className="w-full bg-slate-100/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          {/* Right Info: Clock, Bell Notification, Settings, Avatar */}
          <div className="flex items-center space-x-5 text-xs text-slate-600 font-medium w-full sm:w-auto justify-end">
            {/* Realtime Date & Clock */}
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-500 font-bold">{formatDateID(now)}</div>
              <div className="text-xs font-mono font-black text-slate-900">{formatTimeID(now)}</div>
            </div>

            {/* Bell Notification */}
            <button className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Pengaturan Profil"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Avatar - Opens Profile Modal instead of logging out! */}
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="relative group cursor-pointer"
              title="Klik untuk Kelola Profil & Foto"
            >
              <img
                src={displayAvatar}
                alt="User Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-sky-600 shadow-xs group-hover:scale-105 transition duration-200"
              />
              <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-0.5 rounded-full border border-white shadow-xs">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Management & Avatar Upload Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Pengaturan Profil Pengguna"
      >
        <div className="space-y-6 text-left">

          {/* User Info Header */}
          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative group shrink-0">
              <img
                src={displayAvatar}
                alt={currentProfile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-sky-600 shadow-md"
              />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{currentProfile.name}</h3>
              <p className="text-xs text-sky-700 font-bold">{currentProfile.roleTitle}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentProfile.email}</p>
            </div>
          </div>

          {/* Option 1: File Uploader */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center">
              <Upload className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> Unggah Foto Profil Baru (Dari Perangkat)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
            />
          </div>

          {/* Option 2: Image URL */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> Atau Pakai URL Foto Online
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition"
              >
                Ganti
              </button>
            </div>
          </form>

          {/* Option 3: Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Pilih dari Avatar Preset:</label>
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {presetAvatars.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Preset ${idx}`}
                  onClick={() => setUserAvatar(url)}
                  className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition ${
                    displayAvatar === url ? 'border-sky-600 scale-110 shadow-md ring-2 ring-sky-300' : 'border-slate-200 hover:border-sky-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions: Close or Explicit Logout */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                onLogout();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar Sesi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/20 transition"
            >
              Selesai & Simpan
            </button>
          </div>

        </div>
      </Modal>
    </>
  );
}
