import { create } from 'zustand';

export const useNotification = create((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 4000);
  },
  hideToast: () => set({ toast: null }),
}));
