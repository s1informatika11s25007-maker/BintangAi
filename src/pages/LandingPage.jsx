import React from 'react';
import {
  ShieldCheck,
  Bot,
  Heart,
  ArrowRight,
  Shield,
  Cpu,
  Users,
  FileCheck,
  BarChart3,
  MessageSquare,
  Zap,
  Quote
} from 'lucide-react';

export default function LandingPage({ onGoToLogin, onGoToRegister, onDirectDemoLogin }) {
  const mainFeatures = [
    {
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: 'Manajemen Kewajiban',
      desc: 'Lacak semua kewajiban perawatan secara real-time dengan sistem bitemporal dan aturan dinamis.'
    },
    {
      icon: Shield,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      title: 'Verifikasi Bukti',
      desc: 'Pastikan setiap tugas memiliki bukti yang valid dan dapat diaudit dengan mudah.'
    },
    {
      icon: Cpu,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      title: 'Analisis AI Agent',
      desc: 'Deteksi risiko, temukan kesenjangan kompetensi, dan berikan rekomendasi berbasis data.'
    },
    {
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      title: 'Rekrutmen & Kompetensi',
      desc: 'Cari dan verifikasi tenaga kerja yang sesuai dengan kebutuhan perawatan.'
    },
    {
      icon: BarChart3,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      title: 'Dashboard & Laporan',
      desc: 'Pantau progres, kelola tim, dan dapatkan laporan lengkap secara otomatis.'
    },
    {
      icon: Heart,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      title: 'Portal Keluarga',
      desc: 'Berbagi informasi yang aman dan transparan dengan keluarga (opsional).'
    }
  ];

  const steps = [
    {
      num: '1',
      icon: MessageSquare,
      title: 'Input & Observasi',
      desc: 'Laporan teks/suara dari pengasuh atau sistem.'
    },
    {
      num: '2',
      icon: Cpu,
      title: 'Analisis AI',
      desc: 'AI mengekstrak fakta, menentukan status, dan membuat kewajiban.'
    },
    {
      num: '3',
      icon: Zap,
      title: 'Eksekusi & Verifikasi',
      desc: 'Sistem menugaskan, memeriksa bukti, dan memvalidasi penyelesaian.'
    },
    {
      num: '4',
      icon: FileCheck,
      title: 'Report & Insight',
      desc: 'Laporan otomatis dan rekomendasi untuk pengambilan keputusan.'
    }
  ];

  const testimonials = [
    {
      quote: "Sejak pakai SambungJaga, semua tugas lebih jelas dan tidak ada lagi yang terlewat. Tim kami jadi lebih fokus pada perawatan.",
      name: "Siti Rahma",
      role: "Supervisor Panti",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
    },
    {
      quote: "Fitur AI-nya sangat membantu, terutama untuk mencatat observasi dan mencari tenaga yang sesuai.",
      name: "Budi Santoso",
      role: "Pengasuh / Perawat",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80"
    },
    {
      quote: "Kami merasa lebih tenang karena bisa melihat perkembangan orang tua kami secara transparan.",
      name: "Rina Wijaya",
      role: "Anak dari Lansia",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
    }
  ];

  return (
    <div className="space-y-16 py-4 w-full">
      {/* HERO SECTION MATCHING REFERENCE IMAGE WITH ELEGANT HEADLINE GRADIENT */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50/60 via-blue-50/40 to-sky-100/50 p-6 sm:p-10 border border-sky-100 shadow-xl shadow-sky-100/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Hero Text Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Teknologi AI untuk Perawatan Lansia yang Lebih{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">
                Terhubung dan Terpercaya
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              SambungJaga membantu fasilitas perawatan lansia mengelola kewajiban, memverifikasi tugas, dan memastikan setiap tindakan tercatat dengan aman, transparan, dan dapat diaudit.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onGoToLogin}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center space-x-2"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDirectDemoLogin('supervisor')}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs transition text-center"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>

            {/* 4 Feature Pills Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-sky-200/60 text-xs">
              <div className="flex items-center space-x-2 bg-white/80 p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">AI Orchestration</div>
                  <div className="text-[10px] text-slate-500">AI Kernel</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/80 p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Keamanan Data</div>
                  <div className="text-[10px] text-slate-500">UU PDP</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/80 p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                <Users className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Multi-Peran</div>
                  <div className="text-[10px] text-slate-500">Pengasuh & Wali</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/80 p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Terpercaya</div>
                  <div className="text-[10px] text-slate-500">Superagent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Orangtua.jpeg Photo (Seamless & Frameless) + Speech Bubbles & 3D Robot Mascot */}
          <div className="lg:col-span-7 relative flex justify-center w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/15 w-full">
              <img
                src="/Orangtua.jpeg"
                onError={(e) => { e.target.src = '/elderly-care.svg'; }}
                alt="Perawatan Lansia SambungJaga AI"
                className="w-full h-[450px] sm:h-[500px] lg:h-[560px] object-cover rounded-3xl transform hover:scale-[1.01] transition duration-500"
              />

              {/* OVERLAY BADGE LEFT: AI Agent Chat Bubble pointing to elderly woman on left */}
              <div className="absolute top-5 left-4 sm:left-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-200/80 max-w-[230px] sm:max-w-[260px] text-left animate-float">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-600 mb-1">
                  <Bot className="w-4 h-4 text-sky-600" />
                  <span>AI Agent</span>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold leading-tight">
                  Tugas harian telah diselesaikan dan bukti telah diverifikasi.
                </p>
              </div>

              {/* OVERLAY GROUP RIGHT: Speech Bubble "Kondisi Lansia: Stabil" positioned TOP-LEFT above 3D Robot Mascot */}
              <div className="absolute bottom-1 right-1 sm:bottom-3 sm:right-3 z-20 flex flex-col items-end pointer-events-none">

                {/* Speech Bubble Above-Left of Robot */}
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200/90 flex items-center space-x-2.5 mb-1 animate-float relative shadow-sky-900/10 mr-12 sm:mr-16">
                  <div className="p-1.5 rounded-full bg-rose-100 text-rose-600 shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block leading-none">Kondisi Lansia</span>
                    <span className="text-xs font-black text-emerald-600">Stabil</span>
                  </div>
                  {/* Speech Bubble Arrow pointing down-right to Robot Mascot */}
                  <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-b border-r border-slate-200/90 transform rotate-45"></div>
                </div>

                {/* 3D Robot Mascot Image */}
                <img
                  src="/Friendly Futuristic Robot Mascot.png"
                  alt="Friendly Futuristic Robot Mascot"
                  className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.25)]"
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FITUR UTAMA SECTION */}
      <section id="fitur" className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Fitur Utama</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Solusi lengkap untuk manajemen perawatan <span className="text-sky-600 font-bold">lansia</span> yang lebih cerdas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md shadow-slate-200/40 hover:shadow-xl hover:border-sky-300 transition space-y-3"
              >
                <div className={`w-10 h-10 rounded-2xl ${feat.color} border flex items-center justify-center font-bold`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* BAGAIMANA SAMBUNGJAGA BEKERJA? SECTION */}
      <section id="cara-kerja" className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Bagaimana SambungJaga Bekerja?</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Dari laporan hingga tindakan, <span className="text-sky-600 font-bold">semua terhubung dalam satu</span> ekosistem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center space-y-3 relative">
                <div className="w-7 h-7 mx-auto rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {step.num}
                </div>
                <div className="w-10 h-10 mx-auto rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimoni" className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Dipercaya oleh Panti dan Keluarga</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Bersama SambungJaga, kami bisa memberikan perawatan terbaik dengan lebih tenang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md shadow-slate-200/40 space-y-4 flex flex-col justify-between">
              <Quote className="w-6 h-6 text-sky-400 opacity-60" />
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{t.quote}"
              </p>

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
