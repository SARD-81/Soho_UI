import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { mutate, isPending } = useMutation<void, unknown, void>({
    mutationFn: logout,
    onSuccess: () => {
      toast.success('با موفقیت از حساب کاربری خارج شدید.');
      navigate('/login', { replace: true });
    },
    onError: (error: unknown) => {
      console.error('Unable to complete logout request', error);
      toast.error('خروج از حساب با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
      navigate('/login', { replace: true });
    },
  });

  const triggerLogout = useCallback(() => {
    if (!isPending) {
      mutate();
    }
  }, [isPending, mutate]);

  return {
    logout: triggerLogout,
    isLoggingOut: isPending,
  };
};

export default useLogout;