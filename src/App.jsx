import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useSambungJaga } from './hooks/useSambungJaga';
import PublicHeader from './components/layout/PublicHeader';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import RoleWorkspaceHeader from './components/layout/RoleWorkspaceHeader';
import Footer from './components/layout/Footer';

// Pre-Login Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Post-Login Pages
import CaregiverMobilePage from './pages/CaregiverMobilePage';
import SupervisorDashboardPage from './pages/SupervisorDashboardPage';
import HandoverPage from './pages/HandoverPage';
import ExecutionTracePage from './pages/ExecutionTracePage';
import FamilyPortalPage from './pages/FamilyPortalPage';
import SimulatorLabPage from './pages/SimulatorLabPage';
import RuleLibraryPage from './pages/RuleLibraryPage';
import AuditTrailPage from './pages/AuditTrailPage';
import ExecutionTraceModal from './components/trace/ExecutionTraceModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeRole,
    setActiveRole,
    currentUser,
    loginUserAccount,
    logoutUserAccount,
    residents,
    staff,
    obligations,
    epistemicFacts,
    notifications,
    deleteNotification,
    clearRoleNotifications,
    auditTrail,
    handoverContracts,
    rules,
    spotChallenges,
    isOffline,
    setIsOffline,
    offlineQueue,
    syncOfflineLedger,
    captureCareReport,
    submitEvidenceAndClose,
    approveAuthorityAction,
    createObligation,
    signHandoverContract,
    selectedTrace,
    setSelectedTrace,
    isLoading,
    userAvatar,
    setUserAvatar
  } = useSambungJaga();

  // Global Loading State component for elegant data fetch (Only show when forcing refresh/logout cache)
  const GlobalLoader = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-sky-200 animate-spin" />
        <Heart className="w-6 h-6 text-sky-600 absolute animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-sky-800 font-black text-lg">SambungJaga</h2>
        <p className="text-slate-500 font-semibold text-xs animate-pulse">Menghapus cache sistem...</p>
      </div>
    </div>
  );

  // Auth Handlers
  const handleLoginSuccess = (roleId, accountObj) => {
    if (accountObj) {
      loginUserAccount(accountObj);
    } else {
      setActiveRole(roleId || 'supervisor');
    }
    setIsLoggedIn(true);
    if (roleId === 'caregiver') navigate('/app/caregiver_pwa');
    else if (roleId === 'family') navigate('/app/family_portal');
    else if (roleId === 'admin_hr') navigate('/app/simulator_lab');
    else navigate('/app/supervisor_dashboard');
  };

  const handleLogout = () => {
    logoutUserAccount();
    setTimeout(() => {
      setIsLoggedIn(false);
      navigate('/');
    }, 500); // Wait for the loading animation to play before completely detaching the route
  };

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    if (newRole === 'caregiver') navigate('/app/caregiver_pwa');
    else if (newRole === 'family') navigate('/app/family_portal');
    else if (newRole === 'admin_hr') navigate('/app/simulator_lab');
    else navigate('/app/supervisor_dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 text-slate-800 font-sans selection:bg-sky-500 selection:text-white w-full overflow-x-hidden">
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route
              path="/"
              element={
                <div className="min-h-screen flex flex-col justify-between w-full">
                  <PublicHeader
                    onGoToLanding={() => navigate('/')}
                    onGoToLogin={() => navigate('/login')}
                    onGoToRegister={() => navigate('/register')}
                  />
                  <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                    <LandingPage
                      onGoToLogin={() => navigate('/login')}
                      onGoToRegister={() => navigate('/register')}
                      onDirectDemoLogin={handleLoginSuccess}
                    />
                  </main>
                  <Footer onGoToLanding={() => navigate('/')} />
                </div>
              }
            />
            <Route
              path="/login"
              element={
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onGoToRegister={() => navigate('/register')}
                  onGoToLanding={() => navigate('/')}
                />
              }
            />
            <Route
              path="/register"
              element={
                <RegisterPage
                  onRegisterSuccess={handleLoginSuccess}
                  onGoToLogin={() => navigate('/login')}
                  onGoToLanding={() => navigate('/')}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : isLoading ? (
          // Elegant loading animation when logged in but data is fetching
          <Route path="*" element={<GlobalLoader />} />
        ) : (
          <Route
            path="/app/*"
            element={
              <div className="flex flex-col md:flex-row min-h-screen w-full overflow-x-hidden">
                <Sidebar
                  activeTab={location.pathname.replace('/app/', '') || 'supervisor_dashboard'}
                  setActiveTab={(tab) => navigate(`/app/${tab}`)}
                  activeRole={activeRole}
                  setActiveRole={handleRoleChange}
                  isOffline={isOffline}
                  setIsOffline={setIsOffline}
                  offlineQueue={offlineQueue}
                  syncOfflineLedger={syncOfflineLedger}
                  onLogout={handleLogout}
                />
                <div className="flex-1 flex flex-col justify-between min-w-0 w-full overflow-x-hidden">
                  <Header
                    activeRole={activeRole}
                    currentUser={currentUser}
                    notifications={notifications}
                    onDeleteNotification={deleteNotification}
                    onClearRoleNotifications={clearRoleNotifications}
                    userAvatar={userAvatar}
                    setUserAvatar={setUserAvatar}
                    onLogout={handleLogout}
                  />
                  <main className="p-4 sm:p-6 lg:p-8 space-y-6 w-full min-w-0">
                    <RoleWorkspaceHeader
                      activeRole={activeRole}
                      obligations={obligations}
                      epistemicFacts={epistemicFacts}
                      staff={staff}
                    />
                    <Routes>
                      <Route
                        path="caregiver_pwa"
                        element={
                          <CaregiverMobilePage
                            residents={residents}
                            obligations={obligations}
                            onCaptureSubmit={captureCareReport}
                            onSubmitEvidence={submitEvidenceAndClose}
                            onOpenTraceModal={setSelectedTrace}
                            isOffline={isOffline}
                            offlineQueue={offlineQueue}
                            currentUser={currentUser}
                          />
                        }
                      />
                      <Route
                        path="supervisor_dashboard"
                        element={
                          <SupervisorDashboardPage
                            obligations={obligations}
                            epistemicFacts={epistemicFacts}
                            residents={residents}
                            staff={staff}
                            currentUser={currentUser}
                            spotChallenges={spotChallenges}
                            onSubmitEvidence={submitEvidenceAndClose}
                            onApproveAction={approveAuthorityAction}
                            onCreateObligation={createObligation}
                            onOpenTraceModal={setSelectedTrace}
                            setActiveTab={(tab) => navigate(`/app/${tab}`)}
                          />
                        }
                      />
                      <Route
                        path="handover_contract"
                        element={
                          <HandoverPage
                            handoverContracts={handoverContracts}
                            onSignContract={signHandoverContract}
                            currentUserRole={activeRole}
                            currentUser={currentUser}
                            staff={staff}
                          />
                        }
                      />
                      <Route
                        path="execution_trace"
                        element={
                          <ExecutionTracePage
                            obligations={obligations}
                            onOpenTraceModal={setSelectedTrace}
                          />
                        }
                      />
                      <Route
                        path="family_portal"
                        element={
                          <FamilyPortalPage
                            residents={residents}
                            obligations={obligations}
                            epistemicFacts={epistemicFacts}
                          />
                        }
                      />
                      <Route
                        path="simulator_lab"
                        element={<SimulatorLabPage staff={staff} obligations={obligations} />}
                      />
                      <Route path="rule_library" element={<RuleLibraryPage rules={rules} />} />
                      <Route path="audit_trail" element={<AuditTrailPage auditTrail={auditTrail} />} />
                      <Route path="*" element={<Navigate to="supervisor_dashboard" replace />} />
                    </Routes>
                  </main>
                  <Footer onGoToLanding={handleLogout} />
                </div>
              </div>
            }
          />
        )}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? '/app/supervisor_dashboard' : '/'} replace />}
        />
      </Routes>

      {/* Trace Modal Global */}
      {selectedTrace && (
        <ExecutionTraceModal
          isOpen={!!selectedTrace}
          onClose={() => setSelectedTrace(null)}
          obligation={selectedTrace}
        />
      )}
    </div>
  );
}
