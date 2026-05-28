import { useToastStore } from './stores/toast-store';

export const showToast = (params: {
  message: string;
  type?: 'success' | 'error' | 'info';
}) => {
  useToastStore.getState().showToast(params);
};
