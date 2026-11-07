import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import TeacherSidebar from '@/components/layout/TeacherSidebar';
import StudentSidebar from '@/components/layout/StudentSidebar';
import ParentSidebar from '@/components/layout/ParentSidebar';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { HiUser, HiCog, HiFingerPrint, HiShieldCheck, HiLogout, HiClipboardCopy, HiCheckCircle } from 'react-icons/hi';

const Profile = () => {
  const { profile, logout, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const { showSubtitle } = useSubtitle();
  const { isBlind, isDeaf } = useAccessibility();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(
    profile?.role === 'guru' ? 'identitas' : profile?.role === 'ortu' ? 'link' : 'aksesibilitas'
  );

  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);

  const [accSettings, setAccSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('accessibility_settings');
      return saved ? JSON.parse(saved) : { autoMode: true, voiceSpeed: 1.0, subtitleSize: 'medium', highContrast: false, fontSize: 100 };
    } catch {
      return { autoMode: true, voiceSpeed: 1.0, subtitleSize: 'medium', highContrast: false, fontSize: 100 };
    }
  });

  useEffect(() => {
    if (profile?.id) {
      supabase.from('profiles').select('*').eq('id', profile.id).single().then(({ data, error }) => {
        if (data && !error) setProfile(data);
      });
    }
  }, [profile?.id]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${accSettings.fontSize}%`;
  }, [accSettings.fontSize]);

  const saveAccSettings = (newSettings) => {
    setAccSettings(newSettings);
    localStorage.setItem('accessibility_settings', JSON.stringify(newSettings));
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setNewPassword('');
    } else {
      setMessage({ type: 'error', text: error.message });
    }
    setSaving(false);
  };

  const copyId = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'ID berhasil disalin!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const tabs = {
    siswa: [
      { id: 'aksesibilitas', label: 'Profil Siswa', icon: <HiUser /> },
      { id: 'pengaturan_akses', label: 'Pengaturan Akses', icon: <HiCog /> },
      { id: 'id_siswa', label: 'ID Belajar', icon: <HiFingerPrint /> },
      { id: 'keamanan', label: 'Keamanan', icon: <HiShieldCheck /> },
    ],
    guru: [
      { id: 'identitas', label: 'Profil Guru', icon: <HiUser /> },
      { id: 'keamanan', label: 'Keamanan', icon: <HiShieldCheck /> },
    ],
    ortu: [
      { id: 'identitas', label: 'Profil Ortu', icon: <HiUser /> },
      { id: 'link', label: 'Hubungkan Anak', icon: <HiFingerPrint /> },
      { id: 'keamanan', label: 'Keamanan', icon: <HiShieldCheck /> },
    ]
  };

  const currentTabs = tabs[profile?.role] || tabs.siswa;

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 relative overflow-hidden">
      {profile?.role === 'guru' ? <TeacherSidebar /> : profile?.role === 'ortu' ? <ParentSidebar /> : <StudentSidebar />}

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto h-screen no-scrollbar relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Profil</h1>
            <p className="text-slate-500 font-medium">Kelola identitas dan preferensi belajar Anda</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
          >
            <HiLogout /> Keluar Akun
          </button>
        </header>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              <HiCheckCircle className="text-xl" /> {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Tab Navigation */}
          <nav className="lg:col-span-3 space-y-2">
            {currentTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-1'
                    : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-100 hover:text-slate-600'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
              >
                {activeTab === 'aksesibilitas' && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'Nama Lengkap', value: profile?.full_name },
                        { label: 'Sekolah', value: profile?.slb_name || 'Sekolah Umum' },
                        { label: 'Kelas', value: profile?.class_level || '-' },
                        { label: 'Disabilitas', value: profile?.disability_type?.toUpperCase() || 'UMUM' },
                        { label: 'XP Belajar', value: `${profile?.xp || 0} XP`, color: 'text-indigo-600' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                          <div className={`p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 ${item.color || ''}`}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'pengaturan_akses' && (
                  <div className="space-y-8 max-w-xl">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">Auto-Mode Aksesibilitas</p>
                        <p className="text-xs text-slate-500">Aktifkan fitur bantuan suara secara otomatis</p>
                      </div>
                      <button
                        onClick={() => saveAccSettings({...accSettings, autoMode: !accSettings.autoMode})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${accSettings.autoMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accSettings.autoMode ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase">Ukuran Teks Platform</label>
                        <span className="font-black text-indigo-600">{accSettings.fontSize}%</span>
                      </div>
                      <input
                        type="range" min="80" max="150" step="10"
                        value={accSettings.fontSize}
                        onChange={e => saveAccSettings({...accSettings, fontSize: parseInt(e.target.value)})}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'id_siswa' && (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
                      <HiFingerPrint />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">ID Belajar Anda</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Gunakan ID ini untuk menghubungkan akun Anda dengan Guru atau Orang Tua.</p>
                    <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-xl font-black text-indigo-600 mb-6 break-all">{profile?.id}</p>
                      <button
                        onClick={() => copyId(profile?.id)}
                        className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <HiClipboardCopy /> Salin ID Sekarang
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'keamanan' && (
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase ml-1">Password Baru</label>
                      <input
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-indigo-600 transition-all"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : 'Perbarui Password'}
                    </button>
                  </div>
                )}

                {/* Teacher specific view */}
                {activeTab === 'identitas' && (
                   <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'Nama Lengkap', value: profile?.full_name },
                        { label: 'Instansi/Sekolah', value: profile?.slb_name },
                        { label: 'Mata Pelajaran', value: profile?.subject },
                        { label: 'Kode Kelas Utama', value: profile?.class_code, color: 'text-indigo-600 font-black' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                          <div className={`p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 ${item.color || ''}`}>
                            {item.value || '-'}
                          </div>
                        </div>
                      ))}
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
