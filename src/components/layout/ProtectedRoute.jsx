import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * ProtectedRoute - Ensures user is logged in and has the allowed role.
 * Redirects unauthenticated users to /auth/login.
 * Redirects users with mismatched roles to their correct dashboard.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest animate-pulse">
          Memuat Akses Pengguna...
        </p>
      </div>
    );
  }

  // Not logged in -> Redirect to login page
  if (!user || !profile) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role matching if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = profile.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to correct dashboard based on actual role
      const redirectPath =
        userRole === 'guru' ? '/teacher/dashboard' :
        userRole === 'ortu' ? '/parent/dashboard' :
        '/student/dashboard';

      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

/**
 * PublicOnlyRoute - Prevents logged in users from visiting login/register pages.
 * Redirects logged in users straight to their dashboard.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user && profile) {
    const redirectPath =
      profile.role === 'guru' ? '/teacher/dashboard' :
      profile.role === 'ortu' ? '/parent/dashboard' :
      '/student/dashboard';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
