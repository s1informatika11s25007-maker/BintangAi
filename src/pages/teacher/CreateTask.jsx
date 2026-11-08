import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import { useNotification } from '@/hooks/useNotification';
import {
  HiSparkles, HiUsers, HiAcademicCap, HiSearch,
  HiX, HiChevronLeft, HiPlus, HiSave, HiClipboardList
} from 'react-icons/hi';

const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const TeacherCreateTask = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { generateAIQuiz, loading: aiHookLoading } = useAI();
  const { showToast } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Targeting states
  const [allStudents, setAllStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  const subjects = [
    { id: 'matematika', name: 'Matematika', icon: '🔢', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { id: 'ipa', name: 'IPA', icon: '🔬', color: 'green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    { id: 'ips', name: 'IPS', icon: '🌏', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    { id: 'english', name: 'English', icon: '🇬🇧', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' }
  ];

  const [aiConfig, setAiConfig] = useState({ subject: 'matematika', gradeLevel: 4, difficulty: 'medium', types: ['multiple_choice'], count: 5, topic: '' });
  const [taskData, setTaskData] = useState({ title: '', description: '', deadlineDate: '', deadlineTime: '', duration: '', isPublic: false, enrollKey: '' });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (editId) fetchExistingTask();
    else {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskData(prev => ({ ...prev, deadlineDate: tomorrow.toISOString().split('T')[0], deadlineTime: "23:59" }));
    }
    fetchTargetOptions();
  }, [editId]);

  const fetchTargetOptions = async () => {
    try {
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name, class_code')
        .eq('role', 'siswa')
        .order('full_name');

      setAllStudents(studentsData || []);

      const { data: classData } = await supabase
        .from('profiles')
        .select('class_code')
        .neq('class_code', null);

      const uniqueClasses = [...new Set(classData.map(c => c.class_code))].filter(Boolean).sort();
      setAllClasses(uniqueClasses);
    } catch (err) {
      console.error("Fetch Options Error:", err);
    }
  };

  const fetchExistingTask = async () => {
    setLoading(true);
    try {
      const { data: task } = await supabase.from('assignments').select('*, assignment_questions(*, assignment_question_options(*))').eq('id', editId).single();
      if (task) {
        const d = new Date(task.deadline);
        setTaskData({
          title: task.title || '',
          description: task.description || '',
          deadlineDate: d.toISOString().split('T')[0],
          deadlineTime: d.toTimeString().split(' ')[0].slice(0, 5),
          duration: task.duration_minutes?.toString() || '',
          isPublic: task.is_public !== false,
          enrollKey: task.enroll_key || ''
        });
        setSelectedStudents(task.target_students || []);
        setSelectedClasses(task.target_classes || []);
        const formattedQs = (task.assignment_questions || []).map(q => ({
          id: q.id,
          type: q.question_type,
          text: q.question_text,
          points: q.points,
          correctAnswer: q.rubric_text || q.correct_answer,
          feedbackCorrect: q.ai_explanation || '',
          feedbackWrong: q.ai_feedback_wrong || '',
          difficulty: q.difficulty_level || 'medium',
          options: (q.assignment_question_options || []).map(o => ({ id: o.id, text: o.option_text, isCorrect: o.is_correct }))
        }));
        setQuestions(formattedQs);
      }
    } catch (err) {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiConfig.topic.trim() && !aiConfig.subject) return showToast("Pilih Mapel atau isi Topik", "error");
    setAiLoading(true);
    try {
      const selectedSub = subjects.find(s => s.id === aiConfig.subject);
      let finalTopic = aiConfig.topic.trim() || selectedSub?.name || 'Umum';
      const response = await generateAIQuiz({
        subject: aiConfig.subject,
        topic: finalTopic,
        grade_level: aiConfig.gradeLevel,
        question_types: aiConfig.types,
        total_questions: aiConfig.count,
        difficulty: aiConfig.difficulty,
        title: taskData.title,
        instructions: taskData.description,
        duration_minutes: parseInt(taskData.duration) || 30
      });

      if (response?.success && response.quiz) {
        // Handle different possible response structures from Edge Function
        const quiz = response.quiz.quiz || response.quiz;

        if (!quiz.questions || !Array.isArray(quiz.questions)) {
          throw new Error("⚠️ Format kuis tidak valid dari AI. Coba kurangi jumlah soal atau pilih topik yang lebih spesifik.");
        }

        setTaskData(prev => ({
          ...prev,
          title: prev.title || quiz.quiz_title || quiz.title,
          description: prev.description || quiz.instructions,
          duration: prev.duration || (quiz.duration_minutes || quiz.duration)?.toString() || '30'
        }));

        const formatted = quiz.questions.map((q) => {
          const isPG = q.type === 'multiple_choice' || (q.options && q.options.length > 0);
          const correctIdx = q.correct_answer_index ?? q.correct;

          return {
            id: generateId(),
            type: isPG ? 'pilihan_ganda' : 'esai',
            text: q.question || q.text || '',
            points: q.points || (isPG ? 10 : 20),
            correctAnswer: isPG
              ? (q.options && correctIdx !== undefined ? q.options[correctIdx] : (q.correct_answer || ''))
              : (q.correct_answer || q.correct || ''),
            feedbackCorrect: q.feedback_correct || q.explanation || '',
            feedbackWrong: q.feedback_wrong || '',
            difficulty: aiConfig.difficulty,
            options: isPG ? (q.options || []).map((opt, i) => ({
              id: generateId(),
              text: opt,
              isCorrect: i === correctIdx || opt === q.correct_answer
            })) : []
          };
        });

        setQuestions(formatted);
        setShowAIModal(false);
        showToast(`✨ AI berhasil menyusun ${formatted.length} soal untukmu!`, "success");
      } else {
        throw new Error(response?.message || "Gagal menghasilkan kuis");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      showToast(err.message || "Terjadi kesalahan pada AI", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const addQuestion = (type) => {
    setQuestions([...questions, { id: generateId(), type, text: '', points: type === 'pilihan_ganda' ? 10 : 20, correctAnswer: '', feedbackCorrect: '', feedbackWrong: '', difficulty: 'medium', options: type === 'pilihan_ganda' ? [{ id: generateId(), text: '', isCorrect: true }, { id: generateId(), text: '', isCorrect: false }, { id: generateId(), text: '', isCorrect: false }, { id: generateId(), text: '', isCorrect: false }] : [] }]);
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleSubmit = async () => {
    if (!profile?.id) return showToast("Sesi habis.", "error");
    if (!taskData.title.trim()) return showToast("Isi judul dulu", "error");
    if (questions.length === 0) return showToast("Tambah soal dulu", "error");
    setLoading(true);
    try {
      const payload = {
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        deadline: `${taskData.deadlineDate}T${taskData.deadlineTime}:00`,
        duration_minutes: parseInt(taskData.duration) || null,
        ai_grading_enabled: true,
        show_explanation: true,
        is_public: taskData.isPublic,
        enroll_key: taskData.isPublic ? null : taskData.enrollKey?.trim(),
        teacher_id: profile.id,
        target_students: selectedStudents.length > 0 ? selectedStudents : [],
        target_classes: selectedClasses.length > 0 ? selectedClasses : []
      };

      let assignmentId = editId;
      if (editId) {
        const { error: updErr } = await supabase.from('assignments').update(payload).eq('id', editId);
        if (updErr) throw updErr;
        await supabase.from('assignment_questions').delete().eq('assignment_id', editId);
      } else {
        const { data, error } = await supabase.from('assignments').insert(payload).select().single();
        if (error) throw error;
        assignmentId = data.id;
      }

      for (const q of questions) {
        const { data: insertedQ, error: qErr } = await supabase.from('assignment_questions').insert({
          assignment_id: assignmentId,
          question_type: q.type, // Menyesuaikan kembali ke 'pilihan_ganda' atau 'esai' sesuai constraint database
          question_text: q.text.trim(),
          points: q.points,
          ai_explanation: q.feedbackCorrect,
          ai_feedback_wrong: q.feedbackWrong,
          difficulty_level: q.difficulty,
          rubric_text: q.type === 'esai' ? q.correctAnswer : null,
          correct_answer: q.type === 'pilihan_ganda' ? q.correctAnswer : null
        }).select().single();

        if (qErr) throw qErr;

        if (q.type === 'pilihan_ganda' && insertedQ) {
          await supabase.from('assignment_question_options').insert(q.options.map((o, i) => ({
            question_id: insertedQ.id,
            option_text: o.text.trim(),
            is_correct: !!(o.is_correct || o.isCorrect),
            order_index: i
          })));
        }
      }
      showToast("✅ QuizKu Berhasil diterbitkan!", "success");
      setTimeout(() => navigate('/teacher/dashboard?tab=assignments'), 1500);
    } catch (err) {
      showToast("Gagal simpan: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleClass = (code) => {
    setSelectedClasses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const currentSubject = subjects.find(s => s.id === aiConfig.subject) || subjects[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 p-6 lg:p-12 overflow-x-hidden text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/teacher/dashboard')} className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all hover:shadow-md group">
               <HiChevronLeft className="text-3xl group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">{editId ? 'Sempurnakan' : 'Rancang'} QuizKu</h1>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">Integrasi AI & Penargetan Cerdas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 font-black text-xs uppercase rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 shadow-sm active:scale-95"
            >
              <HiSparkles className="text-lg" /> AI Auto Generate
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiSave className="text-lg" />}
              <span>{editId ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-10">
            {/* Base Config */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 p-10 space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Judul QuizKu</label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={e => setTaskData({...taskData, title: e.target.value})}
                    placeholder="Contoh: Operasi Hitung Campuran"
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] font-bold text-slate-800 outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Status Akses</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-[1.8rem] border border-slate-100">
                    <button onClick={() => setTaskData({...taskData, isPublic: true})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${taskData.isPublic ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>🌍 Publik</button>
                    <button onClick={() => setTaskData({...taskData, isPublic: false})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${!taskData.isPublic ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>🔒 Privat</button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Instruksi Pengerjaan</label>
                <textarea
                  value={taskData.description}
                  onChange={e => setTaskData({...taskData, description: e.target.value})}
                  rows={3}
                  placeholder="Berikan arahan untuk siswa agar memahami cara mengerjakan kuis ini..."
                  className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold text-slate-800 outline-none focus:border-indigo-100 focus:bg-white transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                 <HiClipboardList className="text-2xl text-indigo-600" />
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Daftar Pertanyaan</h3>
              </div>

              {questions.map((q, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={q.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8 relative group hover:shadow-xl hover:border-indigo-50 transition-all duration-500">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-lg">{i+1}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Isian Singkat'}</span>
                        <div className="flex gap-1 mt-1">
                           {[...Array(q.type === 'pilihan_ganda' ? 3 : 5)].map((_, idx) => <div key={idx} className="w-1.5 h-1.5 rounded-full bg-indigo-100" />)}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setQuestions(questions.filter(x => x.id !== q.id))} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
                       <HiX />
                    </button>
                  </div>

                  <textarea
                    value={q.text}
                    onChange={e => updateQuestion(q.id, { text: e.target.value })}
                    placeholder="Apa pertanyaannya?"
                    className="w-full bg-transparent font-black text-2xl text-slate-800 outline-none resize-none placeholder:text-slate-200"
                    rows={2}
                  />

                  {q.type === 'pilihan_ganda' ? (
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      {q.options.map((opt, oi) => (
                        <div key={opt.id} className={`flex items-center gap-4 p-5 rounded-[1.8rem] border-2 transition-all duration-300 ${opt.isCorrect ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                          <button
                            onClick={() => updateQuestion(q.id, { options: q.options.map((o, idx) => ({ ...o, isCorrect: idx === oi })), correctAnswer: opt.text })}
                            className={`w-12 h-12 rounded-2xl font-black text-lg transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}
                          >
                            {String.fromCharCode(65+oi)}
                          </button>
                          <input
                            value={opt.text}
                            onChange={e => {
                              const newOpts = q.options.map((o, idx) => idx === oi ? { ...o, text: e.target.value } : o);
                              updateQuestion(q.id, { options: newOpts, correctAnswer: newOpts.find(o => o.isCorrect)?.text || '' });
                            }}
                            placeholder={`Pilihan ${String.fromCharCode(65+oi)}...`}
                            className="bg-transparent font-bold text-slate-700 outline-none w-full"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Kunci Jawaban Esai</label>
                       <input
                        value={q.correctAnswer}
                        onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        placeholder="Contoh: Fotosintesis"
                        className="w-full p-6 bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-3xl font-black text-indigo-600 outline-none text-xl"
                       />
                    </div>
                  )}
                </motion.div>
              ))}

              <div className="flex gap-6">
                <button onClick={() => addQuestion('pilihan_ganda')} className="flex-1 py-8 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3">
                  <HiPlus /> Tambah PG
                </button>
                <button onClick={() => addQuestion('esai')} className="flex-1 py-8 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3">
                  <HiPlus /> Tambah Isian
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Rules & Targeting */}
          <div className="lg:col-span-4 space-y-10">
            {/* Rules */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 p-10 space-y-10 sticky top-10">
              <div>
                 <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-8">⚙️ Aturan & Batas</h4>
                 <div className="space-y-8">
                   <div className="space-y-3">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Tenggat Waktu</label>
                     <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={taskData.deadlineDate} onChange={e => setTaskData({...taskData, deadlineDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-200" />
                        <input type="time" value={taskData.deadlineTime} onChange={e => setTaskData({...taskData, deadlineTime: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-200" />
                     </div>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Durasi Pengerjaan</label>
                     <div className="relative">
                        <input type="number" value={taskData.duration} onChange={e => setTaskData({...taskData, duration: e.target.value})} placeholder="30" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-800 outline-none focus:border-indigo-200 shadow-inner" />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-widest">Menit</span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Targeting System */}
              <div className="pt-10 border-t border-slate-50 space-y-10">
                 {/* Class Target */}
                 <div className="space-y-6">
                    <div>
                       <h3 className="text-sm font-black text-slate-900 flex items-center gap-3 mb-2"><HiAcademicCap className="text-indigo-600" /> Target Kelas</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Siswa di kelas ini akan otomatis menerima QuizKu</p>
                    </div>

                    <div className="relative">
                       <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input
                        type="text" placeholder="Cari kode kelas..." value={classSearch} onChange={e => setClassSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-50 rounded-2xl text-[10px] font-bold transition-all outline-none"
                       />
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
                       {allClasses.filter(c => c.toLowerCase().includes(classSearch.toLowerCase())).map(code => (
                          <button
                            key={code}
                            onClick={() => toggleClass(code)}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${selectedClasses.includes(code) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-600'}`}
                          >
                             {code}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Student Target */}
                 <div className="space-y-6">
                    <div>
                       <h3 className="text-sm font-black text-slate-900 flex items-center gap-3 mb-2"><HiUsers className="text-emerald-500" /> Target Individu</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gunakan untuk remedial atau pengayaan khusus</p>
                    </div>

                    <div className="relative">
                       <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input
                        type="text" placeholder="Cari nama siswa..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-50 rounded-2xl text-[10px] font-bold transition-all outline-none"
                       />
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar p-1">
                       {allStudents.filter(s => s.full_name.toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                          <button
                            key={s.id}
                            onClick={() => toggleStudent(s.id)}
                            className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${selectedStudents.includes(s.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-50 text-slate-700 hover:border-indigo-100'}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${selectedStudents.includes(s.id) ? 'bg-white/20' : 'bg-slate-50 text-indigo-600'}`}>
                                   {s.full_name.charAt(0)}
                                </div>
                                <div className="text-left">
                                   <p className="text-xs font-black truncate max-w-[120px]">{s.full_name}</p>
                                   <p className={`text-[8px] font-black uppercase tracking-widest ${selectedStudents.includes(s.id) ? 'text-indigo-200' : 'text-slate-400'}`}>{s.class_code || 'N/A'}</p>
                                </div>
                             </div>
                             {selectedStudents.includes(s.id) && <HiSave className="text-xl" />}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50 flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pertanyaan</span>
                    <span className="font-black text-slate-900 text-2xl tracking-tighter">{questions.length}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !aiLoading && setShowAIModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden p-12 space-y-10 border border-white">
              <div className="text-center space-y-3">
                <div className={`w-20 h-20 ${currentSubject.bg} ${currentSubject.text} rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-inner border-2 border-white`}>{currentSubject.icon}</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">AI Quiz Wizard</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Biarkan kecerdasan buatan menyusun kurikulum kuis anda</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => setAiConfig({...aiConfig, subject: s.id})} className={`p-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${aiConfig.subject === s.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'}`}>{s.name}</button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><label className="text-[8px] font-black text-slate-400 uppercase ml-3">Tingkat Kelas</label>
                    <select value={aiConfig.gradeLevel} onChange={e => setAiConfig({...aiConfig, gradeLevel: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl font-black text-xs outline-none">
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Kelas {g} SD</option>)}
                    </select>
                   </div>
                   <div className="space-y-2"><label className="text-[8px] font-black text-slate-400 uppercase ml-3">Jumlah Soal</label>
                    <input type="number" value={aiConfig.count} onChange={e => setAiConfig({...aiConfig, count: parseInt(e.target.value) || 1})} min="1" max="100" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl font-black text-xs outline-none" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><label className="text-[8px] font-black text-slate-400 uppercase ml-3">Kesulitan</label>
                    <select value={aiConfig.difficulty} onChange={e => setAiConfig({...aiConfig, difficulty: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl font-black text-xs outline-none">
                        <option value="easy">Mudah</option>
                        <option value="medium">Sedang</option>
                        <option value="hard">Tantangan (Hard)</option>
                    </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[8px] font-black text-slate-400 uppercase ml-3">Topik Spesifik (Opsional)</label>
                     <input type="text" value={aiConfig.topic} onChange={e => setAiConfig({...aiConfig, topic: e.target.value})} placeholder="Contoh: Pecahan, Magnet, ASEAN, dll" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl font-bold text-xs outline-none shadow-inner" />
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAIModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">Batal</button>
                <button onClick={handleGenerateAI} disabled={aiLoading} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  {aiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiSparkles className="text-xl" />}
                  <span>Generate</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherCreateTask;
