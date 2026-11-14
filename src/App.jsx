import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { InactivityLogout } from './features/auth';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { Subtitles, GlobalGestureCamera, BlindAIAssistant, AccessibilityProvider, useAccessibilityStore } from './features/accessibility';
import MataPintarGlobalCaption from './features/accessibility/components/MataPintarGlobalCaption';
import { useAI } from './features/ai-tutor';
import { useNotification } from './hooks/useNotification';
import NotificationContainer from './components/feedback/NotificationContainer';
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute';

import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/index';
import StudentDashboard from './pages/student/Dashboard';
import StudentModules from './pages/student/Modules';
import StudentPlayground from './pages/student/Playground';
import StudentTanyaAI from './pages/student/TanyaAI';
import StudentInbox from './pages/student/Inbox';
import StudentTasks from './pages/student/Tasks';
import StudentLiveCaptions from './pages/student/LiveCaptions';
import StudentTaskDetail from './pages/student/TaskDetail';
import StudentQuiz from './pages/student/Quiz';
import StudentCollaboration from './pages/student/Collaboration';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherUploadModule from './pages/teacher/UploadModule';
import TeacherCreateTask from './pages/teacher/CreateTask';
import TeacherChat from './pages/teacher/Chat';
import TeacherCollaboration from './pages/teacher/Collaboration';
import ParentDashboard from './pages/parent/Dashboard';
import ParentChat from './pages/parent/Chat';
import MonitorPage from './pages/MonitorPage';

function AppContent() {
  const { reapplyMode } = useAccessibilityStore();
  const location = useLocation();
  const { pingSupabase, pingAI } = useAI();
  const { showToast } = useNotification();
  const { initializeAuth, isLoggingOut } = useAuthStore();

  // Initialize and verify authentication on app boot
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Global Alert Hijacking
  useEffect(() => {
    window.alert = (message) => {
      const isSuccess = /berhasil|success|✅/i.test(message);
      showToast(message, isSuccess ? 'success' : 'error');
      console.log("Alert Hijacked:", message);
    };
  }, [showToast]);

  useEffect(() => {
    const publicPaths = ['/', '/auth/login', '/auth/register'];
    const isPublic = publicPaths.includes(location.pathname);
    reapplyMode(isPublic);
  }, [location.pathname, reapplyMode]);

  useEffect(() => {
    pingSupabase();
    pingAI();
    const interval = setInterval(() => {
      pingSupabase();
      pingAI();
    }, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [pingSupabase, pingAI]);

  // Full-screen pure circular loading spinner during logout (NO TEXT)
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <NotificationContainer />
      <Subtitles />
      <MataPintarGlobalCaption />
      <BlindAIAssistant />
      <GlobalGestureCamera />
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/auth/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Dedicated Hidden Monitor Route (Protected by Password: Bintang123) */}
          <Route path="/monitor" element={<MonitorPage />} />

          {/* Profile Route (Accessible by all logged in roles) */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Siswa Routes (Only accessible by role: 'siswa') */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['siswa']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/live-captions" element={<ProtectedRoute allowedRoles={['siswa']}><StudentLiveCaptions /></ProtectedRoute>} />
          <Route path="/student/modules" element={<ProtectedRoute allowedRoles={['siswa']}><StudentModules /></ProtectedRoute>} />
          <Route path="/student/playground" element={<ProtectedRoute allowedRoles={['siswa']}><StudentPlayground /></ProtectedRoute>} />
          <Route path="/student/tanya-ai" element={<ProtectedRoute allowedRoles={['siswa']}><StudentTanyaAI /></ProtectedRoute>} />
          <Route path="/student/tasks" element={<ProtectedRoute allowedRoles={['siswa']}><StudentTasks /></ProtectedRoute>} />
          <Route path="/student/task/:id" element={<ProtectedRoute allowedRoles={['siswa']}><StudentTaskDetail /></ProtectedRoute>} />
          <Route path="/student/quiz/:id" element={<ProtectedRoute allowedRoles={['siswa']}><StudentQuiz /></ProtectedRoute>} />
          <Route path="/student/collaboration" element={<ProtectedRoute allowedRoles={['siswa']}><StudentCollaboration /></ProtectedRoute>} />
          <Route path="/student/collaboration/:groupId" element={<ProtectedRoute allowedRoles={['siswa']}><StudentCollaboration /></ProtectedRoute>} />
          <Route path="/student/inbox" element={<ProtectedRoute allowedRoles={['siswa']}><StudentInbox /></ProtectedRoute>} />

          {/* Teacher Routes (Only accessible by role: 'guru') */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['guru']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/upload" element={<ProtectedRoute allowedRoles={['guru']}><TeacherUploadModule /></ProtectedRoute>} />
          <Route path="/teacher/create-task" element={<ProtectedRoute allowedRoles={['guru']}><TeacherCreateTask /></ProtectedRoute>} />
          <Route path="/teacher/chat" element={<ProtectedRoute allowedRoles={['guru']}><TeacherChat /></ProtectedRoute>} />
          <Route path="/teacher/collaboration" element={<ProtectedRoute allowedRoles={['guru']}><TeacherCollaboration /></ProtectedRoute>} />
          <Route path="/teacher/collaboration/:groupId" element={<ProtectedRoute allowedRoles={['guru']}><TeacherCollaboration /></ProtectedRoute>} />

          {/* Parent Routes (Only accessible by role: 'ortu') */}
          <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['ortu']}><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/chat" element={<ProtectedRoute allowedRoles={['ortu']}><ParentChat /></ProtectedRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </AccessibilityProvider>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <InactivityLogout>
        <AppContent />
      </InactivityLogout>
    </BrowserRouter>
  );
}

export default App;
