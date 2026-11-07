import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabaseClient'
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      subscription: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      // Mendengarkan perubahan profil secara Realtime
      subscribeToProfile: (userId) => {
        if (!userId) return;

        // Hapus subscription lama jika ada
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
              // Update accessibility mode if profile changed
              useAccessibilityStore.getState().setModeFromProfile(payload.new);
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

      fetchProfile: async (userId) => {
        if (!userId) return null;
        set({ loading: true });

        try {
          let { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          // Jika profil belum ada di database, buat profil otomatis dari user metadata
          if (!profileData) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.id === userId) {
              const meta = user.user_metadata || {};
              const defaultProfile = {
                id: userId,
                email: user.email,
                full_name: meta.full_name || user.email?.split('@')[0] || 'User',
                role: meta.role || 'siswa',
                disability_type: meta.disability_type || 'tidak_ada',
                slb_name: meta.slb_name || null,
                class_level: meta.class_level || null,
                class_code: meta.class_code || null,
                xp: 0
              };

              const { data: createdProfile } = await supabase
                .from('profiles')
                .upsert(defaultProfile)
                .select()
                .maybeSingle();

              profileData = createdProfile || defaultProfile;
            }
          }

          if (profileData) {
            // Jalankan subscription realtime setelah profile ditemukan
            get().subscribeToProfile(userId);

            // Sync accessibility store
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
        const { profile } = get()
        if (profile) {
          const { data, error } = await supabase.rpc('increment_xp', {
            user_id: profile.id,
            amount: xpGained
          });

          if (error) {
            // Fallback manual jika RPC belum ada
            const newXP = Number(profile.xp || 0) + Number(xpGained);
            await supabase.from('profiles').update({ xp: newXP }).eq('id', profile.id);
          }
        }
      },

      logout: async () => {
        get().unsubscribeFromProfile();

        // RESET ACCESSIBILITY BEFORE LOGOUT
        useAccessibilityStore.getState().reset();

        await supabase.auth.signOut()
        // Clear storage manually if needed to prevent invalid refresh token on next boot
        localStorage.removeItem('bintangai-auth-storage');
        set({ user: null, profile: null })
      }
    }),
    {
      name: 'bintangai-auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)
