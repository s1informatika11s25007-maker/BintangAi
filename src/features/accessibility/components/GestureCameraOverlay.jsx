import React from 'react';
import { useLocation } from 'react-router-dom';

const GestureCameraOverlay = ({
  videoRef,
  isActive = false,
  totalFingers = 0,
  menuActive = false,
  isProfilePage = false,
  isModuleSelected = false,
  onManualGesture = () => {},
  startCamera,
  stopCamera,
  cameraError = '',
  cameraSupported = false,
}) => {
  const { pathname } = useLocation();
  const isTaskList = pathname === '/student/tasks';
  const isModulesList = pathname === '/student/modules';
  const isTaskDetail = pathname.includes('/student/task/');
  const isQuizPage = pathname.includes('/student/quiz/');

  let title = 'Kontrol Navigasi';
  let commands = [
    { count: 1, icon: '🏠', label: 'Beranda' },
    { count: 2, icon: '📝', label: 'Tugas' },
    { count: 3, icon: '📚', label: 'Modul' },
    { count: 4, icon: '👥', label: 'Kolaborasi' },
    { count: 5, icon: '✨', label: 'Tanya AI' },
    { count: 7, icon: '👤', label: 'Profil' },
  ];
  if (isProfilePage) {
    title = 'Kontrol Profil';
    commands = [{ count: 2, icon: '↩️', label: 'Keluar' }, { count: 10, icon: '☰', label: 'Menu' }];
  } else if (menuActive) {
    title = 'Menu Navigasi';
  } else if (isTaskDetail || isQuizPage) {
    title = 'Kontrol Kuis';
    commands = [1, 2, 3, 4, 5].map((count, i) => ({ count, icon: ['1️⃣','2️⃣','3️⃣','4️⃣','➡️'][i], label: ['Mulai / A','Opsi B','Opsi C','Opsi D','Lanjut'][i] }));
  } else if (isModulesList && isModuleSelected) {
    title = 'Kontrol Membaca';
    commands = [{ count: 1, icon: '⬇️', label: 'Scroll bawah' }, { count: 2, icon: '⬆️', label: 'Scroll atas' }, { count: 3, icon: '⏸️', label: 'Jeda' }, { count: 4, icon: '✖️', label: 'Tutup' }];
  } else if (isTaskList || isModulesList) {
    title = 'Pilih Daftar';
    commands = [1, 2, 3, 4, 5, 6, 7].map((count) => ({ count, icon: `${count}️⃣`, label: count === 6 ? 'Berikutnya' : count === 7 ? 'Sebelumnya' : `Pilih ${count}` }));
  }

  if (isProfilePage && menuActive) {
    commands = [{ count: 1, icon: '🏠', label: 'Beranda' }, { count: 2, icon: '📝', label: 'Tugas' }, { count: 3, icon: '📚', label: 'Modul' }, { count: 4, icon: '👥', label: 'Kolaborasi' }, { count: 5, icon: '✨', label: 'Tanya AI' }];
  }

  return (
    <section
      aria-label="Kontrol aksesibilitas tunawicara"
      className="fixed bottom-3 right-3 z-[999] w-[min(94vw,370px)] rounded-3xl border border-indigo-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-900">{title}</h2>
          <p className="text-[11px] text-slate-500">Pilih tombol; tidak perlu berbicara.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700" aria-live="polite">
          {totalFingers ? `Pilihan ${totalFingers}` : 'Siap'}
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Pilihan navigasi">
        {commands.map((command) => (
          <button
            key={`${command.count}-${command.label}`}
            type="button"
            onClick={() => onManualGesture(command.count)}
            className={`flex min-h-[68px] flex-col items-center justify-center rounded-2xl border p-2 text-center transition focus:outline-none focus:ring-4 focus:ring-indigo-300 ${totalFingers === command.count ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50'}`}
            aria-label={`${command.label}, pilihan ${command.count}`}
          >
            <span className="text-xl" aria-hidden="true">{command.icon}</span>
            <span className="mt-1 text-[10px] font-bold leading-tight">{command.label}</span>
          </button>
        ))}
        {!menuActive && !isProfilePage && (
          <button type="button" onClick={() => onManualGesture(10)} className="flex min-h-[68px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-300">
            <span className="text-xl" aria-hidden="true">☰</span><span className="mt-1 text-[10px] font-bold">Menu utama</span>
          </button>
        )}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] leading-relaxed text-slate-500">Kamera hanya preview browser opsional. Tidak ada deteksi tangan atau model AI.</p>
          {isActive ? (
            <button type="button" onClick={stopCamera} className="shrink-0 rounded-xl bg-slate-800 px-3 py-2 text-[10px] font-bold text-white">Matikan kamera</button>
          ) : (
            <button type="button" onClick={startCamera} disabled={!cameraSupported || !startCamera} className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40">Preview kamera</button>
          )}
        </div>
        {isActive && <video ref={videoRef} muted playsInline autoPlay className="mt-3 max-h-32 w-full rounded-xl bg-slate-900 object-cover" aria-label="Preview kamera lokal" />}
        {cameraError && <p role="status" className="mt-2 text-[11px] text-rose-600">{cameraError}</p>}
      </div>
    </section>
  );
};

export default GestureCameraOverlay;
