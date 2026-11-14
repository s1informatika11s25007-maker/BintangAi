import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  HiLockClosed, HiShieldCheck, HiSearch, HiRefresh,
  HiClock, HiUserGroup, HiLightningBolt, HiFilter, HiX,
  HiCheckCircle, HiTrash, HiChevronLeft, HiChevronRight, HiSparkles
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

  // Confirmation Modal State for Clear All Logs
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const executeClearAllLogs = async () => {
    try {
      const { error } = await supabase.from('user_activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setLogs([]);
      setCurrentPage(1);
      setShowClearConfirm(false);
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 font-sans text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 p-7 sm:p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-md shadow-2xl relative z-10 text-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-6 border border-indigo-500/30 shadow-lg">
            <HiLockClosed />
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2">Halaman Monitor Khusus</h1>
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
                className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center text-sm font-bold tracking-widest text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-black text-rose-500 uppercase tracking-wider">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
            >
              Buka Akses Monitor 🚀
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col w-full">
      {/* Header - Edge to Edge Edge Responsive */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 md:px-12 py-5 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shrink-0 w-full">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl sm:text-2xl text-white shadow-lg shrink-0">
            <HiShieldCheck />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black tracking-tight uppercase truncate">Portal Monitor & Log Aktivitas Sistem</h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
              Pencatatan Real-time Nama, Waktu, Tanggal, dan Klik Fitur Pengguna
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={fetchLogs}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <HiRefresh className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Refresh Logs</span>
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-rose-900/40 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-rose-500/30"
            title="Hapus Seluruh Log"
          >
            <HiTrash /> <span>Hapus Semua Log</span>
          </button>
          <button
            onClick={handleLockAccess}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-rose-600/20 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-500/30"
          >
            Kunci Akses
          </button>
        </div>
      </header>

      {/* Main Content - Full Edge-to-Edge Responsive Container */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 w-full space-y-6 md:space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
              <HiClock />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Total Log Catatan</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none mt-1">{logs.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
              <HiCheckCircle />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Aktivitas Login</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 leading-none mt-1">{totalLogins}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
              <HiLightningBolt />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Klik Fitur & Tombol</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 leading-none mt-1">{totalClicks}</p>
            </div>
          </div>

          {/* Professional Live Status Icon (No text emojis) */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
              <HiShieldCheck />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Status Monitor</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-wider truncate">Live Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between">
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

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* User Name Filter Dropdown */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none max-w-[180px] sm:max-w-[200px]"
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
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
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
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Tindakan</option>
              <option value="LOGIN">LOGIN</option>
              <option value="KLIK_TOMBOL">KLIK TOMBOL</option>
              <option value="AKSES_FITUR">AKSES FITUR</option>
            </select>
          </div>
        </div>

        {/* TOP PAGINATION & LOG SUMMARY BAR (PLACED DIRECTLY ABOVE TABLE FOR FAST NAV) */}
        {filteredLogs.length > 0 && (
          <div className="bg-white px-4 sm:px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
            <p className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Menampilkan <span className="text-slate-900 font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 font-black">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> dari <span className="text-indigo-600 font-black">{filteredLogs.length}</span> Log Aktivitas
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all flex items-center gap-1 shadow-xs"
              >
                <HiChevronLeft /> <span>Sebelumnya</span>
              </button>

              <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-center min-w-[60px]">
                <span className="text-indigo-600 font-black">{currentPage}</span> / <span className="text-slate-500 font-bold">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all flex items-center gap-1 shadow-xs"
              >
                <span>Berikutnya</span> <HiChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Mobile View Card List (Android / Small Devices) */}
        <div className="block md:hidden space-y-3">
          {currentLogs.map((log) => {
            const dateObj = new Date(log.created_at);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div
                key={log.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 transition-all"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shrink-0 ${
                      log.user_role === 'guru'
                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                        : log.user_role === 'siswa'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {log.user_role}
                    </span>
                    <span className="font-black text-slate-900 text-xs truncate">
                      {log.user_name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 text-xs shrink-0"
                  >
                    <HiTrash />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-indigo-600 font-black truncate max-w-[180px]">{log.feature_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white shrink-0 ${
                    log.action_type === 'LOGIN'
                      ? 'bg-emerald-500'
                      : log.action_type === 'KLIK_TOMBOL'
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                  }`}>
                    {log.action_type}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-600 leading-snug">
                  {log.description || '-'}
                </p>

                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-50 flex items-center justify-between">
                  <span>{formattedDate} • {formattedTime}</span>
                  {log.class_code && <span className="bg-slate-100 px-2 py-0.5 rounded font-sans font-bold text-slate-500">Kelas: {log.class_code}</span>}
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs font-bold">
              Tidak ada log aktivitas yang ditemukan.
            </div>
          )}
        </div>

        {/* Desktop / Laptop Table View (Hidden on Mobile, Visible on md+) */}
        <div className="hidden md:flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-col w-full">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4">Waktu & Tanggal</th>
                  <th className="px-5 py-4">Nama Pengguna</th>
                  <th className="px-5 py-4">Peran</th>
                  <th className="px-5 py-4">Tindakan</th>
                  <th className="px-5 py-4">Fitur / Tombol</th>
                  <th className="px-5 py-4">Rincian Deskripsi</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold">
                {currentLogs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formattedDate} • {formattedTime}
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900">
                        {log.user_name}
                      </td>
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4 text-indigo-600 font-black">
                        {log.feature_name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {log.description || '-'}
                      </td>
                      <td className="px-5 py-4 text-right">
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
        </div>
      </main>

      {/* Elegant Custom Confirmation Card Modal for Clear All Logs */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm md:max-w-md rounded-[2.5rem] shadow-2xl p-7 md:p-8 border border-slate-100 flex flex-col items-center text-center overflow-hidden z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-rose-100 border border-rose-100">
                <HiTrash />
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                Hapus Seluruh Log Aktivitas?
              </h3>

              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8 px-2">
                Apakah Anda yakin ingin menghapus SELURUH riwayat log aktivitas pengguna dari database? Aksi ini tidak dapat dibatalkan.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeClearAllLogs}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-200 transition-all"
                >
                  Hapus Semua Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonitorPage;
