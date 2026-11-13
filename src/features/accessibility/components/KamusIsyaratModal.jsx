import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiX, HiBookOpen, HiSparkles, HiLightBulb, HiAcademicCap } from 'react-icons/hi';

const GLOSSARY_TERMS = [
  {
    term: "Fotosintesis",
    subject: "IPA",
    category: "Sains SD",
    definition: "Proses tumbuhan hijau memasak dan membuat makanannya sendiri dengan bantuan cahaya matahari, air, dan karbon dioksida.",
    signGuide: "🤟 Bahasa Isyarat: Telapak tangan kiri terbuka menghadap atas (simbol daun), jari tangan kanan menguncup lalu mengembang di atasnya (simbol penyerapan energi cahaya matahari).",
    example: "Tumbuhan di halaman sekolah berfotosintesis saat siang hari."
  },
  {
    term: "Ekosistem",
    subject: "IPA",
    category: "Sains SD",
    definition: "Hubungan saling mempengaruhi antara makhluk hidup (tumbuhan, hewan, manusia) dengan lingkungannya (tanah, air, udara).",
    signGuide: "🤟 Bahasa Isyarat: Kedua tangan membentuk lingkaran besar bertaut, melambangkan saling keterikatan lingkungan.",
    example: "Hutan merupakan contoh ekosistem darat yang kaya akan keanekaragaman hayati."
  },
  {
    term: "Metamorfosis",
    subject: "IPA",
    category: "Sains SD",
    definition: "Tahap perubahan bentuk tubuh hewan dari telur, ulat, kepompong, hingga menjadi kupu-kupu dewasa.",
    signGuide: "🤟 Bahasa Isyarat: Jari-jari menggulung membentuk kepompong lalu membuka lebar mengepakkan sayap.",
    example: "Kupu-kupu mengalami metamorfosis sempurna dalam siklus hidupnya."
  },
  {
    term: "Penjumlahan",
    subject: "Matematika",
    category: "Matematika SD",
    definition: "Proses menggabungkan dua atau lebih kelompok angka/benda menjadi satu jumlah yang lebih besar.",
    signGuide: "🤟 Bahasa Isyarat: Kedua jari telunjuk menyilang membentuk tanda tambah (+), lalu digabungkan.",
    example: "Dua ditambah tiga sama dengan lima (2 + 3 = 5)."
  },
  {
    term: "Perkalian",
    subject: "Matematika",
    category: "Matematika SD",
    definition: "Penjumlahan berulang dari bilangan yang sama secara berulang-ulang.",
    signGuide: "🤟 Bahasa Isyarat: Kedua telunjuk disilangkan membentuk tanda silang (x).",
    example: "Tiga dikali empat sama dengan dua belas (3 x 4 = 12)."
  },
  {
    term: "Revolusi Bumi",
    subject: "IPA",
    category: "Sains SD",
    definition: "Gerakan bumi mengelilingi matahari yang memerlukan waktu satu tahun (365 hari).",
    signGuide: "🤟 Bahasa Isyarat: Tangan kiri mengepal sebagai matahari, tangan kanan melingkari dari luar secara penuh.",
    example: "Revolusi bumi menyebabkan terjadinya pergantian musim di berbagai belahan dunia."
  },
  {
    term: "Pancasila",
    subject: "PKn",
    category: "Kewarganegaraan SD",
    definition: "Lima dasar dan pedoman utama negara Republik Indonesia.",
    signGuide: "🤟 Bahasa Isyarat: Kelima jari tangan kanan dibuka lebar di dada (melambangkan 5 sila), lalu meletakkan tangan kanan di dada kiri.",
    example: "Pancasila adalah dasar negara Indonesia."
  },
  {
    term: "Gravitasi",
    subject: "IPA",
    category: "Sains SD",
    definition: "Gaya tarik bumi yang menyebabkan benda jatuh ke bawah.",
    signGuide: "🤟 Bahasa Isyarat: Tangannya berada di atas lalu dijatuhkan perlahan ke bawah melambangkan daya tarik bumi.",
    example: "Buah apel jatuh ke tanah karena adanya gaya gravitasi bumi."
  }
];

export default function KamusIsyaratModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('semua');
  const [activeTerm, setActiveTerm] = useState(GLOSSARY_TERMS[0]);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(t => {
      const matchSearch = t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = selectedSubject === 'semua' || t.subject.toLowerCase() === selectedSubject.toLowerCase();
      return matchSearch && matchSubject;
    });
  }, [searchQuery, selectedSubject]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white text-slate-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
                <HiAcademicCap />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
                  Kamus Istilah & Bahasa Isyarat SD
                </h3>
                <p className="text-xs font-medium text-indigo-200">Glosarium bahasa isyarat untuk memahami istilah pelajaran SD</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-all"
            >
              <HiX className="text-xl" />
            </button>
          </div>

          {/* Search & Subject Filter Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari istilah pelajaran (contoh: Fotosintesis, Ekosistem)..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {['semua', 'IPA', 'Matematika', 'PKn'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedSubject === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Content Body: Left List + Right Term Detail */}
          <div className="flex-1 grid md:grid-cols-12 overflow-hidden">
            {/* Term List Sidebar */}
            <div className="md:col-span-5 border-r border-slate-100 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[50vh] md:max-h-full">
              {filteredTerms.length === 0 && (
                <div className="p-8 text-center text-xs font-bold text-slate-400">
                  Tidak ada istilah yang cocok.
                </div>
              )}
              {filteredTerms.map((t) => (
                <button
                  key={t.term}
                  onClick={() => setActiveTerm(t)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    activeTerm?.term === t.term ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <h4 className="font-black text-sm">{t.term}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                      activeTerm?.term === t.term ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {t.subject}
                    </span>
                  </div>
                  <span className="text-xl">👉</span>
                </button>
              ))}
            </div>

            {/* Term Detail View */}
            <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-white">
              {activeTerm ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-widest rounded-full">
                      {activeTerm.subject} • {activeTerm.category}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{activeTerm.term}</h2>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {activeTerm.definition}
                    </p>
                  </div>

                  {/* Sign Language Guide Box */}
                  <div className="p-5 bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-2xl shadow-lg space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                      <HiAcademicCap /> Panduan Gerakan Bahasa Isyarat
                    </h4>
                    <p className="text-sm font-bold leading-relaxed text-indigo-100">
                      {activeTerm.signGuide}
                    </p>
                  </div>

                  {/* Example Usage */}
                  <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-amber-900 text-xs font-semibold space-y-1">
                    <span className="font-black text-amber-700 uppercase tracking-wider block">Contoh Penggunaan:</span>
                    <p className="italic">"{activeTerm.example}"</p>
                  </div>
                </>
              ) : (
                <div className="p-10 text-center text-slate-400 font-bold text-xs">
                  Pilih salah satu istilah di sebelah kiri.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
