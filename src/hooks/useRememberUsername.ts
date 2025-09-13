import { useEffect } from 'react';
import type {
  Path,
  PathValue,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

interface RememberUsernameFields {
  username: string;
  rememberMe?: boolean;
}

export function useRememberUsername<T extends RememberUsernameFields>(
  watch: UseFormWatch<T>,
  setValue: UseFormSetValue<T>
) {
  const rememberMe = watch('rememberMe' as Path<T>);
  const username = watch('username' as Path<T>);

  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      setValue('username' as Path<T>, savedUsername as PathValue<T, Path<T>>);
      setValue('rememberMe' as Path<T>, true as PathValue<T, Path<T>>);
    }
  }, [setValue]);

  useEffect(() => {
    if (rememberMe && username) {
      localStorage.setItem('savedUsername', username as string);
    } else {
      localStorage.removeItem('savedUsername');
    }
  }, [rememberMe, username]);
}

export default useRememberUsername;
