import { useEffect } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';

/**
 * Hook to persist the username when the "remember me" option is enabled.
 *
 * @param watch    React Hook Form's watch function
 * @param setValue React Hook Form's setValue function
 */
export function useRememberUsername<
  T extends { username: string; rememberMe?: boolean }
>(
  watch: UseFormWatch<T>,
  setValue: UseFormSetValue<T>
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
