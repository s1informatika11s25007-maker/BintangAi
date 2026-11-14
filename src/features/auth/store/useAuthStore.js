import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabaseClient';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      isLoggingOut: false,
      subscription: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      // Mendengarkan perubahan profil secara Realtime
      subscribeToProfile: (userId) => {
        if (!userId) return;

        const existingSub = get().subscription;
        if (existingSub) {
          supabase.removeChannel(existingSub);
        }

        const channel = supabase
          .channel(`public:profiles:id=eq.${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${userId}`,
            },
            (payload) => {
              console.log('Realtime profile update:', payload.new);
              set({ profile: payload.new });
              useAccessibilityStore.getState().setModeFromProfile(payload.new);

              // Instant logout (< 1s) ONLY if teacher explicitly forces logout student (last_active_at set to epoch 1970)
              const isTeacherForcedLogout = payload.new.is_online === false &&
                payload.new.last_active_at &&
                new Date(payload.new.last_active_at).getTime() === 0;

              if (isTeacherForcedLogout && get().user?.id === userId && payload.new.role === 'siswa') {
                get().logout('/auth/login?reason=teacher_logout');
              }
            }
          )
          .subscribe();

        set({ subscription: channel });
      },

      unsubscribeFromProfile: () => {
        const { subscription } = get();
        if (subscription) {
          supabase.removeChannel(subscription);
          set({ subscription: null });
        }
      },

      // Verification & auto-refresh of session (JWT 15m / Refresh Token 7d) on initialization
      initializeAuth: async () => {
        set({ loading: true });
        try {
          // Attempt automatic session token refresh on page load / refresh
          let activeSession = null;
          try {
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData?.session?.user) {
              activeSession = refreshData.session;
            }
          } catch (e) {}

          if (!activeSession) {
            const { data: { session } } = await supabase.auth.getSession();
            activeSession = session;
          }

          if (activeSession?.user) {
            set({ user: activeSession.user });
            await get().fetchProfile(activeSession.user.id, false);
          } else {
            // No active session in Supabase Auth -> Clear user state
            set({ user: null, profile: null, loading: false });
          }
        } catch (error) {
          console.error("Auth init error:", error);
          set({ user: null, profile: null, loading: false });
        }
      },

      fetchProfile: async (userId, setOnline = false) => {
        if (!userId) {
          set({ loading: false });
          return null;
        }

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError) throw profileError;

          if (profileData) {
            // ONLY set is_online = true if explicitly requested (e.g. on fresh login)
            if (setOnline) {
              try {
                const todayDate = new Date().toISOString().split('T')[0];
                await supabase.from('profiles').update({
                  is_online: true,
                  last_active_at: new Date().toISOString(),
                  last_active: todayDate
                }).eq('id', userId);
                profileData.is_online = true;
              } catch (e) {}
            }

            get().subscribeToProfile(userId);
            useAccessibilityStore.getState().setModeFromProfile(profileData);
            set({ profile: profileData, loading: false });
            return profileData;
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          set({ loading: false });
        }
        return null;
      },

      updateXP: async (xpGained) => {
        const { profile } = get();
        if (profile) {
          const { error } = await supabase.rpc('increment_xp', {
            user_id: profile.id,
            amount: xpGained
          });

          if (error) {
            const newXP = Number(profile.xp || 0) + Number(xpGained);
            await supabase.from('profiles').update({ xp: newXP }).eq('id', profile.id);
          }
        }
      },

      /**
       * 🛡️ COMPLETE LOGOUT, CACHE CLEAR & REDIRECT TO LOGIN PAGE ('/auth/login')
       */
      logout: async (targetUrl = '/auth/login') => {
        set({ isLoggingOut: true, loading: true });

        const currentProfile = get().profile;
        const currentUser = get().user;
        const targetUserId = currentProfile?.id || currentUser?.id;

        try {
          get().unsubscribeFromProfile();
        } catch (e) {}

        if (targetUserId) {
          try {
            await supabase.from('profiles').update({
              is_online: false,
              last_active_at: new Date().toISOString()
            }).eq('id', targetUserId);
          } catch (e) {
            console.error('Error updating offline status on logout:', e);
          }
        }

        // 1. Immediately cancel any speech synthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        // 2. Reset DOM root attributes & mode classes
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.setAttribute('data-disability', 'none');
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.style.fontSize = '100%';
        }

        // 3. Reset Accessibility Store
        try {
          useAccessibilityStore.getState().reset();
        } catch (e) {}

        // 4. Sign out from Supabase Auth
        try {
          await supabase.auth.signOut();
        } catch (e) {}

        // 5. Clear state
        set({ user: null, profile: null, loading: false });

        // 6. Delete ALL cache keys from localStorage and sessionStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('bintangai-auth-storage');
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
        }

        // 7. Hard redirect to login page ('/auth/login') cleanly
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = targetUrl || '/auth/login';
          }
        }, 300);
      }
    }),
    {
      name: 'bintangai-auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);
