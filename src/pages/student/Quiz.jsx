// pages/student/Quiz.jsx — UPDATED TO USE FEATURE-BASED API
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import ConfettiEffect from '@/components/feedback/ConfettiEffect';
import GestureCameraOverlay from '@/features/accessibility/components/GestureCameraOverlay';
import { useGlobalVoiceNav } from '@/features/accessibility/hooks/useGlobalVoiceNav';
import { useGestureControl } from '@/features/accessibility/hooks/useGestureControl';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { submitResultApi } from '@/features/quiz/api/submitResultApi';

const StudentQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, updateXP, fetchProfile } = useAuthStore();
  const { showSubtitle } = useSubtitle();
  const { isBlind, isDeaf, isMute } = useAccessibility();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [existingResult, setExistingResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [resultsDetail, setResultsDetail] = useState([]);

  const timerRef = useRef(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    // Sound removed as requested
  }, [currentIndex, currentQ, isBlind, finished, alreadyDone, questions.length]);

  useEffect(() => {
    // Sound removed as requested
  }, [finished, alreadyDone, isBlind, quiz, existingResult, score, questions.length, loading]);

  const {
    videoRef, canvasRef, isActive: camActive, gestureLabel, lastGesture, confidence, handDetected
  } = useGestureControl({
    enabled: isMute,
    onGesture: (gesture, action) => {
      if (!currentQ || finished) return;
      const gestureToAnswer = { 'point_up': 0, 'peace': 1, 'three_fingers': 2, 'four_fingers': 3 };
      if (gestureToAnswer[gesture] !== undefined && selectedAnswer === null) {
        handleAnswer(gestureToAnswer[gesture]);
      }
      if (action === 'stop' || gesture === 'fist') finishQuiz();
    }
  });

  useEffect(() => {
    if (id && profile?.id) fetchQuizData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [id, profile?.id]);

  useEffect(() => {
    if (!finished && !alreadyDone && !loading) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, questions, finished, alreadyDone, loading]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchQuizData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assignment info first to ensure we have the title even if quiz isn't generated
      const { data: assignment, error: assignError } = await supabase
        .from('assignments')
        .select('title, subject')
        .eq('id', id)
        .single();

      if (assignError) throw assignError;

      // Temporary object to hold title if quiz fetch fails
      const mockQuiz = { assignments: assignment };
      setQuiz(mockQuiz);

      // 2. Fetch the actual quiz questions
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('assignment_id', id)
        .maybeSingle();

      if (quizData) {
        setQuiz({ ...quizData, assignments: assignment });
        setQuestions(quizData.questions || []);
      }

      // 3. Check for existing submission
      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', id)
        .eq('student_id', profile.id)
        .maybeSingle();

      if (sub?.status === 'submitted' || sub?.status === 'graded') {
        setAlreadyDone(true);
        setExistingResult(sub);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || finished || alreadyDone) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(index);

    const correctIdx = currentQ.correctIndex !== undefined ? currentQ.correctIndex : currentQ.correct_answer;
    const isCorrect = index !== -1 && (
      index === Number(correctIdx) ||
      currentQ.options[index] === currentQ.correct_answer
    );

    const resultItem = {
      question: currentQ.text || currentQ.question,
      userAnswer: index !== -1 ? currentQ.options[index] : 'Waktu Habis',
      correctAnswer: currentQ.options[Number(correctIdx)] || currentQ.correct_answer,
      isCorrect
    };

    setResultsDetail(prev => [...prev, resultItem]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
      if (isDeaf) showSubtitle('✅ Benar!', 'success');
    } else {
      if (isDeaf) showSubtitle(index === -1 ? '⏰ Waktu Habis!' : '❌ Salah', 'error');
    }

    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        goNext();
      }, 1500);
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (finished || alreadyDone || isSubmitting) return;
    setIsSubmitting(true);

    const xpGained = score * 20;
    const finalScore = Math.round((score / questions.length) * 100);
    const incorrectCount = questions.length - score;

    try {
      await submitResultApi(id, profile.id, finalScore, resultsDetail, score, incorrectCount);

      await updateXP(xpGained);
      await fetchProfile(profile.id);

      setFinished(true);
      setShowConfetti(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setFinished(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 md:w-20 md:h-20 border-4 md:border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <h2 className="font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-base animate-pulse">Menyiapkan Petualangan...</h2>
    </div>
  );

  if (!loading && questions.length === 0 && !alreadyDone) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-10 text-center">
      <span className="text-7xl md:text-9xl mb-6 md:mb-8">🎈</span>
      <h2 className="font-black text-slate-900 text-2xl md:text-3xl mb-4 uppercase leading-tight">Wah, Soal Belum Siap!</h2>
      <p className="text-slate-500 font-bold mb-8 md:mb-10 max-w-md uppercase tracking-wide text-sm md:text-base">Sepertinya Kak Bintang sedang menyiapkan soal yang seru untukmu. Coba cek lagi nanti ya!</p>
      <button
        onClick={() => navigate(-1)}
        className="w-full md:w-auto bg-slate-900 text-white font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm md:text-base"
      >
        Kembali Dulu
      </button>
    </div>
  );

  if (isSubmitting) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 md:mb-8">
        <div className="absolute inset-0 border-4 md:border-8 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 md:border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl">🚀</div>
      </div>
      <h2 className="font-black text-slate-900 text-xl md:text-3xl uppercase tracking-wider mb-2">Mengirim Jawaban...</h2>
      <p className="text-indigo-500 font-bold uppercase tracking-widest animate-bounce text-sm">Tunggu sebentar ya!</p>
    </div>
  );

  if (alreadyDone || finished) {
    const finalData = alreadyDone ? existingResult : { total_score: Math.round((score / questions.length) * 100), correct_count: score, incorrect_count: questions.length - score, results_detail: resultsDetail };
    const displayScore = finalData?.total_score || 0;
    const displayCorrect = finalData?.correct_count || 0;
    const displayIncorrect = finalData?.incorrect_count || 0;
    const displayDetails = finalData?.results_detail || [];

    return (
      <div className="min-h-screen bg-white flex flex-col items-center p-4 md:p-6 pt-8 md:pt-10 overflow-y-auto pb-24">
        <ConfettiEffect active={showConfetti} />
        <span className="text-6xl md:text-7xl mb-4 drop-shadow-2xl animate-bounce">🏆</span>
        <h2 className="font-black text-slate-900 text-3xl md:text-4xl mb-2 uppercase text-center tracking-tighter">Hasil Petualanganmu</h2>
        <p className="text-indigo-500 font-black mb-6 md:mb-8 uppercase tracking-[0.1em] md:tracking-[0.2em] text-center bg-indigo-50 px-4 md:px-6 py-2 rounded-full border-2 border-indigo-100 text-[10px] md:text-xs">
          {quiz?.assignments?.title || 'Latihan Selesai'}
        </p>

        <div className="w-full max-w-2xl bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 mb-8 md:mb-10 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-b-[8px] md:border-b-[12px] border-indigo-900/30">
          <div className="relative z-10">
            <p className="text-indigo-200 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 text-[10px] md:text-[11px]">Skor Akhir</p>
            <p className="text-7xl md:text-[7rem] font-black text-white leading-none mb-6 drop-shadow-lg">{displayScore}</p>
            <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-2 md:gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-3 rounded-2xl md:rounded-2xl border border-white/20">
                <p className="text-[8px] md:text-[9px] font-black text-indigo-200 uppercase mb-1">Benar</p>
                <p className="text-lg md:text-xl font-black text-white">✅ {displayCorrect}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-3 rounded-2xl md:rounded-2xl border border-white/20">
                <p className="text-[8px] md:text-[9px] font-black text-indigo-200 uppercase mb-1">Salah</p>
                <p className="text-lg md:text-xl font-black text-white">❌ {displayIncorrect}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 md:px-6 py-3 md:py-3 rounded-2xl md:rounded-2xl border border-white/20 col-span-2 md:col-span-1">
                <p className="text-[8px] md:text-[9px] font-black text-indigo-200 uppercase mb-1">Total Soal</p>
                <p className="text-lg md:text-xl font-black text-white">📖 {questions.length || displayDetails.length}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 md:w-80 h-40 md:h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-30 md:w-60 h-30 md:h-60 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>

        {displayDetails.length > 0 && (
          <div className="w-full max-w-2xl mb-8 md:mb-12 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="h-8 md:h-10 w-2 md:w-2.5 bg-indigo-600 rounded-full"></div>
              <h3 className="font-black text-slate-800 text-xl md:text-2xl uppercase tracking-tighter">Analisis Belajar</h3>
            </div>

            {displayDetails.map((res, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className={`p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border-4 border-b-[8px] md:border-b-[10px] ${res.isCorrect ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100/50' : 'bg-rose-50 border-rose-200 shadow-rose-100/50'} shadow-xl`}
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                   <span className="font-black text-slate-400 text-[8px] md:text-xs uppercase tracking-[0.2em]">Soal {idx + 1}</span>
                   {res.isCorrect ? (
                     <span className="bg-emerald-500 text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full uppercase">Sempurna!</span>
                   ) : (
                     <span className="bg-rose-500 text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full uppercase">Coba Lagi</span>
                   )}
                </div>

                <p className="font-black text-slate-800 text-lg md:text-2xl mb-4 md:mb-6 leading-tight">{res.question}</p>

                <div className="space-y-2 md:space-y-3">
                  <div className={`p-4 md:p-5 rounded-xl md:rounded-2xl flex items-center justify-between ${res.isCorrect ? 'bg-emerald-100/50' : 'bg-rose-100/50'}`}>
                    <div>
                      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-1">Jawaban Kamu</p>
                      <p className={`font-black text-sm md:text-lg ${res.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{res.userAnswer}</p>
                    </div>
                    <span className="text-2xl md:text-3xl">{res.isCorrect ? '👍' : '👎'}</span>
                  </div>

                  {!res.isCorrect && (
                    <div className="p-4 md:p-5 bg-indigo-50 rounded-xl md:rounded-2xl border-2 border-indigo-100 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase mb-1">Jawaban Benar</p>
                        <p className="font-black text-indigo-700 text-sm md:text-lg">{res.correctAnswer}</p>
                      </div>
                      <span className="text-2xl md:text-3xl">✨</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/student/dashboard')}
          className="w-full max-w-sm bg-slate-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] uppercase tracking-[0.1em] md:tracking-[0.2em] text-lg md:text-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all mb-10 flex items-center justify-center gap-3 md:gap-4"
        >
          <span>Kembali ke Daftar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-32">
      {isMute && (
        <GestureCameraOverlay videoRef={videoRef} canvasRef={canvasRef} isActive={camActive}
          gestureLabel={gestureLabel} lastGesture={lastGesture} confidence={confidence} handDetected={handDetected} />
      )}

      <header className={`bg-white border-b-2 md:border-b-2 border-slate-100 p-4 md:p-5 sticky z-20 flex justify-between items-center transition-all ${isBlind || isMute ? 'top-4 md:top-6' : 'top-0'}`}>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate(-1)} className="p-2 md:p-2.5 bg-slate-50 rounded-xl md:rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="max-w-[120px] md:max-w-none">
            <h1 className="font-black text-slate-900 uppercase text-xs md:text-lg leading-none mb-1 truncate">{quiz?.assignments?.title || 'Quiz'}</h1>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{quiz?.assignments?.subject || 'Pelajaran'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <div className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-xl border-2 md:border-2 font-black transition-all ${timeLeft < 10 ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
            <span className="text-lg md:text-2xl tabular-nums">{timeLeft}s</span>
          </div>
          <div className="bg-slate-900 text-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="w-full bg-slate-200 h-3 md:h-4 rounded-full mb-6 md:mb-8 overflow-hidden border-2 md:border-2 border-white shadow-inner">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-lg border-b-[8px] md:border-b-[8px] border-slate-100 mb-6 md:mb-8 relative overflow-hidden ${isDeaf && selectedAnswer !== null ? (resultsDetail[currentIndex]?.isCorrect ? 'ring-8 ring-emerald-500/20' : 'ring-8 ring-rose-500/20') : ''}`}
          >
            <div className={`absolute top-0 left-0 w-1 md:w-1.5 h-full ${isDeaf && selectedAnswer !== null ? (resultsDetail[currentIndex]?.isCorrect ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-indigo-600'}`}></div>
            <h2 className="font-black text-slate-800 text-xl md:text-2xl leading-tight">{currentQ?.text || currentQ?.question}</h2>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          {currentQ?.options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] text-left font-black transition-all flex items-center gap-4 md:gap-5 border-2 md:border-2 border-b-[6px] md:border-b-[6px] ${
                selectedAnswer === i
                  ? (resultsDetail[currentIndex]?.isCorrect
                      ? 'bg-emerald-600 border-emerald-800 text-white shadow-xl -translate-y-1'
                      : 'bg-rose-600 border-rose-800 text-white shadow-xl -translate-y-1')
                  : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <span className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-xl flex items-center justify-center font-black text-lg md:text-xl flex-shrink-0 ${selectedAnswer === i ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm md:text-lg flex-1">{opt}</span>
            </motion.button>
          ))}
        </div>

        {currentIndex === questions.length - 1 && selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 md:mt-10 text-center"
          >
            <button
              onClick={finishQuiz}
              className="w-full bg-emerald-600 text-white font-black py-5 md:py-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl uppercase tracking-widest text-lg md:text-xl hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 md:gap-4"
            >
              <span>Selesaikan Petualangan</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );

};

export default StudentQuiz;
