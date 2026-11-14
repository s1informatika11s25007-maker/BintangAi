import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const GestureCameraOverlay = ({
  videoRef,
  canvasRef,
  isActive,
  handDetected = false,
  totalFingers = 0,
  menuActive = false,
  isProfilePage = false,
  isModuleSelected = false
}) => {
  const location = useLocation();
  const path = location.pathname;

  const isQuizList = path === '/student/tasks';
  const isModulesList = path === '/student/modules';
  const isTaskDetail = path.includes('/student/task/');

  // 1. Perintah Navigasi Global (Dipicu dengan 10 Jari)
  const navCommands = [
    { icon: '☝️', label: 'Beranda' },
    { icon: '✌️', label: 'QuizKu' },
    { icon: '🤘', label: 'Modul' },
    { icon: '🖖', label: 'Mabar' },
    { icon: '🖐️', label: 'Pesan' },
    { icon: '6️⃣', label: 'Tanya AI' },
    { icon: '7️⃣', label: 'Profil' },
  ];

  // 2. Perintah Khusus Halaman Quiz (Sedang Mengerjakan)
  const quizDetailCommands = [
    { icon: '☝️', label: 'Mulai / A' },
    { icon: '✌️', label: 'Opsi B' },
    { icon: '🤘', label: 'Opsi C' },
    { icon: '🖖', label: 'Opsi D' },
    { icon: '✋', label: 'Lanjut' },
  ];

  // 3. Perintah Khusus Daftar & Halaman Utama
  const itemCommands = [
    { icon: '☝️', label: 'Pilih 1' },
    { icon: '✌️', label: 'Pilih 2' },
    { icon: '🤘', label: 'Pilih 3' },
    { icon: '🖖', label: 'Pilih 4' },
    { icon: '✋', label: 'Pilih 5' },
  ];

  // 4. Perintah Khusus Beranda
  const dashboardCommands = [
    { icon: '☝️', label: 'Scroll ↓' },
    { icon: '✌️', label: 'Scroll ↑' },
  ];

  // 5. Perintah Khusus Halaman QuizKu
  const quizPageCommands = [
    { icon: '☝️', label: 'Tab Aktif' },
    { icon: '✌️', label: 'Riwayat' },
    { icon: '🤘', label: 'Pembahasan' },
  ];

  // 6. Perintah Khusus Halaman Pembahasan
  const pembahasanCommands = [
    { icon: '☝️', label: 'Kembali' },
  ];

  // 7. Perintah Khusus Membaca Modul
  const readingCommands = [
    { icon: '☝️', label: 'Scroll ↓' },
    { icon: '✌️', label: 'Scroll ↑' },
    { icon: '🤘', label: 'Stop' },
    { icon: '✋', label: 'Tutup' },
  ];

  const profileCommands = [
    { icon: '✌️', label: 'Keluar' },
    { icon: '🙌', label: 'Menu (10)' },
  ];

  const isDashboardPage = path === '/student/dashboard';
  const isSubmissionView = path.includes('/student/task/') && !!document.querySelector('[data-view-pembahasan="true"]');

  // LOGIKA PENENTUAN COMMAND YANG TAMPIL
  let currentCommands = navCommands;
  let title = '👋 Navigasi Jari';
  let accentColor = 'text-indigo-400';
  let activeDot = 'bg-indigo-500';

  if (isProfilePage) {
    currentCommands = profileCommands;
    title = '👤 Menu Profil';
    accentColor = 'text-rose-400';
    activeDot = 'bg-rose-500';
  } else if (menuActive) {
    currentCommands = navCommands;
    title = '🔓 Menu Utama';
    accentColor = 'text-emerald-400';
    activeDot = 'bg-emerald-500';
  } else if (isSubmissionView) {
    currentCommands = pembahasanCommands;
    title = '📖 Pembahasan Quiz';
    accentColor = 'text-indigo-400';
    activeDot = 'bg-indigo-500';
  } else if (isTaskDetail) {
    currentCommands = quizDetailCommands;
    title = '🎯 Fokus Quiz';
    accentColor = 'text-amber-500';
    activeDot = 'bg-amber-500';
  } else if (isQuizList) {
    currentCommands = quizPageCommands;
    title = '⚡ QuizKu Kontrol';
    accentColor = 'text-amber-400';
    activeDot = 'bg-amber-500';
  } else if (isDashboardPage) {
    currentCommands = dashboardCommands;
    title = '🏠 Scroll Beranda';
    accentColor = 'text-indigo-400';
    activeDot = 'bg-indigo-500';
  } else if (isModulesList && isModuleSelected) {
    currentCommands = readingCommands;
    title = '📖 Membaca PDF';
    accentColor = 'text-emerald-400';
    activeDot = 'bg-emerald-500';
  } else if (isModulesList) {
    currentCommands = itemCommands;
    title = '📚 Pilih Materi';
    accentColor = 'text-blue-400';
    activeDot = 'bg-blue-500';
  }

  const borderColor = !isActive ? 'border-slate-500' :
                      handDetected ? (menuActive ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.6)]' : (isProfilePage && totalFingers === 2 ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)]' : 'border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]')) : 'border-rose-500';

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3 pointer-events-none">
      {/* Camera Feed */}
      <div className={`relative w-48 h-36 md:w-64 md:h-48 rounded-[2rem] overflow-hidden border-4 transition-all duration-300 ${borderColor} bg-slate-900 shadow-2xl pointer-events-auto`}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" muted playsInline autoPlay />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ transform: 'scaleX(-1)' }} />

        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-md py-1.5 px-3 flex justify-between items-center z-20">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            {handDetected ? `${totalFingers} Jari Terdeteksi` : 'Tangan Tidak Terlihat'}
          </span>
          <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        </div>
      </div>

      {/* Professional Instruction Board */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-5 shadow-2xl border border-white/10 w-72 pointer-events-auto transition-all">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${activeDot}`}></div>
             <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentColor}`}>
               {title}
             </p>
          </div>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-white/20"></div>
             <div className="w-1 h-1 rounded-full bg-white/20"></div>
          </div>
        </div>

        <div className={`grid ${currentCommands.length > 5 ? 'grid-cols-4' : (isProfilePage ? 'grid-cols-2' : 'grid-cols-5')} gap-3`}>
          {currentCommands.map((cmd, i) => {
            // Dynamic finger matching for active instruction set
            let isMatch = false;
            if (isProfilePage) {
              isMatch = (i === 0 && totalFingers === 2) || (i === 1 && totalFingers === 10);
            } else if (menuActive) {
              const navFingerMap = [1, 2, 3, 4, 5, 6, 7];
              isMatch = totalFingers === navFingerMap[i];
            } else if (isSubmissionView) {
              isMatch = (i === 0 && totalFingers === 1);
            } else if (isTaskDetail) {
              isMatch = totalFingers === (i + 1);
            } else if (isQuizList) {
              isMatch = (i === 0 && totalFingers === 1) || (i === 1 && totalFingers === 2) || (i === 2 && totalFingers === 3);
            } else if (isDashboardPage) {
              isMatch = (i === 0 && totalFingers === 1) || (i === 1 && totalFingers === 2);
            } else if (isModulesList && isModuleSelected) {
              isMatch = (i === 0 && totalFingers === 1) || (i === 1 && totalFingers === 2) || (i === 2 && totalFingers === 3) || (i === 3 && totalFingers === 5);
            } else {
              isMatch = totalFingers === (i + 1);
            }

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 transition-all">
                <div className={`text-xl transition-all duration-300 ${isMatch ? 'scale-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'opacity-30 grayscale'}`}>
                  {cmd.icon}
                </div>
                <div className={`text-[6px] font-black uppercase text-center leading-tight transition-colors ${isMatch ? 'text-white' : 'text-slate-600'}`}>
                  {cmd.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-center">
          {menuActive ? (
            <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
              Pilih Jari (1-7) untuk Pindah Halaman | 10 = Tutup
            </p>
          ) : isDashboardPage ? (
            <p className="text-[7px] font-extrabold text-indigo-300 uppercase tracking-widest">
              1 Jari = Scroll ↓ | 2 Jari = Scroll ↑ | 10 = Menu
            </p>
          ) : isQuizList ? (
            <p className="text-[7px] font-extrabold text-amber-300 uppercase tracking-widest">
              1 = Aktif | 2 = Riwayat | 3 = Pembahasan | 10 = Menu
            </p>
          ) : isSubmissionView ? (
            <p className="text-[7px] font-extrabold text-indigo-300 uppercase tracking-widest">
              1 Jari = Kembali ke Daftar Quiz | 10 = Menu
            </p>
          ) : isTaskDetail ? (
            <p className="text-[7px] font-extrabold text-amber-300 uppercase tracking-widest">
              1-4 Jari = Opsi Jawaban | 5 Jari = Lanjut Soal
            </p>
          ) : isModulesList && isModuleSelected ? (
            <p className="text-[7px] font-extrabold text-emerald-300 uppercase tracking-widest">
              1 = Scroll ↓ | 2 = Scroll ↑ | 5 = Tutup | 10 = Menu
            </p>
          ) : isProfilePage ? (
            <p className="text-[7px] font-black text-rose-400 uppercase tracking-widest">
              2 Jari = Logout | 10 Jari = Menu Utama
            </p>
          ) : (
            <p className="text-[7px] font-extrabold text-blue-300 uppercase tracking-widest">
              1-5 Jari = Pilih Item | 6 = Next | 7 = Prev | 10 = Menu
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestureCameraOverlay;
