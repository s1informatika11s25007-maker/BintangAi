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

              // Instant logout (< 1s) if teacher manually logs out student
              if (payload.new.is_online === false && get().user?.id === userId && payload.new.role === 'siswa') {
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

      // Verification of session and role accuracy on initialization
      initializeAuth: async () => {
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({ user: session.user });
            await get().fetchProfile(session.user.id);
          } else {
            const persistedUser = get().user;
            if (persistedUser?.id) {
              await get().fetchProfile(persistedUser.id);
            } else {
              set({ user: null, profile: null, loading: false });
            }
          }
        } catch (error) {
          console.error("Auth init error:", error);
          set({ loading: false });
        }
      },

      fetchProfile: async (userId) => {
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
            // Guarantee online status is set to true on profile fetch & session restore
            try {
              const todayDate = new Date().toISOString().split('T')[0];
              await supabase.from('profiles').update({
                is_online: true,
                last_active_at: new Date().toISOString(),
                last_active: todayDate
              }).eq('id', userId);
              profileData.is_online = true;
            } catch (e) {}

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
       * Shows pure circular loading spinner without text, cancels speech, clears all DOM mode classes, deletes all localStorage & sessionStorage caches, and hard refreshes to login page.
       */
      logout: async (targetUrl = '/auth/login') => {
        set({ isLoggingOut: true, loading: true });

        const currentProfile = get().profile;
        if (currentProfile?.id) {
          try {
            await supabase.from('profiles').update({
              is_online: false,
              last_active_at: new Date().toISOString()
            }).eq('id', currentProfile.id);
          } catch (e) {}
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

        // 5. Delete ALL cache keys from localStorage and sessionStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
        }

        try {
          get().unsubscribeFromProfile();
        } catch (e) {}

        set({ user: null, profile: null, loading: false });

        // 6. Hard redirect to login page ('/auth/login') cleanly
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = targetUrl || '/auth/login';
          }
        }, 400);
      }
    }),
    {
      name: 'bintangai-auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);
