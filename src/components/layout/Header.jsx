import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Heart } from 'lucide-react';
import { formatDateID, formatTimeID } from '../../utils/formatters';

export default function Header({ activeRole, onLogout }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleAvatars = {
    supervisor: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    caregiver: 'https://images.unsplash.com/photo-1594824813566-88855ce7890f?auto=format&fit=crop&w=120&q=80',
    family: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    admin_hr: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80'
  };

  const avatar = roleAvatars[activeRole] || roleAvatars.supervisor;

  return (
    <header className="bg-white/95 border-b border-slate-200/90 px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md shadow-xs w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        {/* Left Search Bar matching reference image */}
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
          <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
            <Settings className="w-4 h-4" />
          </button>

          {/* User Avatar */}
          <img
            src={avatar}
            alt="User Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-sky-600 shadow-xs cursor-pointer"
            onClick={onLogout}
            title="Klik untuk Keluar Sesi"
          />
        </div>
      </div>
    </header>
  );
}
