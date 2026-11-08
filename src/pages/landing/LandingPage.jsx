import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { HiSparkles, HiUserGroup, HiArrowRight, HiMenu, HiX, HiEye, HiBadgeCheck, HiLightningBolt, HiMicrophone, HiHand } from 'react-icons/hi';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <HiMicrophone />,
      title: "Audio Interaktif (Tunanetra)",
      desc: "Navigasi suara penuh dan asisten audio yang membacakan materi secara detail.",
      accent: "indigo"
    },
    {
      icon: <HiHand />,
      title: "Kontrol Isyarat (Tunawicara)",
      desc: "Teknologi deteksi jari untuk mengontrol aplikasi tanpa perlu mengetik atau bersuara.",
      accent: "emerald"
    },
    {
      icon: <HiEye />,
      title: "Visual Adaptif (Tunarungu)",
      desc: "Subtitle otomatis dan panduan visual cerdas untuk setiap konten pembelajaran.",
      accent: "purple"
    }
  ];

  const steps = [
    { id: "01", title: "Daftar Profil Khusus", desc: "Pilih jenis disabilitas Anda agar sistem dapat menyesuaikan antarmuka secara otomatis." },
    { id: "02", title: "Pilih Materi Belajar", desc: "Akses berbagai modul pelajaran yang telah dioptimasi untuk kebutuhan khusus." },
    { id: "03", title: "Bimbingan Kak Bintang", desc: "Gunakan AI Tutor yang bisa mendengar, berbicara, dan memahami bahasa isyarat jari." },
    { id: "04", title: "Pantau Progres", desc: "Siswa mendapatkan badge prestasi, sementara orang tua menerima laporan perkembangan." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const textRevealVariants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden relative">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[1000] origin-left" style={{ scaleX }} />

      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-4 md:px-12 py-4 md:py-6 ${
        isScrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'
      }`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 px-6 md:px-8 py-3 md:py-4 rounded-full ${
          isScrolled ? 'bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/20' : 'bg-transparent'
        }`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 md:gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
              <span className="font-black text-lg md:text-xl text-white italic">B</span>
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-slate-800">Bintang<span className="text-indigo-600">Ai</span></span>
          </motion.div>

          <div className="flex items-center gap-4 md:gap-10">
            <button onClick={() => navigate('/auth/login')} className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-indigo-600 transition-colors">Masuk</button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth/register')}
              className="px-6 md:px-8 py-2 md:py-3 bg-slate-900 text-white rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
            >
              Daftar
            </motion.button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[100svh] flex flex-col justify-start md:justify-center px-6 overflow-hidden pt-48 md:pt-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] md:w-[50%] md:h-[50%] bg-indigo-100/40 rounded-full blur-[80px] md:blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] md:w-[50%] md:h-[50%] bg-violet-100/30 rounded-full blur-[80px] md:blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 md:space-y-12"
          >
            <div className="relative">
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[90px] font-black leading-[1.1] md:leading-[1] tracking-tight text-slate-900">
                <div className="overflow-hidden pb-1">
                  <motion.div variants={textRevealVariants}>BELAJAR TANPA</motion.div>
                </div>
                <div className="overflow-hidden flex flex-wrap gap-x-4 md:gap-x-8 pb-1">
                  <motion.span variants={textRevealVariants} className="text-indigo-600 italic">HAMBATAN.</motion.span>
                </div>
              </h1>
            </div>

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              <div className="max-w-2xl">
                <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed">
                  Platform E-Learning cerdas yang dirancang khusus untuk kemandirian belajar teman
                  <span className="text-slate-900 font-bold"> Tunanetra, Tunarungu, dan Tunawicara.</span>
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                    Inovasi Digital SLB
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6 pt-4 md:pt-6">
              <button
                onClick={() => navigate('/auth/login')}
                className="group relative px-8 md:px-10 py-5 md:py-6 bg-slate-900 text-white rounded-full overflow-hidden transition-all duration-500 hover:pr-14 flex items-center justify-center sm:justify-start"
              >
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em]">Coba Akun Demo</span>
                <HiArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="px-8 md:px-10 py-5 md:py-6 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all text-center"
              >
                Cara Kami Membantu
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="col-span-12 lg:col-span-8 bg-slate-50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 relative overflow-hidden group border border-slate-100"
            >
              <div className="relative z-10 space-y-6 md:space-y-8 max-w-lg">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                  <HiSparkles />
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-none text-slate-900">
                  AI Tutor yang <br className="hidden md:block" /> Mengerti Anda
                </h2>
                <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed">
                  Kak Bintang bukan sekadar AI. Ia bisa berbicara dengan Tunanetra, memberikan isyarat visual untuk Tunarungu, dan memahami gerakan jari Tunawicara.
                </p>
              </div>
              <div className="absolute right-[-5%] bottom-[-5%] w-1/2 h-1/2 bg-indigo-600/5 rounded-full blur-[60px] md:blur-[80px] group-hover:bg-indigo-600/10 transition-colors" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="col-span-12 lg:col-span-4 bg-indigo-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden group border border-indigo-500/20"
            >
              <HiLightningBolt className="text-[120px] md:text-[180px] absolute -right-6 md:-right-10 -bottom-6 md:-bottom-10 opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[250px] md:min-h-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl md:text-2xl">
                  <HiHand />
                </div>
                <div className="space-y-3 md:space-y-4 pt-12 md:pt-20">
                  <h3 className="text-2xl md:text-3xl font-black leading-tight">Navigasi <br className="hidden md:block" /> Tanpa Sentuh</h3>
                  <p className="text-indigo-100/80 text-xs md:text-sm font-medium leading-relaxed">
                    Kontrol aplikasi sepenuhnya menggunakan gerakan tangan di depan kamera, dirancang khusus untuk mobilitas terbatas.
                  </p>
                </div>
              </div>
            </motion.div>

            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="col-span-12 md:col-span-4 rounded-[1.5rem] md:rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-4 md:gap-6 group hover:scale-[1.02] transition-transform duration-500 border border-slate-100 bg-white shadow-sm"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl md:text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h4 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">{item.title}</h4>
                  <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-64 px-4 md:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 md:space-y-12"
            >
              <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em]">Kemitraan Inklusif</h2>
              <p className="text-4xl md:text-8xl font-black tracking-tighter leading-none text-slate-900">
                Teknologi yang <br className="hidden md:block" /> Memanusiakan.
              </p>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-md">
                Menggabungkan kecerdasan buatan tercanggih dengan empati untuk menciptakan ruang belajar yang setara bagi semua bintang.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
               {[
                 { label: "Aksesibilitas", value: "100%", desc: "Didesain untuk Disabilitas" },
                 { label: "Respon AI", value: "<2dtk", desc: "Interaksi Tanpa Jeda" },
                 { label: "Modul SLB", value: "Ratusan", desc: "Materi Terpersonalisasi" },
                 { label: "Dukungan", value: "24/7", desc: "Selalu Siap Membantu" }
               ].map((stat, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="p-8 md:p-10 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] space-y-3 md:space-y-4 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500"
                 >
                    <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{stat.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-24 px-8 border-t border-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl">B</div>
                  <span className="text-2xl font-black tracking-tighter text-slate-800">BintangAi</span>
                </div>
                <p className="text-slate-400 font-bold max-w-sm text-[10px] uppercase tracking-[0.2em] leading-loose">
                  Menyediakan pendidikan berkualitas melalui integrasi kecerdasan buatan untuk masa depan yang lebih inklusif bagi teman disabilitas.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-16 md:gap-32">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Menu Utama</h4>
                   <ul className="space-y-3">
                      <li><button onClick={() => navigate('/auth/login')} className="text-[10px] font-black uppercase text-slate-800 hover:text-indigo-600 transition-colors tracking-widest">Masuk</button></li>
                      <li><button onClick={() => navigate('/auth/register')} className="text-[10px] font-black uppercase text-slate-800 hover:text-indigo-600 transition-colors tracking-widest">Daftar Akun</button></li>
                      <li><button onClick={() => setShowAbout(true)} className="text-[10px] font-black uppercase text-slate-800 hover:text-indigo-600 transition-colors tracking-widest">Cara Kerja</button></li>
                   </ul>
                </div>
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Fitur Utama</h4>
                   <ul className="space-y-3">
                      <li><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">AI Tutor Suara</span></li>
                      <li><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Navigasi Isyarat</span></li>
                      <li><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Penyederhana Materi</span></li>
                   </ul>
                </div>
             </div>
          </div>
          <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">© 2026 BintangAi Ecosystem • Inovasi Pendidikan Inklusif</p>
             <div className="flex gap-8 text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privasi</span>
                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Keamanan</span>
             </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[200] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbout(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 35, stiffness: 250 }}
              className="relative w-full max-w-4xl h-full bg-[#FDFDFF] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-12 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-100">B</div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Misi BintangAi</h2>
                 </div>
                 <button onClick={() => setShowAbout(false)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center"><HiX size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-24 custom-scrollbar">
                 <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                       <h3 className="text-5xl font-black text-slate-900 leading-[1] tracking-tighter">Inklusi Lewat <br /> Inovasi AI.</h3>
                       <p className="text-slate-500 font-bold leading-relaxed text-sm uppercase tracking-[0.1em]">BintangAi hadir untuk menghapus batas pendidikan bagi mereka yang sering terabaikan oleh teknologi konvensional.</p>
                       <div className="flex gap-12">
                          <div><p className="text-4xl font-black text-indigo-600">Audio</p><p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">First Experience</p></div>
                          <div className="h-10 w-[1px] bg-slate-100" />
                          <div><p className="text-4xl font-black text-emerald-500">Hand</p><p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Gesture Control</p></div>
                       </div>
                    </div>
                    <div className="bg-indigo-600 p-12 rounded-[3.5rem] relative group overflow-hidden shadow-2xl shadow-indigo-200">
                       <HiSparkles className="text-[200px] text-white/5 absolute -top-10 -right-10" />
                       <h4 className="text-2xl font-black text-white mb-6 underline decoration-white/20">Visi Kami</h4>
                       <p className="text-indigo-100 font-bold leading-relaxed text-sm uppercase tracking-widest">Membangun platform pendidikan paling adaptif di Indonesia yang mampu memahami kebutuhan teman Tunanetra, Tunarungu, dan Tunawicara.</p>
                    </div>
                 </div>

                 <div className="space-y-12">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Alur Belajar Inklusif.</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                       {steps.map((step, idx) => (
                         <motion.div
                           key={idx}
                           whileHover={{ scale: 1.02 }}
                           className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-6"
                         >
                            <span className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black italic">{step.id}</span>
                            <div className="space-y-3">
                               <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">{step.title}</h4>
                               <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">{step.desc}</p>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                 </div>

                 <div className="p-16 bg-slate-900 rounded-[4rem] text-white text-center space-y-10 relative overflow-hidden">
                    <HiBadgeCheck className="text-7xl text-indigo-400 mx-auto" />
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black tracking-tight">Daftar</h3>
                       <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Bergabung dalam revolusi pendidikan inklusif Indonesia.</p>
                    </div>
                    <button onClick={() => navigate('/auth/register')} className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all">Daftar Sekarang</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        :root { scroll-behavior: smooth; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.1); border-radius: 10px; }

        .noise-bg {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          content: "";
          opacity: 0.05;
          z-index: 9999;
          pointer-events: none;
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        ::selection {
          background: #4f46e5;
          color: white;
        }
      ` }} />
      <div className="noise-bg" />
    </div>
  );
};

export default LandingPage;
