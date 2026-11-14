import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  HiLockClosed, HiShieldCheck, HiSearch, HiRefresh,
  HiClock, HiUserGroup, HiLightningBolt, HiFilter, HiX,
  HiCheckCircle, HiTrash, HiChevronLeft, HiChevronRight
} from 'react-icons/hi';

const MonitorPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bintang_monitor_unlocked') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  // Pagination State for scalable performance
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === 'Bintang123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('bintang_monitor_unlocked', 'true');
      setErrorMsg('');
      fetchLogs();
    } else {
      setErrorMsg('Sandi salah! Akses ditolak.');
    }
  };

  const handleLockAccess = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bintang_monitor_unlocked');
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      const { error } = await supabase.from('user_activity_logs').delete().eq('id', id);
      if (error) throw error;
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus SELURUH riwayat log aktivitas pengguna?")) return;
    try {
      const { error } = await supabase.from('user_activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setLogs([]);
      setCurrentPage(1);
    } catch (err) {
      console.error("Clear all logs error:", err);
    }
  };

  // Real-time listener + 3-second auto-polling fallback for live activity logs
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);

    const channelName = `monitor_logs_${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_activity_logs' },
        (payload) => {
          setLogs(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Extract unique user names dynamically for filter dropdown
  const uniqueUserNames = useMemo(() => {
    const set = new Set();
    logs.forEach(l => {
      if (l.user_name) set.add(l.user_name);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Filter logs by search, role, user name, and action type
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        (log.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.feature_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || log.user_role === roleFilter;
      const matchesUser = userFilter === 'all' || log.user_name === userFilter;
      const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;

      return matchesSearch && matchesRole && matchesUser && matchesAction;
    });
  }, [logs, searchQuery, roleFilter, userFilter, actionFilter]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, userFilter, actionFilter]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalLogins = logs.filter(l => l.action_type === 'LOGIN').length;
  const totalClicks = logs.filter(l => l.action_type === 'KLIK_TOMBOL').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 border border-indigo-500/30 shadow-lg">
            <HiLockClosed />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Halaman Monitor Khusus</h1>
          <p className="text-xs text-slate-400 font-bold leading-relaxed mb-8">
            Masukkan kata sandi untuk melihat seluruh log aktivitas pengguna, login, dan penekanan tombol fitur secara real-time.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan Sandi Akses..."
                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center text-sm font-bold tracking-widest text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-black text-rose-500 uppercase tracking-wider">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
            >
              Buka Akses Monitor 🚀
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 md:px-12 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">
            <HiShieldCheck />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Portal Monitor & Log Aktivitas Sistem</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Pencatatan Real-time Nama, Waktu, Tanggal, dan Klik Fitur Pengguna
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-700"
          >
            <HiRefresh className={loading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
          <button
            onClick={handleClearAllLogs}
            className="px-4 py-2.5 bg-rose-900/40 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-rose-500/30"
            title="Hapus Seluruh Log"
          >
            <HiTrash /> Hapus Semua Log
          </button>
          <button
            onClick={handleLockAccess}
            className="px-4 py-2.5 bg-rose-600/20 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-500/30"
          >
            Kunci Akses
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-black">
              <HiClock />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Log Catatan</p>
              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{logs.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black">
              <HiCheckCircle />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Login</p>
              <p className="text-2xl font-black text-emerald-600 leading-none mt-1">{totalLogins}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black">
              <HiLightningBolt />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Klik Fitur & Tombol</p>
              <p className="text-2xl font-black text-amber-600 leading-none mt-1">{totalClicks}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black">
              <HiUserGroup />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Monitor</p>
              <p className="text-sm font-black text-blue-600 leading-none mt-1">🔴 Live Realtime</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pengguna, tombol, atau rincian..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* User Name Filter Dropdown */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none max-w-[200px]"
            >
              <option value="all">Semua Pengguna ({uniqueUserNames.length})</option>
              {uniqueUserNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Role Filter Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Peran</option>
              <option value="siswa">Siswa</option>
              <option value="guru">Guru</option>
              <option value="ortu">Orang Tua</option>
            </select>

            {/* Action Filter Dropdown */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Tindakan</option>
              <option value="LOGIN">LOGIN</option>
              <option value="KLIK_TOMBOL">KLIK TOMBOL</option>
              <option value="AKSES_FITUR">AKSES FITUR</option>
            </select>
          </div>
        </div>

        {/* Real-time Activity Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Waktu & Tanggal</th>
                  <th className="px-6 py-4">Nama Pengguna</th>
                  <th className="px-6 py-4">Peran</th>
                  <th className="px-6 py-4">Tindakan</th>
                  <th className="px-6 py-4">Fitur / Tombol</th>
                  <th className="px-6 py-4">Rincian Deskripsi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold">
                {currentLogs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formattedDate} • {formattedTime}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {log.user_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                          log.user_role === 'guru'
                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                            : log.user_role === 'siswa'
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {log.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                          log.action_type === 'LOGIN'
                            ? 'bg-emerald-500 text-white'
                            : log.action_type === 'KLIK_TOMBOL'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-800 text-white'
                        }`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-indigo-600 font-black">
                        {log.feature_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {log.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                          title="Hapus Log Ini"
                        >
                          <HiTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-bold">
                      Tidak ada log aktivitas yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Clean & Responsive Pagination Controls */}
          {filteredLogs.length > 0 && (
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
              <p>
                Menampilkan <span className="text-slate-900 font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 font-black">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> dari <span className="text-indigo-600 font-black">{filteredLogs.length}</span> Log Aktivitas
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 transition-all flex items-center gap-1 shadow-xs"
                >
                  <HiChevronLeft /> Sebelumnya
                </button>

                <div className="px-3 text-center min-w-[70px]">
                  <span className="text-indigo-600 font-black">{currentPage}</span> / <span className="text-slate-500 font-bold">{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 transition-all flex items-center gap-1 shadow-xs"
                >
                  Berikutnya <HiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MonitorPage;
