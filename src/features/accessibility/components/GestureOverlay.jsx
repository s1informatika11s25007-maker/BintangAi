import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GestureOverlay = ({
  videoRef,
  canvasRef,
  isActive,
  handDetected,
  totalFingers,
  menuActive,
  isProfilePage,
  isLandingPage,
  isAuthPage,
  isLoginMode
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] pointer-events-none group">
      {/* Container Kamera Mini */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-48 h-36 bg-slate-900 rounded-3xl overflow-hidden border-4 border-indigo-500/30 shadow-2xl backdrop-blur-xl"
      >
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-60 scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 scale-x-[-1]" />

        {/* Status Hand Detected */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-20 transition-colors ${handDetected ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
          {handDetected ? 'Tangan Terdeteksi' : 'Cari Tangan...'}
        </div>

        {/* Counter Jari */}
        <div className="absolute bottom-3 right-3 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl z-20 shadow-lg border border-indigo-400/50">
          {totalFingers}
        </div>
      </motion.div>

      {/* Guide Perintah Berdasarkan Halaman */}
      <AnimatePresence>
        {handDetected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-40 right-0 w-64 bg-slate-900/90 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-2xl pointer-events-auto"
          >
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Panduan Isyarat Jari</p>
            <div className="space-y-2">
              {menuActive ? (
                <>
                  <GuideItem fingers={1} label="Beranda" />
                  <GuideItem fingers={2} label="QuizKu" />
                  <GuideItem fingers={3} label="Materi" />
                  <GuideItem fingers={4} label="Grup Belajar" />
                  <GuideItem fingers={5} label="Tanya AI" />
                  <GuideItem fingers={7} label="Profil" />
                </>
              ) : isLandingPage ? (
                <>
                  <GuideItem fingers={2} label="Pindah ke Masuk" />
                  <GuideItem fingers={5} label="Pindah ke Daftar" />
                </>
              ) : isAuthPage ? (
                <>
                  <GuideItem fingers={1} label="Kembali ke Beranda" />
                  <GuideItem fingers={2} label={isLoginMode ? "Pindah ke Daftar" : "Pindah ke Masuk"} />
                  <GuideItem fingers={5} label={isLoginMode ? "Masuk Sekarang" : "Mendaftarkan..."} />
                </>
              ) : isProfilePage ? (
                <GuideItem fingers={2} label="Keluar (Logout)" />
              ) : (
                <GuideItem fingers={10} label="Buka Menu Utama" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GuideItem = ({ fingers, label }) => (
  <div className="flex items-center gap-3">
    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-[10px] border border-indigo-500/30">{fingers}</span>
    <span className="text-xs font-bold text-slate-300">{label}</span>
  </div>
);

export default GestureOverlay;
