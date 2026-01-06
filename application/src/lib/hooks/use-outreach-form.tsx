import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Keyboard, Platform } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

const outreachFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Please select a company'),
  reason: z.string().min(1, 'Please select a reason'),
  jobId: z.string().optional(),
  resumeLink: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

export type OutreachFormData = z.infer<typeof outreachFormSchema>;

export const useOutreachForm = () => {
  const { top } = useSafeAreaInsets();
  const form = useForm<OutreachFormData>({
    resolver: zodResolver(outreachFormSchema),
    defaultValues: {
      email: '',
      company: '',
      reason: '',
      jobId: '',
      resumeLink: '',
      message: '',
    },
  });

  const onSubmit = (data: OutreachFormData) => {
    showMessage({
      message: 'Form Submitted',
      floating: true,
      type: 'success',
      icon: 'success',
      position: 'top',
      style: {
        marginTop: Platform.OS === 'android' ? top : 0,
      },
    });
    Keyboard.dismiss();
    // Handle form submission here
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
