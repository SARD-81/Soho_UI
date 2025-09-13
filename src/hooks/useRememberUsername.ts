import { useEffect } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';

export function useRememberUsername(
  watch: UseFormWatch<any>,
  setValue: UseFormSetValue<any>
) {
  const rememberMe = watch('rememberMe');
  const username = watch('username');

  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      setValue('username', savedUsername);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  useEffect(() => {
    if (rememberMe && username) {
      localStorage.setItem('savedUsername', username);
    } else {
      localStorage.removeItem('savedUsername');
    }
  }, [rememberMe, username]);
}

export default useRememberUsername;
