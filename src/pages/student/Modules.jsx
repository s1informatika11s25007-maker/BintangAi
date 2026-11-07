import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import {
  HiBookOpen, HiSearch, HiSparkles, HiChatAlt2,
  HiStop, HiSpeakerphone, HiX, HiPaperAirplane,
  HiMenuAlt2, HiOutlineDocumentSearch, HiLightBulb, HiChevronRight,
  HiClipboardList, HiShieldCheck, HiExternalLink, HiChevronDown, HiChevronUp,
  HiChevronLeft
} from 'react-icons/hi';

const StudentModules = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { askMateriAI } = useAI();
  const { isMute } = useAccessibility();
  const { showSubtitle } = useSubtitle();

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

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

  // SMART PAGINATION FOR ACCESSIBILITY (TUNAWICARA)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMute ? 5 : 50; // Show 5 for mute, or list them all for others

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

  // Handle Gesture Events
  useEffect(() => {
    const handleGesture = (e) => {
      if (!isMute || !selectedModule) return;
      const { fingers } = e.detail;

      if (fingers === 1) {
        setScrollSpeed(8);
        showSubtitle("📜 Scrolling ke Bawah...", "info");
      } else if (fingers === 2) {
        setScrollSpeed(-8);
        showSubtitle("📜 Scrolling ke Atas...", "info");
      } else if (fingers === 3) {
        setScrollSpeed(0);
        showSubtitle("⏹️ Scroll Dihentikan", "success");
      } else if (fingers === 5 && isFocusMode) {
        // Exit Focus Mode with 5 fingers
        setIsFocusMode(false);
        setIsSidebarOpen(true);
        showSubtitle("🔙 Keluar Mode Fokus", "info");
      }
    };

    window.addEventListener('gesture-detected', handleGesture);
    return () => window.removeEventListener('gesture-detected', handleGesture);
  }, [isMute, selectedModule, isFocusMode]);

  // Scroll Loop
  useEffect(() => {
    if (scrollSpeed === 0) {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      return;
    }

    scrollIntervalRef.current = setInterval(() => {
      if (pdfContainerRef.current) {
        pdfContainerRef.current.scrollTop += scrollSpeed;
      }
    }, 16);

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [scrollSpeed]);

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

  const selectModule = (m) => {
    setSelectedModule(m);
    setChatMessages([
      {
        role: 'ai',
        content: `Halo ${profile?.full_name?.split(' ')[0] || 'Teman'}! 👋 Kak Bintang sudah siap membantumu belajar materi "${m.title}". Silakan tanya apa saja di bawah sini ya!`
      }
    ]);

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
      } else {
        throw new Error(result.answer);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Maaf ya, Kak Bintang lagi gangguan koneksi. Coba lagi!" }]);
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

      <main className="flex-1 flex overflow-hidden relative">
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
                    <HiBookOpen className="text-indigo-600" /> Materi
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

              {/* Smart Navigation for Tunawicara in Sidebar */}
              {isMute && totalPages > 1 && (
                <div className="px-6 py-2 flex items-center justify-between border-b border-slate-50 bg-indigo-50/30">
                   <button onClick={prevPage} disabled={currentPage === 1} data-gesture-prev="true" className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-30"><HiChevronLeft /></button>
                   <span className="text-[10px] font-black text-indigo-600 uppercase">Hal {currentPage} / {totalPages}</span>
                   <button onClick={nextPage} disabled={currentPage === totalPages} data-gesture-next="true" className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-30"><HiChevronRight /></button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2 custom-scrollbar mt-2">
                {currentModules.length === 0 && !loading && <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-10">Belum ada materi</p>}
                {currentModules.map((m, idx) => (
                   <button
                    key={m.id}
                    onClick={() => selectModule(m)}
                    data-gesture-item="true"
                    className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center justify-between gap-3 ${selectedModule?.id === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-600 hover:bg-slate-50'}`}
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
                     {isMute && (
                       <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedModule?.id === m.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}>
                          {idx + 1}
                       </span>
                     )}
                   </button>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UTAMA */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {!isSidebarOpen && (
             <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-[100] w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-indigo-600 border border-slate-100"><HiMenuAlt2 /></button>
          )}

          {selectedModule ? (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

              {/* PDF VIEWER */}
              <div className={`flex-1 flex flex-col transition-all duration-500 ${isChatExpanded ? 'h-[30vh] lg:h-full' : 'h-full'} ${isFocusMode ? 'lg:w-full' : ''}`}>
                <div className={`flex-1 transition-all duration-500 ${isFocusMode ? 'p-0 lg:p-0' : 'p-2 lg:p-4'} overflow-hidden`}>
                  <div
                    ref={pdfContainerRef}
                    className={`bg-white shadow-2xl border-slate-200 h-full w-full relative overflow-y-auto custom-scrollbar-hidden transition-all duration-500 ${isFocusMode ? 'rounded-0 border-0' : 'rounded-2xl lg:rounded-3xl border'}`}
                  >
                    {isMute ? (
                      <div className="w-full min-h-[500vh] pointer-events-none bg-slate-100 flex flex-col items-center">
                        <iframe
                          src={getSafePdfUrl(selectedModule.pdf_url)}
                          className="w-full lg:w-[95%] h-[500vh] border-none shadow-2xl"
                          title={selectedModule.title}
                        />
                      </div>
                    ) : (
                      <iframe
                        src={getSafePdfUrl(selectedModule.pdf_url)}
                        className="w-full h-full border-none"
                        title={selectedModule.title}
                      />
                    )}

                    {!isFocusMode && (
                      <a
                        href={selectedModule.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl text-[10px] font-black flex items-center gap-2 hover:scale-105 transition-all z-20"
                      >
                        BUKA FULL PDF <HiExternalLink />
                      </a>
                    )}

                    {isFocusMode && (
                      <button
                        onClick={() => { setIsFocusMode(false); setIsSidebarOpen(true); }}
                        className="absolute top-6 right-6 bg-white/90 backdrop-blur text-indigo-600 p-3 rounded-2xl shadow-2xl z-20 hover:scale-110 active:scale-90 transition-all border border-indigo-100"
                      >
                        <HiX className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* AI CHAT PANEL */}
              <div className={`
                flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200 transition-all duration-500 z-[105]
                ${isFocusMode ? 'lg:w-0 overflow-hidden opacity-0 invisible' : 'lg:w-[400px] xl:w-[450px]'}
                ${isChatExpanded ? 'h-[70vh]' : 'h-[60px]'} lg:h-full
              `}>

                <div
                  onClick={() => window.innerWidth < 1024 && setIsChatExpanded(!isChatExpanded)}
                  className="h-[60px] shrink-0 bg-indigo-600 text-white px-5 flex items-center justify-between cursor-pointer lg:cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <HiSparkles className="text-xl animate-pulse text-indigo-200" />
                    <div>
                      <h3 className="font-black text-[10px] uppercase tracking-widest">Tanya Kak Bintang</h3>
                      <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-tighter">Pakar Materi Aktif</p>
                    </div>
                  </div>
                  <div className="lg:hidden">
                    {isChatExpanded ? <HiChevronDown className="text-xl" /> : <HiChevronUp className="text-xl" />}
                  </div>
                </div>

                <div className={`flex-1 overflow-hidden flex flex-col ${!isChatExpanded && 'hidden lg:flex'}`}>
                  <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`
                          max-w-[85%] p-4 rounded-2xl font-bold text-xs leading-relaxed shadow-sm
                          ${msg.role === 'ai' ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}
                        `}>
                          {msg.content}
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
                        placeholder="Tanyakan materi..."
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
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white">
              <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <HiBookOpen className="text-7xl text-indigo-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-2">Belajar Lebih Seru</h3>
              <p className="text-xs font-bold text-slate-400 max-w-[280px] uppercase tracking-widest leading-relaxed">Pilih modul di perpustakaan untuk mulai membaca dan bertanya langsung ke Kak Bintang.</p>
            </div>
          )}
        </div>

        {/* Navigation Info for Tunawicara */}
        {isMute && (
          <div className="bg-slate-900 text-white py-3 px-10 flex items-center justify-between shrink-0 z-[120] border-t border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.1em]">
                  {selectedModule ? `SEDANG MEMBACA: ${selectedModule.title}` : 'PILIH MATERI DENGAN JARI'}
                </p>
             </div>
             <div className="flex gap-8 items-center">
                {!selectedModule ? (
                  <>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                       Gunakan Jari <span className="text-white bg-indigo-600 px-2 py-0.5 rounded ml-1">1-5</span> untuk Memilih
                    </p>
                    <div className="flex gap-4">
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-white bg-slate-700 px-2 py-0.5 rounded mr-1">6</span> Lanjut</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-white bg-slate-700 px-2 py-0.5 rounded mr-1">7</span> Kembali</p>
                    </div>
                  </>
                ) : (
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Lihat Papan Panduan di Samping Kamera untuk Kontrol
                  </p>
                )}
             </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 1024px) {
          iframe { pointer-events: auto; }
        }
      `}</style>
    </div>
  );
};

export default StudentModules;
