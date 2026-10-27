import React, { useState } from 'react';
import { useSambungJaga } from './hooks/useSambungJaga';
import PublicHeader from './components/layout/PublicHeader';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authState, setAuthState] = useState('landing'); // 'landing' | 'login' | 'register'
  const [activeTab, setActiveTab] = useState('supervisor_dashboard');

  const {
    activeRole,
    setActiveRole,
    residents,
    staff,
    obligations,
    epistemicFacts,
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
    setSelectedTrace
  } = useSambungJaga();

  // Auth Handlers
  const handleLoginSuccess = (roleId) => {
    setActiveRole(roleId || 'supervisor');
    setIsLoggedIn(true);
    if (roleId === 'caregiver') setActiveTab('caregiver_pwa');
    else if (roleId === 'family') setActiveTab('family_portal');
    else if (roleId === 'admin_hr') setActiveTab('simulator_lab');
    else setActiveTab('supervisor_dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthState('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 text-slate-800 font-sans selection:bg-sky-500 selection:text-white w-full">
      {/* 1. PRE-LOGIN STATE */}
      {!isLoggedIn ? (
        <>
          {authState === 'landing' && (
            <div className="min-h-screen flex flex-col justify-between w-full">
              <PublicHeader
                onGoToLanding={() => setAuthState('landing')}
                onGoToLogin={() => setAuthState('login')}
                onGoToRegister={() => setAuthState('register')}
              />
              <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                <LandingPage
                  onGoToLogin={() => setAuthState('login')}
                  onGoToRegister={() => setAuthState('register')}
                  onDirectDemoLogin={(roleId) => handleLoginSuccess(roleId)}
                />
              </main>
              <Footer />
            </div>
          )}

          {authState === 'login' && (
            <LoginPage
              onLoginSuccess={(roleId) => handleLoginSuccess(roleId)}
              onGoToRegister={() => setAuthState('register')}
              onGoToLanding={() => setAuthState('landing')}
            />
          )}

          {authState === 'register' && (
            <RegisterPage
              onRegisterSuccess={(roleId) => handleLoginSuccess(roleId)}
              onGoToLogin={() => setAuthState('login')}
              onGoToLanding={() => setAuthState('landing')}
            />
          )}
        </>
      ) : (
        /* 2. POST-LOGIN STATE (Full Width Sidebar Workspace) */
        <div className="flex flex-col md:flex-row min-h-screen w-full">
          {/* Left Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            offlineQueue={offlineQueue}
            syncOfflineLedger={syncOfflineLedger}
            onLogout={handleLogout}
          />

          {/* Right Main Content Workspace (Full-Width Edge-to-Edge) */}
          <div className="flex-1 flex flex-col justify-between min-w-0 w-full">
            <main className="p-4 sm:p-6 lg:p-8 space-y-6 w-full min-w-0">
              {/* Role-Specific Custom Workspace Header Banner */}
              <RoleWorkspaceHeader
                activeRole={activeRole}
                obligations={obligations}
                epistemicFacts={epistemicFacts}
                staff={staff}
              />

              {/* Active Tab Module */}
              {activeTab === 'caregiver_pwa' && (
                <CaregiverMobilePage
                  residents={residents}
                  obligations={obligations}
                  onCaptureSubmit={captureCareReport}
                  onSubmitEvidence={submitEvidenceAndClose}
                  onOpenTraceModal={(ob) => setSelectedTrace(ob)}
                  isOffline={isOffline}
                  offlineQueue={offlineQueue}
                />
              )}

              {activeTab === 'supervisor_dashboard' && (
                <SupervisorDashboardPage
                  obligations={obligations}
                  epistemicFacts={epistemicFacts}
                  residents={residents}
                  spotChallenges={spotChallenges}
                  onSubmitEvidence={submitEvidenceAndClose}
                  onApproveAction={approveAuthorityAction}
                  onCreateObligation={createObligation}
                  onOpenTraceModal={(ob) => setSelectedTrace(ob)}
                />
              )}

              {activeTab === 'handover_contract' && (
                <HandoverPage
                  handoverContracts={handoverContracts}
                  onSignContract={signHandoverContract}
                  currentUserRole={activeRole}
                />
              )}

              {activeTab === 'execution_trace' && (
                <ExecutionTracePage
                  obligations={obligations}
                  onOpenTraceModal={(ob) => setSelectedTrace(ob)}
                />
              )}

              {activeTab === 'family_portal' && (
                <FamilyPortalPage
                  residents={residents}
                  obligations={obligations}
                  epistemicFacts={epistemicFacts}
                />
              )}

              {activeTab === 'simulator_lab' && (
                <SimulatorLabPage
                  staff={staff}
                  obligations={obligations}
                />
              )}

              {activeTab === 'rule_library' && (
                <RuleLibraryPage rules={rules} />
              )}

              {activeTab === 'audit_trail' && (
                <AuditTrailPage auditTrail={auditTrail} />
              )}
            </main>

            <Footer />
          </div>
        </div>
      )}

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
