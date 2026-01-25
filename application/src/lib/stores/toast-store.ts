import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
  showToast: (params: { message: string; type?: ToastType }) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',

  showToast: ({ message, type = 'info' }) => {
    set({
      visible: true,
      message,
      type,
    });

    // auto hide after 3s
    setTimeout(() => {
      set({ visible: false });
    }, 3000);
  },

  hideToast: () => set({ visible: false }),
}));
