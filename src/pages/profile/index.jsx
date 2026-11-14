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
import VoiceSettingsPanel from '@/features/accessibility/components/VoiceSettingsPanel';
import {
  HiUser, HiCog, HiFingerPrint, HiShieldCheck,
  HiLogout, HiClipboardCopy, HiCheckCircle, HiVolumeUp, HiAcademicCap
} from 'react-icons/hi';

const Profile = () => {
  const { profile, logout, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const { showSubtitle } = useSubtitle();
  const { isBlind, isDeaf } = useAccessibility();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(
    profile?.role === 'guru' ? 'identitas' : profile?.role === 'ortu' ? 'link' : 'pengaturan_suara'
  );

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

  const [studentInputId, setStudentInputId] = useState('');
  const [linkedStudent, setLinkedStudent] = useState(null);
  const [linkingLoading, setLinkingLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      supabase.from('profiles').select('*').eq('id', profile.id).single().then(({ data, error }) => {
        if (data && !error) setProfile(data);
      });
    }
  }, [profile?.id]);

  useEffect(() => {
    const fetchLinkedStudent = async () => {
      if (profile?.linked_student_id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.linked_student_id)
          .maybeSingle();
        if (data) setLinkedStudent(data);
      } else if (profile?.class_code) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'siswa')
          .eq('class_code', profile.class_code)
          .order('full_name')
          .limit(1)
          .maybeSingle();
        if (data) setLinkedStudent(data);
      }
    };
    fetchLinkedStudent();
  }, [profile?.linked_student_id, profile?.class_code]);

  const handleLinkStudent = async () => {
    const cleanId = studentInputId.trim();
    if (!cleanId) {
      setMessage({ type: 'error', text: 'Masukkan ID Belajar Siswa (6 Digit) yang valid' });
      return;
    }
    setLinkingLoading(true);
    try {
      let query = supabase.from('profiles').select('*').eq('role', 'siswa');
      if (cleanId.length === 6 && /^\d+$/.test(cleanId)) {
        query = query.eq('short_id', cleanId);
      } else {
        query = query.or(`id.eq.${cleanId},short_id.eq.${cleanId}`);
      }

      const { data: student, error: fetchErr } = await query.maybeSingle();

      if (fetchErr || !student) {
        throw new Error('Siswa dengan ID Belajar 6 Digit tersebut tidak ditemukan. Periksa kembali kodenya.');
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ linked_student_id: student.id })
        .eq('id', profile.id);

      if (updateErr) throw updateErr;

      setProfile({ ...profile, linked_student_id: student.id });
      setLinkedStudent(student);
      setStudentInputId('');
      setMessage({ type: 'success', text: `Berhasil menghubungkan dengan siswa ${student.full_name} (${student.short_id || 'OK'})!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghubungkan siswa' });
    } finally {
      setLinkingLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${accSettings.fontSize}%`;
  }, [accSettings.fontSize]);

  const saveAccSettings = (newSettings) => {
    setAccSettings(newSettings);
    localStorage.setItem('accessibility_settings', JSON.stringify(newSettings));
  };

  const handleLogout = async () => {
    await logout('/auth/login');
  };

  const handleUpdateClassLevel = async (newLevel) => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ class_level: newLevel }).eq('id', profile.id);
      if (!error) {
        setProfile({ ...profile, class_level: newLevel });
        setMessage({ type: 'success', text: `Tingkat kelas berhasil diperbarui ke ${newLevel}!` });
      } else {
        throw error;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal memperbarui kelas: ' + err.message });
    } finally {
      setSaving(false);
    }
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
      { id: 'pengaturan_suara', label: 'Pengaturan Suara', icon: <HiVolumeUp /> },
      { id: 'aksesibilitas', label: 'Profil Siswa', icon: <HiUser /> },
      { id: 'pengaturan_akses', label: 'Pengaturan Akses', icon: <HiCog /> },
      { id: 'id_siswa', label: 'ID Belajar', icon: <HiFingerPrint /> },
      { id: 'keamanan', label: 'Keamanan', icon: <HiShieldCheck /> },
    ],
    guru: [
      { id: 'identitas', label: 'Profil Guru', icon: <HiUser /> },
      { id: 'link', label: 'Siswa Terhubung', icon: <HiFingerPrint /> },
      { id: 'pengaturan_suara', label: 'Pengaturan Suara', icon: <HiVolumeUp /> },
      { id: 'keamanan', label: 'Keamanan', icon: <HiShieldCheck /> },
    ],
    ortu: [
      { id: 'identitas', label: 'Profil Ortu', icon: <HiUser /> },
      { id: 'pengaturan_suara', label: 'Pengaturan Suara', icon: <HiVolumeUp /> },
      { id: 'link', label: 'Hubungkan Anak', icon: <HiFingerPrint /> },
      { id: 'keamanan', label: 'Keamanan', icon: <HiShieldCheck /> },
    ]
  };

  const currentTabs = tabs[profile?.role] || tabs.siswa;

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  const classOptions = ["1 SD", "2 SD", "3 SD", "4 SD", "5 SD", "6 SD"];

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
                {activeTab === 'pengaturan_suara' && (
                  <VoiceSettingsPanel />
                )}

                {activeTab === 'aksesibilitas' && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800">
                          {profile?.full_name}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sekolah</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800">
                          {profile?.slb_name || 'Sekolah Umum'}
                        </div>
                      </div>

                      {/* Editable Class Level for Personalization */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <HiAcademicCap /> Tingkat Kelas Pembelajaran (Personalisasi AI)
                        </label>
                        <select
                          value={profile?.class_level || '4 SD'}
                          onChange={(e) => handleUpdateClassLevel(e.target.value)}
                          disabled={saving}
                          className="w-full p-4 bg-indigo-50/60 border-2 border-indigo-100 text-indigo-900 rounded-xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <p className="text-[10px] text-slate-400 italic ml-1">
                          * Personalisasi penjelasan Kak Bintang AI akan otomatis menyesuaikan dengan tingkat kelas yang Anda pilih.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disabilitas</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800">
                          {profile?.disability_type?.toUpperCase() || 'UMUM'}
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">XP Belajar</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-indigo-600 text-lg">
                          {profile?.xp || 0} XP
                        </div>
                      </div>
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

                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-4">Pengaturan Suara Pembelajaran</h4>
                      <VoiceSettingsPanel compact={true} />
                    </div>
                  </div>
                )}

                {activeTab === 'id_siswa' && (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 border border-indigo-100 shadow-sm">
                      <HiFingerPrint />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">ID Belajar Anda</h3>
                      <p className="text-slate-500 font-medium text-xs max-w-md mx-auto mt-1 leading-relaxed">
                        Gunakan Kode ID 6 Digit ini untuk menghubungkan akun Anda dengan Guru atau Orang Tua secara praktis dan mudah dihafal.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto p-8 bg-indigo-50/80 rounded-3xl border-2 border-dashed border-indigo-200 space-y-4">
                      <div className="bg-white py-4 px-6 rounded-2xl shadow-xs border border-indigo-100">
                        <p className="text-4xl md:text-5xl font-black text-indigo-600 tracking-[0.25em] font-mono select-all">
                          {profile?.short_id || profile?.id?.slice(0, 6)}
                        </p>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kode Unik Siswa BintangAi (6 Digit)</p>
                      <button
                        onClick={() => copyId(profile?.short_id || profile?.id?.slice(0, 6))}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        <HiClipboardCopy className="text-base" /> Salin ID Belajar 6 Digit
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

                {/* Teacher / Parent specific view */}
                {activeTab === 'identitas' && (
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800">
                          {profile?.full_name}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instansi/Sekolah</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800">
                          {profile?.slb_name || 'Sekolah Umum'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mata Pelajaran / Peran</label>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800">
                          {profile?.subject || (profile?.role === 'guru' ? 'Guru Pembimbing' : 'Orang Tua')}
                        </div>
                      </div>

                      {/* Editable Class Level */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <HiAcademicCap /> Tingkat Kelas Diampu
                        </label>
                        <select
                          value={profile?.class_level || '4 SD'}
                          onChange={(e) => handleUpdateClassLevel(e.target.value)}
                          disabled={saving}
                          className="w-full p-4 bg-indigo-50/60 border-2 border-indigo-100 text-indigo-900 rounded-xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Kelas Utama</label>
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl font-black text-indigo-600 text-lg">
                          {profile?.class_code || '-'}
                        </div>
                      </div>

                      {/* Nama Anak / Siswa Terhubung */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                          <HiUser /> Nama Anak / Siswa Terhubung
                        </label>
                        <div className="p-5 bg-indigo-50/80 border-2 border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-black text-slate-900 text-base">
                              {linkedStudent?.full_name || 'Siswa SD BintangAi (Terhubung)'}
                            </p>
                            <p className="text-xs font-bold text-indigo-600">
                              Tingkat: {linkedStudent?.class_level || profile?.class_level || 'Kelas 4 SD'} • Disabilitas: {linkedStudent?.disability_type?.toUpperCase() || 'UMUM'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              Kode Kelas: {linkedStudent?.class_code || profile?.class_code || '-'}
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab('link')}
                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xs shrink-0 self-start sm:self-center"
                          >
                            Atur / Ubah Siswa 🔗
                          </button>
                        </div>
                      </div>
                   </div>
                )}

                {/* Hubungkan Siswa / Anak View for Teacher & Parent */}
                {activeTab === 'link' && (
                  <div className="space-y-8 max-w-xl">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {profile?.role === 'guru' ? 'Siswa Terhubung' : 'Anak Terhubung'}
                      </h3>
                      <p className="text-slate-500 font-medium text-xs mt-1">
                        Hubungkan akun Anda dengan ID Belajar Siswa untuk memantau aktivitas, tugas, dan laporan perkembangan anak/siswa secara langsung.
                      </p>
                    </div>

                    {/* Current Linked Student Info Card */}
                    <div className="p-6 bg-indigo-50/80 border-2 border-indigo-100 rounded-3xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Status Hubungan</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-wider">
                          {linkedStudent ? 'Terhubung ✅' : 'Belum Ada Siswa'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900">
                          {linkedStudent?.full_name || 'Belum Terhubung dengan Siswa'}
                        </p>
                        {linkedStudent && (
                          <p className="text-xs font-bold text-indigo-600 mt-1">
                            Tingkat: {linkedStudent.class_level || 'Kelas 4 SD'} • Disabilitas: {linkedStudent.disability_type?.toUpperCase() || 'UMUM'} • Kode Kelas: {linkedStudent.class_code || '-'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form Link New Student */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                        Masukkan ID Belajar Siswa
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={studentInputId}
                          onChange={(e) => setStudentInputId(e.target.value)}
                          placeholder="Contoh: 151479 (Kode ID Belajar 6 Digit)..."
                          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-600 transition-all"
                        />
                        <button
                          onClick={handleLinkStudent}
                          disabled={linkingLoading || !studentInputId.trim()}
                          className="px-6 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shrink-0"
                        >
                          {linkingLoading ? 'Menghubungkan...' : 'Hubungkan'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        * Kode ID Belajar Siswa 6 Digit dapat disalin dari menu "ID Belajar Anda" di profil siswa.
                      </p>
                    </div>
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
