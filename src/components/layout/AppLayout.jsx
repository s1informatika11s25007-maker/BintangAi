import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiBookOpen, HiLightningBolt, HiUserCircle, HiChatAlt2, HiPlusCircle, HiSparkles } from 'react-icons/hi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { isBlind } = useAccessibility();

  if (!profile) return <>{children}</>;

  const role = profile.role;

  const getSiswaNav = () => {
    const baseNav = [
      { label: 'Home', icon: <HiHome />, path: '/student/dashboard' },
      { label: 'AI Tutor', icon: <HiSparkles className="text-indigo-600" />, path: profile?.disability_type === 'tunanetra' ? '/student/playground' : '/student/tanya-ai' },
      { label: 'Quiz', icon: <HiLightningBolt />, path: '/student/tasks' },
      { label: 'Materi', icon: <HiBookOpen />, path: '/student/modules' },
      { label: 'Profil', icon: <HiUserCircle />, path: '/profile' },
    ];

    // Sisipkan fitur Mata Pintar di posisi kedua jika siswa Tunarungu
    if (profile?.disability_type === 'tunarungu') {
      baseNav.splice(1, 0, {
        label: 'Mata Pintar',
        icon: <HiSparkles className="text-emerald-500 scale-125" />,
        path: '/student/live-captions'
      });
    }

    return baseNav;
  };

  const navItems = {
    siswa: getSiswaNav(),
    guru: [
      { label: 'Home', icon: <HiHome />, path: '/teacher/dashboard' },
      { label: 'Upload', icon: <HiPlusCircle />, path: '/teacher/upload' },
      { label: 'Tugas', icon: <HiLightningBolt />, path: '/teacher/create-task' },
      { label: 'Chat', icon: <HiChatAlt2 />, path: '/teacher/chat' },
      { label: 'Profil', icon: <HiUserCircle />, path: '/profile' },
    ],
    ortu: [
      { label: 'Home', icon: <HiHome />, path: '/parent/dashboard' },
      { label: 'Chat', icon: <HiChatAlt2 />, path: '/parent/chat' },
      { label: 'Profil', icon: <HiUserCircle />, path: '/profile' },
    ]
  };

  const currentNav = navItems[role] || [];

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const isFullScreenPage = ['/student/tanya-ai', '/student/playground'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-indigo-100 overflow-x-hidden relative">
      {/* Dynamic Background */}
      {!isFullScreenPage && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-200/20 blur-[100px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-blue-100/10 blur-[80px] rounded-full" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile Top Bar - Added to match desktop sidebar logo */}
        {!isFullScreenPage && (
          <header className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-[90]">
            <div
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate('/')}
            >
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Bintang<span className="text-indigo-600">Ai</span></span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-white transition-all shadow-sm"
            >
              <HiUserCircle size={24} />
            </button>
          </header>
        )}

        <main className={`flex-1 w-full relative ${isFullScreenPage ? 'pb-0' : 'pb-28 lg:pb-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Enhanced Glassmorphism */}
      {!isFullScreenPage && (
        <nav className="fixed bottom-4 left-4 right-4 z-[100] lg:hidden bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] px-2 py-2">
          <div className="flex items-center justify-around">
            {currentNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all"
                >
                  <motion.span
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      color: isActive ? '#4F46E5' : '#94A3B8'
                    }}
                    className="text-2xl"
                  >
                    {item.icon}
                  </motion.span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill-mobile"
                      className="absolute inset-0 bg-indigo-50 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
