import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import type { CreateSambaSharepointPayload } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';
import { sambaSharesQueryKey } from './useSambaShares';

type PathValidationStatus = 'idle' | 'valid' | 'invalid';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

const extractApiMessage = (error: AxiosError<ApiErrorResponse>) => {
  const payload = error.response?.data;

  if (!payload) {
    return error.message;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.detail && typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (payload.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join(' | ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

const deriveShareDisplayName = (fullPath: string) => {
  const segments = fullPath.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? fullPath;
};

interface UseCreateShareOptions {
  onSuccess?: (shareName: string) => void;
  onError?: (errorMessage: string) => void;
}

export const useCreateShare = ({
  onSuccess,
  onError,
}: UseCreateShareOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [shareName, setShareName] = useState('');
  const [fullPath, setFullPath] = useState('');
  const [validUsers, setValidUsers] = useState<string[]>([]);
  const [validGroups, setValidGroups] = useState<string[]>([]);
  const [shareNameError, setShareNameError] = useState<string | null>(null);
  const [fullPathError, setFullPathError] = useState<string | null>(null);
  const [validUsersError, setValidUsersError] = useState<string | null>(null);
  const [validGroupsError, setValidGroupsError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setShareName('');
    setFullPath('');
    setValidUsers([]);
    setValidGroups([]);
    setShareNameError(null);
    setFullPathError(null);
    setValidUsersError(null);
    setValidGroupsError(null);
    setApiError(null);
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setIsOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const createShareMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateSambaSharepointPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/samba/sharepoints/', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaSharesQueryKey });
      handleClose();
      onSuccess?.(variables.sharepoint_name);
    },
    onError: (error) => {
      const message = extractApiMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const closeCreateModal = useCallback(() => {
    createShareMutation.reset();
    handleClose();
  }, [createShareMutation, handleClose]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setShareNameError(null);
      setFullPathError(null);
      setValidUsersError(null);
      setValidGroupsError(null);
      setApiError(null);

      const trimmedShareName = shareName.trim();
      const trimmedPath = fullPath.trim();
      let hasError = false;

      if (!trimmedShareName) {
        setShareNameError('Please enter a share name.');
        hasError = true;
      }

      if (!trimmedPath) {
        setFullPathError('Please enter the full path to share.');
        hasError = true;
      }

      if (!validUsers.length) {
        setValidUsersError('Select at least one allowed user.');
        hasError = true;
      }

      if (!validGroups.length) {
        setValidGroupsError('Select at least one allowed group.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const sharepointName =
        trimmedShareName || deriveShareDisplayName(trimmedPath);

      createShareMutation.mutate({
        sharepoint_name: sharepointName,
        path: trimmedPath,
        valid_users: validUsers,
        valid_groups: validGroups,
        available: true,
        read_only: false,
        guest_ok: true,
        browseable: true,
        max_connections: 10,
        create_mask: '0644',
        directory_mask: '0755',
        inherit_permissions: false,
        save_to_db: true,
      });
    },
    [createShareMutation, fullPath, shareName, validGroups, validUsers]
  );

  return {
    isOpen,
    shareName,
    fullPath,
    validUsers,
    fullPathError,
    shareNameError,
    validUsersError,
    validGroupsError,
    apiError,
    isCreating: createShareMutation.isPending,
    pathValidationStatus: 'idle' as PathValidationStatus,
    pathValidationMessage: null as string | null,
    isPathChecking: false,
    isPathValid: false,
    openCreateModal: handleOpen,
    closeCreateModal,
    setShareName,
    setFullPath,
    setValidUsers,
    validGroups,
    setValidGroups,
    handleSubmit,
  };
};

export type UseCreateShareReturn = ReturnType<typeof useCreateShare>;
