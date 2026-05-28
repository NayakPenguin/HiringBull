import { create } from 'zustand';

interface GlobalLoadingState {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useGlobalLoading = create<GlobalLoadingState>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => set({ isLoading: false }),
}));

// Helper functions for easy access from anywhere
export const showGlobalLoading = () => 
  useGlobalLoading.getState().showLoading();

export const hideGlobalLoading = () => 
  useGlobalLoading.getState().hideLoading();
