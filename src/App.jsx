import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { InactivityLogout } from './features/auth';
import { Subtitles, GlobalGestureCamera, BlindAIAssistant, AccessibilityProvider, useAccessibilityStore } from './features/accessibility';
import { useAI } from './features/ai-tutor';
import { useNotification } from './hooks/useNotification';
import NotificationContainer from './components/feedback/NotificationContainer';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/index';
import StudentDashboard from './pages/student/Dashboard';
import StudentModules from './pages/student/Modules';
import StudentPlayground from './pages/student/Playground';
import StudentTanyaAI from './pages/student/TanyaAI';
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

function AppContent() {
  const { reapplyMode } = useAccessibilityStore();
  const location = useLocation();
  const { pingSupabase, pingAI } = useAI();
  const { showToast } = useNotification();

  // 🛡️ GLOBAL ALERT HIJACKING
  // Memastikan tidak ada satupun 'alert()' browser yang muncul di seluruh project
  useEffect(() => {
    window.alert = (message) => {
      // Jika pesan mengandung kata berhasil, gunakan type success
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

  return (
    <AccessibilityProvider>
      <NotificationContainer />
      <Subtitles />
      <BlindAIAssistant />
      <GlobalGestureCamera />
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/live-captions" element={<StudentLiveCaptions />} />
          <Route path="/student/modules" element={<StudentModules />} />
          <Route path="/student/playground" element={<StudentPlayground />} />
          <Route path="/student/tanya-ai" element={<StudentTanyaAI />} />
          <Route path="/student/tasks" element={<StudentTasks />} />
          <Route path="/student/task/:id" element={<StudentTaskDetail />} />
          <Route path="/student/quiz/:id" element={<StudentQuiz />} />
          <Route path="/student/collaboration" element={<StudentCollaboration />} />
          <Route path="/student/collaboration/:groupId" element={<StudentCollaboration />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/upload" element={<TeacherUploadModule />} />
          <Route path="/teacher/create-task" element={<TeacherCreateTask />} />
          <Route path="/teacher/chat" element={<TeacherChat />} />
          <Route path="/teacher/collaboration" element={<TeacherCollaboration />} />
          <Route path="/teacher/collaboration/:groupId" element={<TeacherCollaboration />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/chat" element={<ParentChat />} />
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
