import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const { user, profile, loading, logout } = useAuthStore();
  return {
    user,
    profile,
    isAuthenticated: !!user,
    isLoaded: !loading,
    logout
  };
};
