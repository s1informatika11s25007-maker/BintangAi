import React, { useState, useEffect } from 'react';
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
  isModuleSelected = false,
  isResultScreen: isResultScreenProp
}) => {
  const location = useLocation();
  const path = location.pathname;

  const isQuizList = path === '/student/tasks';
  const isModulesList = path === '/student/modules';
  const isQuizPage = path.includes('/student/quiz/') || path.includes('/student/task/');
  const isDashboardPage = path === '/student/dashboard';

  // Synchronous DOM check directly inside render body (0ms delay)
  const isResultScreenSync = (() => {
    if (!isQuizPage || typeof document === 'undefined') return false;
    const bodyText = document.body ? (document.body.innerText || '') : '';
    const hasResultDOM = !!document.querySelector('[data-result-screen="true"]') ||
                         !!document.querySelector('[data-retake-screen="true"]') ||
                         !!document.querySelector('[data-view-pembahasan="true"]') ||
                         !!document.querySelector('[data-quiz-status="IZIN_ULANG_DISETUJUI"]') ||
                         !!document.querySelector('[data-quiz-status="MENUNGGU_IZIN_GURU"]');

    const hasResultText = bodyText.includes('Hasil Petualanganmu') ||
                          bodyText.includes('Analisis Belajar') ||
                          bodyText.includes('Skor Akhir') ||
                          bodyText.includes('Izin Kerjakan Ulang') ||
                          bodyText.includes('Pembahasan Kak Bintang') ||
                          bodyText.includes('Kunci Jawaban & Pembahasan');

    return hasResultDOM || hasResultText;
  })();

  const [isResultScreenState, setIsResultScreenState] = useState(false);

  useEffect(() => {
    if (!isQuizPage) {
      setIsResultScreenState(false);
      return;
    }

    const checkResultScreen = () => {
      if (typeof document === 'undefined') return;
      const bodyText = document.body ? (document.body.innerText || '') : '';
      const hasResultDOM = !!document.querySelector('[data-result-screen="true"]') ||
                           !!document.querySelector('[data-retake-screen="true"]') ||
                           !!document.querySelector('[data-view-pembahasan="true"]') ||
                           !!document.querySelector('[data-quiz-status="IZIN_ULANG_DISETUJUI"]') ||
                           !!document.querySelector('[data-quiz-status="MENUNGGU_IZIN_GURU"]');

      const hasResultText = bodyText.includes('Hasil Petualanganmu') ||
                            bodyText.includes('Analisis Belajar') ||
                            bodyText.includes('Skor Akhir') ||
                            bodyText.includes('Izin Kerjakan Ulang') ||
                            bodyText.includes('Pembahasan Kak Bintang') ||
                            bodyText.includes('Kunci Jawaban & Pembahasan');

      setIsResultScreenState(hasResultDOM || hasResultText);
    };

    checkResultScreen();
    const observer = new MutationObserver(checkResultScreen);
    if (typeof document !== 'undefined' && document.body) {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    }
    return () => observer.disconnect();
  }, [path, isQuizPage]);

  // Combined result screen flag (Prop priority -> Sync check -> Async Observer State)
  const isResultScreen = isResultScreenProp !== undefined
    ? isResultScreenProp
    : (isResultScreenSync || isResultScreenState);

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

  // 2. Perintah Halaman Quiz: Belum Dikerjakan (Mengerjakan Soal / 🎯 Fokus Quiz)
  const quizDetailCommands = [
    { icon: '☝️', label: 'Mulai / A' },
    { icon: '✌️', label: 'Opsi B' },
    { icon: '🤘', label: 'Opsi C' },
    { icon: '🖖', label: 'Opsi D' },
    { icon: '🖐️', label: 'Lanjut' },
  ];

  // 3. Perintah Halaman Quiz: Hasil Petualanganmu & Retake Kuis
  const quizResultCommands = [
    { icon: '☝️', label: 'Scroll ↓ (1)' },
    { icon: '✌️', label: 'Scroll ↑ (2)' },
    { icon: '🤟', label: 'Ulangi (3)' },
    { icon: '🖖', label: 'Nanti (4)' },
    { icon: '🖐️', label: 'Daftar (5)' },
  ];

  // 4. Perintah Daftar & Halaman Utama
  const itemCommands = [
    { icon: '☝️', label: 'Pilih 1' },
    { icon: '✌️', label: 'Pilih 2' },
    { icon: '🤘', label: 'Pilih 3' },
    { icon: '🖖', label: 'Pilih 4' },
    { icon: '✋', label: 'Pilih 5' },
  ];

  // 5. Perintah Beranda
  const dashboardCommands = [
    { icon: '☝️', label: 'Scroll ↓' },
    { icon: '✌️', label: 'Scroll ↑' },
  ];

  // 6. Perintah Daftar QuizKu (Siswa Tunawicara)
  const quizPageCommands = [
    { icon: '☝️', label: 'Lanjut (1)' },
    { icon: '✌️', label: 'Mundur (2)' },
    { icon: '🤟', label: 'Masuk (3)' },
    { icon: '🖖', label: 'Riwayat (4)' },
    { icon: '🖐️', label: 'Aktif (5)' },
  ];

  // 7. Perintah Membaca Modul (Reader View: Teks & PDF)
  const readingCommands = [
    { icon: '☝️', label: 'Scroll ↓ (1)' },
    { icon: '✌️', label: 'Scroll ↑ (2)' },
    { icon: '🤟', label: 'Suara (3)' },
    { icon: '🖖', label: 'Lanjut (4)' },
    { icon: '🖐️', label: 'Tutup (5)' },
    { icon: '6️⃣', label: 'PDF (6)' },
    { icon: '7️⃣', label: 'Teks (7)' },
  ];

  // 8. Perintah Halaman Perpustakaan Materi / Modul (📚 Pilih Materi)
  const modulePageCommands = [
    { icon: '☝️', label: 'Lanjut (1)' },
    { icon: '✌️', label: 'Mundur (2)' },
    { icon: '🤟', label: 'Masuk (3)' },
    { icon: '🖖', label: 'Kategori (4)' },
    { icon: '🖐️', label: 'Semua (5)' },
  ];

  const profileCommands = [
    { icon: '✌️', label: 'Keluar' },
    { icon: '🙌', label: 'Menu (10)' },
  ];

  // LOGIKA PENENTUAN COMMAND YANG TAMPIL SEPERTI ATURAN LOGIKA WAJIB
  let currentCommands = navCommands;
  let title = '👋 Navigasi Jari';
  let accentColor = 'text-indigo-400';
  let activeDot = 'bg-indigo-500';
  let footerHint = '';

  if (isProfilePage) {
    currentCommands = profileCommands;
    title = '👤 Menu Profil';
    accentColor = 'text-rose-400';
    activeDot = 'bg-rose-500';
    footerHint = '2 Jari = Logout | 10 Jari = Menu Utama';
  } else if (menuActive) {
    currentCommands = navCommands;
    title = '🔓 Menu Utama';
    accentColor = 'text-emerald-400';
    activeDot = 'bg-emerald-500';
    footerHint = 'Pilih Jari (1-7) untuk Pindah Halaman | 10 = Tutup';
  } else if (isQuizPage) {
    if (isResultScreen) {
      // PANDUAN HALAMAN HASIL PETUALANGANMU & RETAKE KUIS
      currentCommands = quizResultCommands;
      title = '🏆 Hasil Petualanganmu';
      accentColor = 'text-emerald-400';
      activeDot = 'bg-emerald-500';
      footerHint = '1 = Scroll ↓ | 2 = Scroll ↑ | 3 = Ulangi | 4 = Nanti | 5 = Ke Daftar';
    } else {
      // PANDUAN MENGERJAKAN SOAL KUIS (BELUM DIKERJAKAN)
      currentCommands = quizDetailCommands;
      title = '🎯 Fokus Quiz';
      accentColor = 'text-amber-500';
      activeDot = 'bg-amber-500';
      footerHint = '1-4 Jari = Opsi Jawaban | 5 Jari = Lanjut Soal';
    }
  } else if (isQuizList) {
    currentCommands = quizPageCommands;
    title = '⚡ QuizKu Kontrol';
    accentColor = 'text-amber-400';
    activeDot = 'bg-amber-500';
    footerHint = '1 = Lanjut | 2 = Mundur | 3 = Masuk | 4 = Riwayat | 5 = Aktif | 10 = Menu';
  } else if (isDashboardPage) {
    currentCommands = dashboardCommands;
    title = '🏠 Scroll Beranda';
    accentColor = 'text-indigo-400';
    activeDot = 'bg-indigo-500';
    footerHint = '1 Jari = Scroll ↓ | 2 Jari = Scroll ↑ | 10 = Menu';
  } else if (isModulesList && isModuleSelected) {
    currentCommands = readingCommands;
    title = '📖 Membaca Materi';
    accentColor = 'text-emerald-400';
    activeDot = 'bg-emerald-500';
    footerHint = '1=Scroll ↓ | 2=Scroll ↑ | 3=Suara | 4=Lanjut | 5=Tutup | 6=PDF | 7=Teks';
  } else if (isModulesList) {
    currentCommands = modulePageCommands;
    title = '📚 Pilih Materi';
    accentColor = 'text-blue-400';
    activeDot = 'bg-blue-500';
    footerHint = '1 = Lanjut | 2 = Mundur | 3 = Masuk | 4 = Kategori | 5 = Semua';
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

        <div className={`grid ${currentCommands.length > 5 ? 'grid-cols-4' : (currentCommands.length === 3 ? 'grid-cols-3' : (isProfilePage ? 'grid-cols-2' : 'grid-cols-5'))} gap-3`}>
          {currentCommands.map((cmd, i) => {
            let isMatch = false;
            if (isProfilePage) {
              isMatch = (i === 0 && totalFingers === 2) || (i === 1 && totalFingers === 10);
            } else if (menuActive) {
              const navFingerMap = [1, 2, 3, 4, 5, 6, 7];
              isMatch = totalFingers === navFingerMap[i];
            } else if (isQuizPage) {
              isMatch = totalFingers >= 1 && totalFingers <= 5 && totalFingers === (i + 1);
            } else if (isQuizList) {
              isMatch = (i === 0 && totalFingers === 1) || (i === 1 && totalFingers === 2) || (i === 2 && totalFingers === 3) || (i === 3 && totalFingers === 4) || (i === 4 && totalFingers === 5);
            } else if (isDashboardPage) {
              isMatch = (i === 0 && totalFingers === 1) || (i === 1 && totalFingers === 2);
            } else if (isModulesList && isModuleSelected) {
              isMatch = (i === 0 && totalFingers === 1) || (i === 1 && totalFingers === 2) || (i === 2 && totalFingers === 3) || (i === 3 && totalFingers === 5);
            } else {
              isMatch = totalFingers === (i + 1);
            }

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 transition-all">
                <div className={`text-xl transition-all duration-300 ${isMatch ? 'scale-150 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 'opacity-60'}`}>
                  {cmd.icon}
                </div>
                <div className="text-[7px] font-black uppercase text-center leading-tight text-white">
                  {cmd.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-[8px] font-black text-white uppercase tracking-widest">
            {footerHint}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestureCameraOverlay;
