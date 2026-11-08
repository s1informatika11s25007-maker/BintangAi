import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import ConfettiEffect from '@/components/feedback/ConfettiEffect';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useGlobalVoiceNav } from '@/features/accessibility/hooks/useGlobalVoiceNav';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import {
  HiLightningBolt, HiCheckCircle, HiChevronRight,
  HiClock, HiSparkles, HiInformationCircle, HiChevronLeft
} from 'react-icons/hi';

const StudentTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, fetchProfile } = useAuthStore();
  const { speak } = useVoice();
  const { showSubtitle } = useSubtitle();
  const { isMute, isBlind } = useAccessibility();

  const [task, setTask] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [initialDuration, setInitialDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submissionRecord, setSubmissionRecord] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState([]);
  const [avatarState, setAvatarState] = useState('idle');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { if (id) fetchTaskData(); }, [id, profile?.id]);

  useEffect(() => {
    let timer;
    if (started && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev === 11) showSubtitle("Waktu hampir habis!", "warning");
            return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && started) { handleSubmit(); }
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const fetchTaskData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data: taskData } = await supabase.from('assignments').select('*, modules(title)').eq('id', id).maybeSingle();
      if (!taskData) return;
      setTask(taskData);

      const duration = (taskData.duration_minutes || 30) * 60;
      setTimeLeft(duration);
      setInitialDuration(duration);

      const { data: qs } = await supabase.from('assignment_questions').select('*, assignment_question_options(*)').eq('assignment_id', id).order('order_index', { ascending: true });
      setQuestions(qs || []);

      const { data: existingSub } = await supabase.from('submissions').select('*').eq('assignment_id', id).eq('student_id', profile.id).maybeSingle();

      if (existingSub) {
        setSubmissionRecord(existingSub);
        const { data: ansDetails } = await supabase.from('submission_answers').select('*, assignment_questions(question_text, ai_explanation, ai_feedback_wrong, assignment_question_options(*))').eq('submission_id', existingSub.id);
        setSubmissionDetails(ansDetails || []);
      } else if (qs && qs.length > 0) {
        // DIRECT ENTRANCE: Langsung aktifkan mode pengerjaan
        setStarted(true);
        setCurrentStep(1);
        if (isMute) showSubtitle(`✅ Quiz Dimulai! Soal 1 dari ${qs.length}.`, 'success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChoice = (index) => {
    const q = questions[currentStep - 1];
    if (!q || !q.assignment_question_options) return;
    const opt = q.assignment_question_options[index];
    if (!opt) return;
    setAnswers({ ...answers, [q.id]: { selected_option_id: opt.id } });
    if (isMute) showSubtitle(`Jawaban ${String.fromCharCode(65 + index)} terpilih. 5 Jari untuk Lanjut.`, 'success');
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
        setCurrentStep(prev => prev + 1);
        setAvatarState('thinking');
        setTimeout(() => setAvatarState('idle'), 1000);
    } else {
        handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setAvatarState('thinking');
    try {
      let totalScore = 0;
      let correctCount = 0;
      const questionResults = questions.map(q => {
        const ans = answers[q.id] || {};
        const correctOpt = q.assignment_question_options?.find(o => o.is_correct);
        const isCorrect = ans.selected_option_id === correctOpt?.id;
        if (isCorrect) {
          totalScore += (q.points || 10);
          correctCount += 1;
        }
        return { question_id: q.id, selected_option_id: ans.selected_option_id, is_correct: isCorrect };
      });

      const { data: sub, error: subError } = await supabase.from('submissions').insert({
        assignment_id: id,
        student_id: profile.id,
        status: 'graded',
        total_score: totalScore,
        submitted_at: new Date().toISOString(),
        started_at: new Date(Date.now() - (initialDuration - timeLeft) * 1000).toISOString()
      }).select().single();

      if (subError) throw subError;
      await supabase.from('submission_answers').insert(questionResults.map(res => ({ ...res, submission_id: sub.id })));
      await supabase.rpc('add_xp', { amount: correctCount * 20 });
      await fetchProfile(profile.id);

      setShowConfetti(true);
      setSubmissionRecord(sub);
      const { data: ansDetails } = await supabase.from('submission_answers').select('*, assignment_questions(question_text, ai_explanation, ai_feedback_wrong, assignment_question_options(*))').eq('submission_id', sub.id);
      setSubmissionDetails(ansDetails || []);
      setStarted(false);
      setAvatarState('happy');
    } catch (err) {
      console.error("Gagal mengirim quiz:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
       <p className="font-black text-indigo-600 uppercase tracking-[0.3em] text-xs">Mempersiapkan Quiz...</p>
    </div>
  );

  if (submissionRecord) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 md:p-6 pt-12 overflow-y-auto pb-32">
        <ConfettiEffect active={showConfetti} />
        <header className="text-center mb-8 md:mb-16 space-y-4">
           <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[2rem] md:rounded-3xl shadow-xl flex items-center justify-center text-4xl md:text-5xl mx-auto border border-slate-50">🏆</div>
           <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Hasil Petualanganmu</h2>
           <p className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] md:tracking-[0.4em]">{task?.title}</p>
        </header>

        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-100/50 text-center relative overflow-hidden mb-12 border border-slate-50">
           <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Skor Akhir</p>
           <p className="text-7xl md:text-[10rem] font-black text-indigo-600 leading-none mb-8 md:mb-10">{submissionRecord.total_score}</p>
           <button
            onClick={() => navigate('/student/tasks')}
            data-gesture-item="true"
            className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
           >
             Kembali ke Daftar
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden text-slate-800">

      <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-50/50 rounded-full blur-[60px] md:blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 py-4 md:py-6 sticky top-0 z-[60] flex justify-between items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all group">
           <HiChevronLeft className="text-2xl md:text-3xl group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex flex-col items-center max-w-[150px] md:max-w-none">
            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate w-full text-center">{task?.title}</span>
            {started && (
              <div className="flex items-center gap-1 md:gap-2">
                 <HiClock className={`${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-indigo-600'} text-xs md:text-base`} />
                 <span className={`text-xs md:text-sm font-black ${timeLeft < 60 ? 'text-rose-500' : 'text-slate-900'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                 </span>
              </div>
            )}
        </div>
        <BintangAvatar state={avatarState} size="sm" />
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12 relative z-10">
        <AnimatePresence mode="wait">
          {started && (
            <motion.div key="questions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-10">
               {questions.map((q, idx) => idx + 1 === currentStep && (
                 <div key={q.id} className="space-y-6 md:space-y-10">
                    <div className="bg-white p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-slate-50 relative min-h-[400px] md:min-h-[500px] flex flex-col">

                       <div className="flex items-center justify-between mb-8 md:mb-12">
                          <div className="px-4 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">Soal {idx + 1} / {questions.length}</div>
                          <div className="flex gap-1.5 md:gap-2">
                             {[...Array(questions.length)].map((_, dotIdx) => (
                               <div key={dotIdx} className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full transition-all duration-500 ${dotIdx + 1 === currentStep ? 'bg-indigo-600 w-6 md:w-8 shadow-lg shadow-indigo-100' : 'bg-slate-100'}`} />
                             ))}
                          </div>
                       </div>

                       <h3 className="text-xl md:text-5xl font-black text-slate-800 leading-tight mb-8 md:mb-16 tracking-tight">{q.question_text}</h3>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mt-auto">
                            {q.assignment_question_options?.map((opt, oi) => (
                                <button
                                    key={opt.id}
                                    data-gesture-item="true"
                                    onClick={() => handleAnswerChoice(oi)}
                                    className={`group p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 text-left flex items-center justify-between gap-4 md:gap-6 transition-all duration-300 relative overflow-hidden ${
                                      answers[q.id]?.selected_option_id === opt.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100'
                                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 md:gap-6 relative z-10 flex-1">
                                       <span className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-2xl transition-all flex-shrink-0 ${
                                          answers[q.id]?.selected_option_id === opt.id
                                            ? 'bg-white text-indigo-600 shadow-lg'
                                            : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                       }`}>
                                          {String.fromCharCode(65 + oi)}
                                       </span>
                                       <span className="font-bold text-sm md:text-xl">{opt.option_text}</span>
                                    </div>

                                    {isMute && (
                                       <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-lg md:text-xl relative z-10 ${answers[q.id]?.selected_option_id === opt.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                          {['☝️', '✌️', '🤘', '🖖'][oi]}
                                       </div>
                                    )}

                                    {answers[q.id]?.selected_option_id === opt.id && <HiCheckCircle className="text-2xl md:text-3xl relative z-10 flex-shrink-0" />}
                                </button>
                            ))}
                       </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 md:gap-6">
                       <button
                          onClick={handleNext}
                          data-gesture-item="true"
                          className="w-full md:w-auto group relative px-8 md:px-16 py-5 md:py-7 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
                       >
                          <div className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
                             {currentStep === questions.length ? "Selesaikan Kuis 🏁" : "Lanjut ➡️"}
                          </div>
                          <div className="absolute inset-0 bg-indigo-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                       </button>

                       {isMute && (
                         <div className="flex items-center gap-3 bg-white px-6 md:px-8 py-3 md:py-4 rounded-full border border-slate-100 shadow-sm">
                            <span className="text-xl md:text-2xl">✋</span>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Tunjukkan 5 Jari untuk Lanjut</p>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isMute && (
        <div className="fixed bottom-0 inset-x-0 bg-indigo-600 text-white py-3 md:py-4 px-4 md:px-10 flex flex-col md:flex-row items-center justify-between z-[100] shadow-[0_-10px_50px_rgba(79,70,229,0.3)] gap-2 md:gap-0">
           <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 flex items-center justify-center animate-pulse"><HiSparkles className="text-xs md:text-base" /></div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Pemandu Jari Aktif</p>
           </div>
           <div className="flex gap-4 md:gap-10">
              <div className="flex items-center gap-2 md:gap-3">
                 <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] md:text-xs font-black">1-4</span>
                 <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest">Pilih Jawaban</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                 <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] md:text-xs font-black">5</span>
                 <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest">Lanjut / Selesai</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );

};

export default StudentTaskDetail;
