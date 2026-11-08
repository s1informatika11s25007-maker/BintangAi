import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  HiArrowLeft, HiCloudUpload, HiCheckCircle, HiSparkles,
  HiTag, HiInformationCircle, HiChevronRight, HiEye,
  HiUsers, HiAcademicCap, HiSearch, HiX
} from 'react-icons/hi';

const loadPdfJs = () => {
  return new Promise((resolve) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    document.head.appendChild(script);
  });
};

const TeacherUploadModule = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false); // Default false if targeting specific
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ publicModules: 0, totalStudents: 0 });

  // Targeting states
  const [allStudents, setAllStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
      fetchTargetOptions();
    }
  }, [profile?.id]);

  const fetchStats = async () => {
    if (!profile?.id) return;
    try {
      const { count: modulesCount } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', profile.id)
        .eq('is_public', true);

      let studentQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'siswa');
      if (profile.class_code) {
        studentQuery = studentQuery.eq('class_code', profile.class_code);
      }
      const { count: studentsCount } = await studentQuery;

      setStats({
        publicModules: modulesCount || 0,
        totalStudents: studentsCount || 0
      });
    } catch (err) {
      console.error("Stats Fetch Error:", err);
    }
  };

  const fetchTargetOptions = async () => {
    try {
      // Fetch all students in teacher's class or all students if needed
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name, class_code')
        .eq('role', 'siswa')
        .order('full_name');

      setAllStudents(studentsData || []);

      // Extract unique classes
      const { data: classData } = await supabase
        .from('profiles')
        .select('class_code')
        .neq('class_code', null);

      const uniqueClasses = [...new Set(classData.map(c => c.class_code))].filter(Boolean);
      setAllClasses(uniqueClasses);
    } catch (err) {
      console.error("Fetch Options Error:", err);
    }
  };

  const extractTextFromPdf = async (file) => {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    setLoading(true);

    try {
      const extractedText = await extractTextFromPdf(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('modules')
        .upload(`public/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('modules').getPublicUrl(`public/${fileName}`);

      const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '');

      const { error: dbError } = await supabase.from('modules').insert({
        title,
        pdf_url: publicUrl,
        content: extractedText,
        teacher_id: profile.id,
        is_public: isPublic,
        tags: tagArray,
        target_students: selectedStudents.length > 0 ? selectedStudents : [],
        target_classes: selectedClasses.length > 0 ? selectedClasses : [],
        summary: null
      });

      if (dbError) throw dbError;

      alert("Modul berhasil dipublikasikan secara spesifik! 🚀");
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Gagal mengirim modul. " + err.message);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 p-8 lg:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/teacher/dashboard')} className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-md">
              <HiArrowLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Kirim Materi Cerdas</h1>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">Penargetan Khusus Siswa & Kelas</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Judul Modul</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Masukkan judul materi..."
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-3xl font-bold text-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dokumen PDF</label>
                <div className={`relative group border-4 border-dashed rounded-[3rem] p-12 text-center transition-all ${file ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-100 hover:border-indigo-100 bg-slate-50/50'}`}>
                  <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {file ? '📄' : <HiCloudUpload className="text-slate-300" />}
                  </div>
                  <p className="text-sm font-black text-slate-800">{file ? file.name : 'Tarik atau Pilih PDF'}</p>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <div>
                      <h4 className="font-black text-slate-800 text-sm">Publikasikan Umum?</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Dapat dilihat oleh semua siswa di ekosistem</p>
                   </div>
                   <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-14 h-8 rounded-full transition-all relative ${isPublic ? 'bg-indigo-600' : 'bg-slate-300'}`}
                   >
                      <motion.div
                        animate={{ x: isPublic ? 24 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                   </button>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || !title || loading}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xl rounded-3xl shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4"
              >
                {loading ? 'Mengirim Data...' : 'Kirim Materi 🚀'}
              </button>
            </div>
          </div>

          {/* Targeted Controls */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-2"><HiAcademicCap className="text-indigo-600" /> Target Kelas</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih kelas yang akan menerima modul ini</p>
                </div>

                <div className="relative">
                   <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                    type="text" placeholder="Cari kode kelas..." value={classSearch} onChange={e => setClassSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-50 rounded-2xl text-xs font-bold transition-all outline-none"
                   />
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                   {allClasses.filter(c => c.toLowerCase().includes(classSearch.toLowerCase())).map(code => (
                      <button
                        key={code}
                        onClick={() => toggleClass(code)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedClasses.includes(code) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}
                      >
                         {code}
                      </button>
                   ))}
                </div>
             </div>

             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-2"><HiUsers className="text-emerald-500" /> Target Siswa</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kirim ke siswa tertentu (Opsional)</p>
                </div>

                <div className="relative">
                   <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                    type="text" placeholder="Cari nama siswa..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-50 rounded-2xl text-xs font-bold transition-all outline-none"
                   />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar p-1">
                   {allStudents.filter(s => s.full_name.toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                      <button
                        key={s.id}
                        onClick={() => toggleStudent(s.id)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedStudents.includes(s.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-50 text-slate-700 hover:border-indigo-100'}`}
                      >
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${selectedStudents.includes(s.id) ? 'bg-white/20' : 'bg-white text-indigo-600'}`}>
                               {s.full_name.charAt(0)}
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-black truncate max-w-[150px]">{s.full_name}</p>
                               <p className={`text-[8px] font-black uppercase tracking-widest ${selectedStudents.includes(s.id) ? 'text-indigo-200' : 'text-slate-400'}`}>{s.class_code || 'No Class'}</p>
                            </div>
                         </div>
                         {selectedStudents.includes(s.id) && <HiCheckCircle className="text-xl" />}
                      </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherUploadModule;
