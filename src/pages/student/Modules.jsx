import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { globalCaptionBus } from '@/features/accessibility/components/MataPintarGlobalCaption';
import {
  HiBookOpen, HiSearch, HiAcademicCap, HiChatAlt2,
  HiStop, HiSpeakerphone, HiX, HiPaperAirplane,
  HiMenuAlt2, HiOutlineDocumentSearch, HiLightBulb, HiChevronRight,
  HiClipboardList, HiShieldCheck, HiExternalLink, HiChevronDown, HiChevronUp,
  HiChevronLeft, HiVolumeUp, HiPause, HiPlay, HiRefresh,
  HiChevronDoubleRight, HiChevronDoubleLeft, HiAdjustments
} from 'react-icons/hi';

const StudentModules = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { askMateriAI } = useAI();
  const { isBlind, isDeaf, isMute } = useAccessibility();
  const { showSubtitle } = useSubtitle();
  const {
    speak, stopSpeaking, speakImageDescription,
    voiceSpeed, setVoiceSpeed, voiceVolume, setVoiceVolume
  } = useVoice();

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Kamus Bahasa Isyarat Modal State
  const [isKamusOpen, setIsKamusOpen] = useState(false);

  // Audio Reading State (Pembaca Materi Otomatis)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [moduleParagraphs, setModuleParagraphs] = useState([]);

  // Gesture Scroll State
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const pdfContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Mobile UI States
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // AI States
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const chatEndRef = useRef(null);

  // SMART PAGINATION FOR ACCESSIBILITY
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMute ? 5 : 50;

  useEffect(() => {
    fetchModules();
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 PEMBACA MATERI OTOMATIS (Paragraph-by-Paragraph Reader)
   */
  const extractParagraphs = (moduleData) => {
    const rawContent = moduleData.description || moduleData.content || moduleData.summary || '';
    let paragraphs = rawContent.split(/\n+/).filter(p => p.trim().length > 0);

    if (paragraphs.length === 0) {
      paragraphs = [
        `Materi ${moduleData.title}. Mata pelajaran ${moduleData.subject || 'Umum'}.`,
        `Gunakan tombol kontrol suara untuk membaca, menjeda, atau melanjutkan materi.`
      ];
    }
    return paragraphs;
  };

  const readCurrentParagraph = useCallback((index, paragraphs) => {
    if (!paragraphs || paragraphs.length === 0) return;

    const currentP = paragraphs[index];
    if (!currentP) return;

    setIsPlayingAudio(true);
    setIsAudioPaused(false);

    const announcement = index === 0
      ? `Membaca materi: ${selectedModule?.title || ''}. Paragraf pertama: ${currentP}`
      : `Paragraf ${index + 1}: ${currentP}`;

    if (isBlind) {
      speak(announcement, 1.0, true);
    }

    // Emit live caption to Mata Pintar HUD for Tunarungu (Deaf) students
    if (isDeaf) {
      globalCaptionBus.emit(currentP, 'Guru', 'speech');
    }
  }, [selectedModule?.title, isBlind, isDeaf, speak]);

  const startReadingModule = () => {
    if (!selectedModule) return;
    const paragraphs = extractParagraphs(selectedModule);
    setModuleParagraphs(paragraphs);
    setCurrentParagraphIndex(0);
    readCurrentParagraph(0, paragraphs);
  };

  const pauseReadingModule = () => {
    stopSpeaking();
    setIsAudioPaused(true);
    setIsPlayingAudio(false);
    if (isBlind) speak('Pembacaan materi dijeda.', 1.0, true);
  };

  const resumeReadingModule = () => {
    if (moduleParagraphs.length === 0 && selectedModule) {
      startReadingModule();
      return;
    }
    setIsAudioPaused(false);
    setIsPlayingAudio(true);
    readCurrentParagraph(currentParagraphIndex, moduleParagraphs);
  };

  const nextParagraph = () => {
    if (currentParagraphIndex < moduleParagraphs.length - 1) {
      const nextIdx = currentParagraphIndex + 1;
      setCurrentParagraphIndex(nextIdx);
      readCurrentParagraph(nextIdx, moduleParagraphs);
    } else {
      if (isBlind) speak('Ini adalah akhir dari paragraf materi.', 1.0, true);
    }
  };

  const prevParagraph = () => {
    if (currentParagraphIndex > 0) {
      const prevIdx = currentParagraphIndex - 1;
      setCurrentParagraphIndex(prevIdx);
      readCurrentParagraph(prevIdx, moduleParagraphs);
    } else {
      if (isBlind) speak('Ini adalah paragraf pertama.', 1.0, true);
    }
  };

  const selectModule = (m) => {
    setSelectedModule(m);
    stopSpeaking();
    setIsPlayingAudio(false);
    setIsAudioPaused(false);

    const paragraphs = extractParagraphs(m);
    setModuleParagraphs(paragraphs);
    setCurrentParagraphIndex(0);

    const initialAIMsg = `Halo ${profile?.full_name?.split(' ')[0] || 'Teman'}! 👋 Kak Bintang sudah siap membantumu belajar materi "${m.title}". Silakan tanya apa saja di bawah sini ya!`;

    setChatMessages([
      {
        role: 'ai',
        content: initialAIMsg
      }
    ]);

    if (isBlind) {
      speak(`Membuka materi ${m.title}. Pilihan mata pelajaran ${m.subject || 'Umum'}. Menyiapkan pembacaan materi otomatis.`, 1.0, true);
      setTimeout(() => {
        readCurrentParagraph(0, paragraphs);
      }, 2500);
    }

    if (isMute) {
      setIsFocusMode(true);
      setIsSidebarOpen(false);
      showSubtitle(`Membuka ${m.title}. Gunakan 1 jari untuk scroll!`, "success");
    }

    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
      setIsChatExpanded(false);
    }
  };

  const handleAskAI = async (e) => {
    if (e) e.preventDefault();
    if (!userQuestion.trim() || isAsking || !selectedModule) return;

    const question = userQuestion;
    setUserQuestion('');
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsAsking(true);

    try {
      const result = await askMateriAI(question, selectedModule.id, {
        gradeLevel: profile?.class_level || "SD"
      });

      if (result.success) {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: result.answer,
          found: result.found
        }]);

        if (isBlind) {
          speak(result.answer, 1.0, true);
        }
      } else {
        throw new Error(result.answer);
      }
    } catch (err) {
      const errorMsg = "Maaf ya, Kak Bintang lagi gangguan koneksi. Coba lagi!";
      setChatMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
      if (isBlind) speak(errorMsg, 1.0, true);
    } finally {
      setIsAsking(false);
    }
  };

  const getSafePdfUrl = (url) => {
    if (!url) return "";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const filteredModules = useMemo(() =>
    modules.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [modules, searchQuery]
  );

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const currentModules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredModules.slice(start, start + itemsPerPage);
  }, [filteredModules, currentPage, itemsPerPage]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      if (isMute) showSubtitle(`Materi Halaman ${currentPage + 1}`, 'info');
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      if (isMute) showSubtitle(`Kembali ke Halaman ${currentPage - 1}`, 'info');
    }
  };

  return (
    <div
      className="h-screen bg-[#F8FAFC] flex font-sans overflow-hidden text-slate-800"
      data-module-selected={!!selectedModule}
    >
      <StudentSidebar />

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* SIDEBAR MODUL */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }}
              className="absolute lg:relative inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-[110] shadow-xl lg:shadow-none"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <HiBookOpen className="text-indigo-600" /> Materi Belajar
                  </h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><HiX /></button>
                </div>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text" placeholder="Cari materi..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-200 transition-all"
                  />
                </div>
              </div>

              {isMute && totalPages > 1 && (
                <div className="px-6 py-2 flex items-center justify-between border-b border-slate-50 bg-indigo-50/30">
                   <button onClick={prevPage} disabled={currentPage === 1} className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-30"><HiChevronLeft /></button>
                   <span className="text-[10px] font-black text-indigo-600 uppercase">Hal {currentPage} / {totalPages}</span>
                   <button onClick={nextPage} disabled={currentPage === totalPages} className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-30"><HiChevronRight /></button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2 custom-scrollbar mt-2">
                {currentModules.length === 0 && !loading && <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-10">Belum ada materi</p>}
                {currentModules.map((m, idx) => (
                   <button
                    key={m.id}
                    onClick={() => selectModule(m)}
                    tabIndex={0}
                    aria-label={`Materi ${m.title}, Pelajaran ${m.subject || 'Umum'}`}
                    className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center justify-between gap-3 outline-none focus:ring-4 focus:ring-indigo-500/30 ${selectedModule?.id === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-600 hover:bg-slate-50'}`}
                   >
                     <div className="flex items-center gap-3 truncate">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${selectedModule?.id === m.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                            📖
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-xs truncate">{m.title}</p>
                            <p className={`text-[8px] font-black uppercase mt-0.5 ${selectedModule?.id === m.id ? 'text-indigo-200' : 'text-slate-400'}`}>{m.subject || 'Umum'}</p>
                        </div>
                     </div>
                   </button>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AREA UTAMA MEMBACA MATERI */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {!isSidebarOpen && (
             <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-[100] w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-indigo-600 border border-slate-100"><HiMenuAlt2 /></button>
          )}

          {selectedModule ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">

              {/* 🎯 KONTROL PEMBACA MATERI OTOMATIS & MATA PINTAR CAPTION */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm z-30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                    <HiBookOpen />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 text-sm">{selectedModule.title}</h2>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      {selectedModule.subject || 'Pelajaran SD'} • Paragraf {currentParagraphIndex + 1} dari {moduleParagraphs.length || 1}
                    </p>
                  </div>
                </div>

                {/* Tombol Kontrol Pembaca Suara & Kamus Isyarat */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsKamusOpen(true)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-indigo-100 transition-all shadow-sm"
                  >
                    <span className="text-base">🤟</span>
                    <span className="hidden sm:inline">Kamus Isyarat</span>
                  </button>

                  <button
                    onClick={prevParagraph}
                    disabled={currentParagraphIndex === 0}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
                    title="Paragraf Sebelumnya"
                  >
                    <HiChevronDoubleLeft className="text-base" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {isPlayingAudio && !isAudioPaused ? (
                    <button
                      onClick={pauseReadingModule}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                      title="Jeda Pembacaan Suara"
                    >
                      <HiPause className="text-base" /> Jeda
                    </button>
                  ) : (
                    <button
                      onClick={resumeReadingModule}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                      title="Baca Materi / Lanjut Suara"
                    >
                      <HiPlay className="text-base" /> {isAudioPaused ? 'Lanjut' : 'Baca Materi'}
                    </button>
                  )}

                  <button
                    onClick={nextParagraph}
                    disabled={currentParagraphIndex >= moduleParagraphs.length - 1}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
                    title="Paragraf Berikutnya"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <HiChevronDoubleRight className="text-base" />
                  </button>

                  <button
                    onClick={() => readCurrentParagraph(currentParagraphIndex, moduleParagraphs)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                    title="Baca Ulang Paragraf Ini"
                  >
                    <HiRefresh className="text-base" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">

                {/* PDF & DOKUMEN VIEWER DENGAN DESKRIPSI GAMBAR W3C */}
                <div className={`flex-1 min-h-0 flex flex-col transition-all duration-500 ${isChatExpanded ? 'h-[30vh] lg:h-full' : 'h-full'}`}>
                  <div className="flex-1 min-h-0 p-4 overflow-hidden">
                    <div
                      ref={pdfContainerRef}
                      className="bg-white shadow-2xl border border-slate-200 h-full w-full rounded-2xl lg:rounded-3xl relative overflow-y-auto custom-scrollbar p-6 space-y-6"
                    >
                      {/* Title & W3C Description Card for Tunanetra & Tunarungu */}
                      <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                            Materi SD • {selectedModule.subject || 'Umum'}
                          </span>
                          <button
                            onClick={() => speakImageDescription(selectedModule.title, selectedModule.description)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                            title="Bacakan Deskripsi Visual W3C"
                          >
                            <HiVolumeUp /> Bacakan Deskripsi Visual
                          </button>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">{selectedModule.title}</h1>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          {selectedModule.description || selectedModule.summary || 'Modul pembelajaran SD inklusif Kak Bintang.'}
                        </p>
                      </div>

                      {/* Display PDF file inside iframe or HTML viewer */}
                      {selectedModule.pdf_url ? (
                        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                          <iframe
                            src={getSafePdfUrl(selectedModule.pdf_url)}
                            className="w-full h-full border-none"
                            title={`Materi PDF: ${selectedModule.title}`}
                          />
                        </div>
                      ) : null}

                      {/* Explicit W3C Image & Diagram Description */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HiLightBulb className="text-amber-500 text-lg" />
                          <span>Materi ini mendukung pembacaan otomatis W3C & deskripsi audio gambar/diagram.</span>
                        </div>
                        <a
                          href={selectedModule.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold flex items-center gap-1"
                        >
                          Buka PDF <HiExternalLink />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI CHAT & TANYA MATERI PANEL */}
                <div className={`
                  flex flex-col min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 transition-all duration-500 z-[105]
                  lg:w-[400px] xl:w-[450px]
                  ${isChatExpanded ? 'h-[70vh]' : 'h-[60px]'} lg:h-full
                `}>

                  <div
                    onClick={() => window.innerWidth < 1024 && setIsChatExpanded(!isChatExpanded)}
                    className="h-[60px] shrink-0 bg-indigo-600 text-white px-5 flex items-center justify-between cursor-pointer lg:cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <HiChatAlt2 className="text-xl text-indigo-200" />
                      <div>
                        <h3 className="font-black text-[10px] uppercase tracking-widest">Tanya Kak Bintang</h3>
                        <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-tighter">Pakar Materi SD</p>
                      </div>
                    </div>
                    <div className="lg:hidden">
                      {isChatExpanded ? <HiChevronDown className="text-xl" /> : <HiChevronUp className="text-xl" />}
                    </div>
                  </div>

                  <div className={`flex-1 min-h-0 overflow-hidden flex flex-col ${!isChatExpanded && 'hidden lg:flex'}`}>
                    <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`
                            max-w-[88%] p-4 rounded-2xl font-bold text-xs leading-relaxed shadow-sm break-words overflow-hidden
                            ${msg.role === 'ai' ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}
                          `}>
                            {msg.role === 'ai' && (
                              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block mb-1">
                                🤖 [Kak Bintang AI]
                              </span>
                            )}
                            <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                            {msg.role === 'ai' && (
                              <button
                                onClick={() => speak(msg.content, 1.0, true)}
                                className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                              >
                                <HiVolumeUp /> Dengarkan Suara
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {isAsking && <div className="text-indigo-600 font-black text-[9px] animate-pulse px-2">Bintang sedang berpikir...</div>}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                      <form onSubmit={handleAskAI} className="flex gap-2">
                        <input
                          type="text" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)}
                          placeholder="Tanyakan tentang materi ini..."
                          onFocus={() => window.innerWidth < 1024 && setIsChatExpanded(true)}
                          className="flex-1 px-5 py-3 bg-slate-100 border-none rounded-xl outline-none text-xs font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                        <button
                          type="submit"
                          disabled={isAsking || !userQuestion.trim()}
                          className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-30"
                        >
                          <HiPaperAirplane className="rotate-45" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white">
              <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <HiBookOpen className="text-7xl text-indigo-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-2">Belajar Lebih Seru</h3>
              <p className="text-xs font-bold text-slate-400 max-w-[280px] uppercase tracking-widest leading-relaxed">Pilih modul di sebelah kiri untuk mulai membaca materi otomatis dan bertanya langsung ke Kak Bintang.</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentModules;
