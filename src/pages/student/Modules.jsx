import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { globalCaptionBus } from '@/features/accessibility/components/MataPintarGlobalCaption';
import { getCleanFirstName } from '@/utils';
import {
  HiBookOpen, HiSearch, HiChatAlt2,
  HiPaperAirplane, HiLightBulb, HiChevronRight,
  HiExternalLink, HiChevronDown, HiChevronUp,
  HiVolumeUp, HiPause, HiPlay, HiRefresh,
  HiChevronDoubleRight, HiChevronDoubleLeft, HiArrowLeft,
  HiSparkles, HiClock, HiZoomIn, HiZoomOut
} from 'react-icons/hi';

const StudentModules = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { askMateriAI } = useAI();
  const { isBlind, isDeaf, isMute } = useAccessibility();
  const { showSubtitle } = useSubtitle();
  const {
    speak, stopSpeaking, speakImageDescription
  } = useVoice();

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = getCleanFirstName(profile?.full_name) || 'Teman';

  // Dynamic Font Size Scale for Low-Vision & Young Students: 0 = normal (14px), 1 = medium (16px), 2 = large (18px), 3 = extra-large (20px)
  const [fontSizeLevel, setFontSizeLevel] = useState(1);

  // View mode for PDF vs Text
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'pdf'

  // Audio Reading State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [moduleParagraphs, setModuleParagraphs] = useState([]);

  // Mobile UI States
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // AI States
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const chatEndRef = useRef(null);

  // SUBJECT FILTER
  const [selectedSubject, setSelectedSubject] = useState('Semua');

  useEffect(() => {
    fetchModules();
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
    const rawContent = moduleData.content || moduleData.description || moduleData.summary || '';
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
    setCurrentParagraphIndex(index);

    const announcement = index === 0
      ? `Membaca materi: ${selectedModule?.title || ''}. Paragraf pertama: ${currentP}`
      : `Paragraf ${index + 1}: ${currentP}`;

    if (isBlind) {
      speak(announcement, 1.0, true);
    }

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
      readCurrentParagraph(nextIdx, moduleParagraphs);
    } else {
      if (isBlind) speak('Ini adalah akhir dari materi.', 1.0, true);
    }
  };

  const prevParagraph = () => {
    if (currentParagraphIndex > 0) {
      const prevIdx = currentParagraphIndex - 1;
      readCurrentParagraph(prevIdx, moduleParagraphs);
    } else {
      if (isBlind) speak('Ini adalah paragraf pertama.', 1.0, true);
    }
  };

  const selectModule = (m) => {
    setSelectedModule(m);
    setActiveTab(m.content ? 'text' : m.pdf_url ? 'pdf' : 'text');
    stopSpeaking();
    setIsPlayingAudio(false);
    setIsAudioPaused(false);

    const paragraphs = extractParagraphs(m);
    setModuleParagraphs(paragraphs);
    setCurrentParagraphIndex(0);

    const initialAIMsg = `Halo ${firstName}! 👋 Kak Bintang siap membantumu belajar materi "${m.title}". Pilihlah salah satu pertanyaan cepat atau tanyakan apapun yang mau kamu tahu ya!`;

    setChatMessages([
      {
        role: 'ai',
        content: initialAIMsg
      }
    ]);

    if (isBlind) {
      speak(`Membuka materi ${m.title}. Mata pelajaran ${m.subject || 'Umum'}. Menyiapkan pembacaan materi.`, 1.0, true);
      setTimeout(() => {
        readCurrentParagraph(0, paragraphs);
      }, 2000);
    }

    if (isMute) {
      showSubtitle(`Membuka ${m.title}.`, "success");
    }

    if (window.innerWidth < 1024) {
      setIsChatExpanded(false);
    }
  };

  const closeModule = () => {
    setSelectedModule(null);
    stopSpeaking();
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
  };

  const handleAskAI = async (e, customQuery) => {
    if (e) e.preventDefault();
    const query = customQuery || userQuestion;
    if (!query.trim() || isAsking || !selectedModule) return;

    setUserQuestion('');
    setChatMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsAsking(true);

    try {
      const result = await askMateriAI(query, selectedModule.id, {
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
      const errorMsg = "Maaf ya, Kak Bintang sedang kendala koneksi. Coba tanyakan lagi ya!";
      setChatMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
      if (isBlind) speak(errorMsg, 1.0, true);
    } finally {
      setIsAsking(false);
    }
  };

  const handleEmojiReaction = (reactionType) => {
    if (!selectedModule) return;

    if (reactionType === 'like') {
      const msg = `Wah, hebat sekali ${firstName}! Kak Bintang senang kamu paham materi "${selectedModule.title}". Terus tingkatkan semangat belajarmu ya! ⭐`;
      setChatMessages(prev => [...prev, { role: 'ai', content: msg }]);
      if (isBlind) speak(msg);
    } else if (reactionType === 'confused') {
      const prompt = `Kak, bagian mana dari materi "${selectedModule.title}" yang paling sering bikin bingung anak SD? Jelaskan dengan contoh sangat sederhana.`;
      handleAskAI(null, prompt);
    } else if (reactionType === 'love') {
      const msg = `Terima kasih ${firstName}! Kamu luar biasa. Mari kita belajar topik seru berikutnya! 🎉`;
      setChatMessages(prev => [...prev, { role: 'ai', content: msg }]);
      if (isBlind) speak(msg);
    }
  };

  const getSafePdfUrl = (url) => {
    if (!url) return "";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    const cleanUrl = url.split('#')[0];
    return `${cleanUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  };

  const filteredModules = useMemo(() =>
    modules.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (m.content && m.content.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSubject = selectedSubject === 'Semua' || (m.subject && m.subject.toLowerCase() === selectedSubject.toLowerCase());
      return matchSearch && matchSubject;
    }),
    [modules, searchQuery, selectedSubject]
  );

  // Subject Card Details & Emojis
  const getSubjectMeta = (subjectName) => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('ipa') || s.includes('sains')) {
      return { emoji: '🧪', name: 'IPA & Sains', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', tagBg: 'bg-emerald-500' };
    }
    if (s.includes('matematika') || s.includes('mtk')) {
      return { emoji: '🔢', name: 'Matematika Cerdas', bg: 'bg-amber-50 text-amber-700 border-amber-200', tagBg: 'bg-amber-500' };
    }
    if (s.includes('indonesia') || s.includes('indo') || s.includes('bahasa')) {
      return { emoji: '🇮🇩', name: 'Bahasa Indonesia', bg: 'bg-purple-50 text-purple-700 border-purple-200', tagBg: 'bg-purple-500' };
    }
    if (s.includes('pkn') || s.includes('pancasila')) {
      return { emoji: '🦅', name: 'PKn & Pancasila', bg: 'bg-rose-50 text-rose-700 border-rose-200', tagBg: 'bg-rose-500' };
    }
    return { emoji: '📖', name: subjectName || 'Umum', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', tagBg: 'bg-indigo-600' };
  };

  // Font Size Classes based on fontSizeLevel
  const paragraphFontSizeClass = useMemo(() => {
    switch (fontSizeLevel) {
      case 0: return 'text-xs sm:text-sm';
      case 1: return 'text-sm sm:text-base';
      case 2: return 'text-base sm:text-lg';
      case 3: return 'text-lg sm:text-xl';
      default: return 'text-sm sm:text-base';
    }
  }, [fontSizeLevel]);

  return (
    <div
      className="h-screen bg-slate-50 flex font-sans overflow-hidden text-slate-800"
      data-module-selected={!!selectedModule}
    >
      <StudentSidebar />

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-white">
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-white">
          {selectedModule ? (
            /* READER VIEW (WHEN A MODULE IS OPEN) */
            <div className="flex-1 flex flex-col overflow-hidden relative bg-white">

              {/* TOP NAVIGATION & CONTROL BAR */}
              <div className="bg-white border-b border-slate-200 px-3 py-2 sm:px-6 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 z-30 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={closeModule}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 border border-slate-200/80"
                    title="Kembali ke Perpustakaan Materi"
                  >
                    <HiArrowLeft className="text-sm text-slate-500" />
                    <span>Daftar Materi</span>
                  </button>

                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-800 text-xs sm:text-sm truncate leading-tight">
                      {selectedModule.title}
                    </h2>
                    <p className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider truncate flex items-center gap-1">
                      <span>{selectedModule.subject || 'Pelajaran SD'}</span>
                      <span>•</span>
                      <span>Paragraf {currentParagraphIndex + 1} / {moduleParagraphs.length || 1}</span>
                    </p>
                  </div>
                </div>

                {/* Reader Controls: Audio Player & Text Size Adjuster */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">

                  {/* Text Size Scale Toggles (For Low Vision / SD 1-2) */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
                    <button
                      onClick={() => setFontSizeLevel(prev => Math.max(0, prev - 1))}
                      disabled={fontSizeLevel === 0}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 disabled:opacity-30 rounded-lg text-xs"
                      title="Kecilkan Teks"
                    >
                      <HiZoomOut className="text-base" />
                    </button>
                    <span className="text-[10px] font-black px-1 text-indigo-700 uppercase">
                      {fontSizeLevel === 0 ? 'S' : fontSizeLevel === 1 ? 'M' : fontSizeLevel === 2 ? 'L' : 'XL'}
                    </span>
                    <button
                      onClick={() => setFontSizeLevel(prev => Math.min(3, prev + 1))}
                      disabled={fontSizeLevel === 3}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 disabled:opacity-30 rounded-lg text-xs"
                      title="Besarkan Teks"
                    >
                      <HiZoomIn className="text-base" />
                    </button>
                  </div>

                  {/* Audio Controls */}
                  <button
                    onClick={prevParagraph}
                    disabled={currentParagraphIndex === 0}
                    className="p-2 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
                    title="Paragraf Sebelumnya"
                  >
                    <HiChevronDoubleLeft className="text-sm" />
                    <span className="hidden md:inline">Sblm</span>
                  </button>

                  {isPlayingAudio && !isAudioPaused ? (
                    <button
                      onClick={pauseReadingModule}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      title="Jeda Pembacaan Suara"
                    >
                      <HiPause className="text-sm" /> Jeda
                    </button>
                  ) : (
                    <button
                      onClick={resumeReadingModule}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      title="Baca Materi / Lanjut Suara"
                    >
                      <HiPlay className="text-sm" /> {isAudioPaused ? 'Lanjut' : 'Putar Suara'}
                    </button>
                  )}

                  <button
                    onClick={nextParagraph}
                    disabled={currentParagraphIndex >= moduleParagraphs.length - 1}
                    className="p-2 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
                    title="Paragraf Berikutnya"
                  >
                    <span className="hidden md:inline">Lanjut</span>
                    <HiChevronDoubleRight className="text-sm" />
                  </button>

                  <button
                    onClick={() => readCurrentParagraph(currentParagraphIndex, moduleParagraphs)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center transition-all"
                    title="Baca Ulang Paragraf Ini"
                  >
                    <HiRefresh className="text-sm" />
                  </button>
                </div>
              </div>

              {/* READER BODY: SCROLLABLE CONTENT AREA */}
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">

                {/* CONTENT VIEWER (TEXT PARAGRAPHS & PDF) */}
                <div className={`flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 ${isChatExpanded ? 'h-[40vh] lg:h-full' : 'h-full'}`}>

                  {/* Header Card with Subject Badge & Visual Description Button */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 rounded-2xl border border-indigo-100 space-y-3 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getSubjectMeta(selectedModule.subject).bg}`}>
                          {getSubjectMeta(selectedModule.subject).emoji} {selectedModule.subject || 'Umum'}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <HiClock className="text-xs text-slate-400" /> ~{Math.max(2, Math.ceil(moduleParagraphs.length * 0.8))} Menit Baca
                        </span>
                      </div>

                      <button
                        onClick={() => speakImageDescription(selectedModule.title, selectedModule.description || selectedModule.content)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                        title="Bacakan Deskripsi Visual W3C"
                      >
                        <HiVolumeUp className="text-sm" /> Bacakan Deskripsi Visual
                      </button>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{selectedModule.title}</h1>

                    {selectedModule.description && (
                      <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                        {selectedModule.description}
                      </p>
                    )}

                    {/* Tab Switcher if PDF is available */}
                    {selectedModule.pdf_url && (
                      <div className="flex items-center gap-2 pt-2 border-t border-indigo-100/80">
                        <button
                          onClick={() => setActiveTab('text')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'text'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          📖 Teks Pelajaran
                        </button>
                        <button
                          onClick={() => setActiveTab('pdf')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'pdf'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          📄 Dokumen PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* READABLE TEXT PARAGRAPHS WITH INTERACTIVE HIGHLIGHTING */}
                  {activeTab === 'text' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Isi Pelajaran</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                            {moduleParagraphs.length} Paragraf
                          </span>
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400">Ketuk paragraf untuk mendengarkan</span>
                      </div>

                      {moduleParagraphs.map((paragraph, idx) => {
                        const isCurrent = isPlayingAudio && currentParagraphIndex === idx;
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.005 }}
                            onClick={() => readCurrentParagraph(idx, moduleParagraphs)}
                            className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer border ${
                              isCurrent
                                ? 'bg-indigo-50/95 border-indigo-500 text-indigo-950 font-medium shadow-md ring-2 ring-indigo-400/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {idx + 1}
                              </span>
                              <p className={`flex-1 ${paragraphFontSizeClass} leading-relaxed font-normal whitespace-pre-wrap`}>
                                {paragraph}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  readCurrentParagraph(idx, moduleParagraphs);
                                }}
                                className={`p-2 rounded-xl transition-all shrink-0 ${
                                  isCurrent
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-100'
                                }`}
                                title="Dengarkan Paragraf Ini"
                              >
                                <HiVolumeUp className="text-base" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Tap Emoji Feedback Cards (Helper for Tunawicara / Mute Students) */}
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 mt-6">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <HiSparkles className="text-amber-500 text-sm" />
                          <span>Bagaimana pemahamanmu tentang materi ini?</span>
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => handleEmojiReaction('like')}
                            className="px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>⭐ Paham & Suka</span>
                          </button>
                          <button
                            onClick={() => handleEmojiReaction('confused')}
                            className="px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-amber-50 hover:border-amber-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>❓ Masih Bingung</span>
                          </button>
                          <button
                            onClick={() => handleEmojiReaction('love')}
                            className="px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-rose-50 hover:border-rose-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>❤️ Sangat Seru</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF VIEWER CONTAINER */}
                  {activeTab === 'pdf' && selectedModule.pdf_url && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen PDF</span>
                        <a
                          href={selectedModule.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-800 transition-all"
                        >
                          Layar Penuh <HiExternalLink className="text-xs" />
                        </a>
                      </div>

                      <div className="w-full h-[550px] sm:h-[650px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                        <iframe
                          src={getSafePdfUrl(selectedModule.pdf_url)}
                          className="w-full h-full border-none"
                          title={`Materi PDF: ${selectedModule.title}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Accessibility Footnote */}
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-medium text-slate-600 flex items-center gap-2">
                    <HiLightBulb className="text-amber-500 text-base shrink-0" />
                    <span>Materi mendukung pembacaan otomatis W3C & navigasi suara interaktif Kak Bintang.</span>
                  </div>

                </div>

                {/* AI CHAT & TANYA MATERI PANEL (WITH TAP-TO-ASK FOR TUNAWICARA) */}
                <div className={`
                  flex flex-col min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 transition-all duration-300 z-[105]
                  lg:w-[360px] xl:w-[400px] shrink-0
                  ${isChatExpanded ? 'h-[60vh]' : 'h-[52px]'} lg:h-full
                `}>
                  <div
                    onClick={() => window.innerWidth < 1024 && setIsChatExpanded(!isChatExpanded)}
                    className="h-[52px] shrink-0 bg-indigo-600 text-white px-4 flex items-center justify-between cursor-pointer lg:cursor-default"
                  >
                    <div className="flex items-center gap-2.5">
                      <BintangAvatar size="xs" state="idle" />
                      <div>
                        <h3 className="font-bold text-xs">Tanya Kak Bintang</h3>
                        <p className="text-[10px] text-indigo-200">Sahabat Belajar Inklusif</p>
                      </div>
                    </div>
                    <div className="lg:hidden">
                      {isChatExpanded ? <HiChevronDown className="text-lg" /> : <HiChevronUp className="text-lg" />}
                    </div>
                  </div>

                  <div className={`flex-1 min-h-0 overflow-hidden flex flex-col ${!isChatExpanded && 'hidden lg:flex'}`}>
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`
                            max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs break-words overflow-hidden
                            ${msg.role === 'ai' ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none font-medium' : 'bg-indigo-600 text-white rounded-tr-none font-medium'}
                          `}>
                            {msg.role === 'ai' && (
                              <span className="text-[10px] font-bold text-indigo-600 block mb-1 flex items-center gap-1">
                                🤖 Kak Bintang AI
                              </span>
                            )}
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                            {msg.role === 'ai' && (
                              <button
                                onClick={() => speak(msg.content, 1.0, true)}
                                className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                              >
                                <HiVolumeUp /> Dengarkan
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {isAsking && <div className="text-indigo-600 font-bold text-xs animate-pulse px-2">Bintang sedang berpikir...</div>}
                      <div ref={chatEndRef} />
                    </div>

                    {/* TAP-TO-ASK QUICK CHIPS (HELPER FOR TUNAWICARA / SPEECH-IMPAIRED) */}
                    <div className="px-3 pt-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                      {[
                        { label: '💡 Penjelasan Sederhana', q: 'Kak Bintang, jelaskan materi ini dengan kalimat sederhana untuk anak SD ya!' },
                        { label: '📝 Contoh Sehari-hari', q: 'Berikan contoh kejadian nyata sehari-hari seputar materi ini.' },
                        { label: '🎯 Poin Penting', q: 'Apa saja 3 poin paling penting yang wajib aku ingat dari materi ini?' },
                        { label: '✏️ Kuis Latihan', q: 'Berikan 1 soal kuis latihan singkat tentang materi ini!' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskAI(null, item.q)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full whitespace-nowrap transition-all shrink-0"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100">
                      <form onSubmit={handleAskAI} className="flex gap-2">
                        <input
                          type="text" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)}
                          placeholder="Tanyakan materi ini..."
                          onFocus={() => window.innerWidth < 1024 && setIsChatExpanded(true)}
                          className="flex-1 px-3.5 py-2 bg-slate-100 border border-slate-200/60 rounded-xl outline-none text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                        <button
                          type="submit"
                          disabled={isAsking || !userQuestion.trim()}
                          className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-30"
                        >
                          <HiPaperAirplane className="text-xs rotate-45" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* LIBRARY VIEW (PERPUSTAKAAN INKLUSIF SD) */
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 bg-slate-50/50">
              <div className="max-w-5xl mx-auto space-y-6">

                {/* Engaging Header Banner featuring Kak Bintang Avatar & Accessibility Badge */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden md:block">
                    <BintangAvatar size="lg" state="idle" />
                  </div>

                  <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-100 inline-block">
                        Perpustakaan Inklusif SD Kelas 1-6
                      </span>
                      {isBlind && (
                        <span className="px-2.5 py-0.5 bg-amber-400/90 text-slate-900 rounded-full text-[10px] font-extrabold uppercase">
                          👁️ Mode Suara Tunanetra
                        </span>
                      )}
                      {isDeaf && (
                        <span className="px-2.5 py-0.5 bg-emerald-400/90 text-slate-900 rounded-full text-[10px] font-extrabold uppercase">
                          👂 Mode Caption Tunarungu
                        </span>
                      )}
                      {isMute && (
                        <span className="px-2.5 py-0.5 bg-purple-400/90 text-slate-900 rounded-full text-[10px] font-extrabold uppercase">
                          💬 Mode Sentuh Tunawicara
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                      Halo {firstName}! 👋
                    </h1>
                    <p className="text-xs sm:text-sm font-normal text-indigo-100/95 leading-relaxed">
                      Selamat datang di Perpustakaan Materi Kak Bintang! Pilihlah materi favoritmu di bawah ini untuk membaca teks pelajaran, mendengarkan pembacaan suara otomatis, atau bertanya langsung ke Kak Bintang.
                    </p>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="relative w-full sm:w-72">
                    <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Cari materi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                  </div>

                  {/* Subject Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                    {['Semua', 'IPA', 'Matematika', 'Bahasa Indonesia', 'PKn'].map((s) => {
                      const isActive = selectedSubject === s;
                      const meta = getSubjectMeta(s);
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSubject(s)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 border flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          <span>{meta.emoji}</span>
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modules Grid */}
                {loading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 animate-pulse">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                        <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredModules.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                    <HiBookOpen className="text-5xl text-slate-300 mx-auto" />
                    <h3 className="font-bold text-slate-700 text-base">Materi Belum Tersedia</h3>
                    <p className="text-xs text-slate-400">Tidak ada materi yang cocok dengan pencarian atau mata pelajaran ini.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredModules.map((m) => {
                      const meta = getSubjectMeta(m.subject);
                      return (
                        <motion.div
                          key={m.id}
                          whileHover={{ y: -4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectModule(m)}
                          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${meta.bg}`}>
                                <span>{meta.emoji}</span>
                                <span>{m.subject || 'Umum'}</span>
                              </span>
                              {m.pdf_url && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  PDF
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {m.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                              {m.description || m.content || 'Klik untuk membaca materi dan mendengarkan suara Kak Bintang.'}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                            <span className="flex items-center gap-1">
                              <span>Mulai Belajar</span>
                              <span className="text-xs">🚀</span>
                            </span>
                            <HiChevronRight className="text-base group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
      `}</style>
    </div>
  );
};

export default StudentModules;
