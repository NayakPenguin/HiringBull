import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerDevice } from './api';
import { userKeys } from './keys'; // Uncomment when using invalidateQueries

export const useRegisterDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerDevice,
    meta: {
      // successMessage: 'Device registered successfully', // Uncomment if you want a toast
      // toastError: true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.devices() });
    },
  });
};
