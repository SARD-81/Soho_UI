import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { VolumeEntry, VolumeQueryResult } from '../@types/volume';
import axiosInstance from '../lib/axiosInstance';

interface DeleteVolumePayload {
  volume_name: string;
}

interface DeleteVolumeResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const deleteVolumeRequest = async ({
  volume_name,
}: DeleteVolumePayload): Promise<DeleteVolumeResponse> => {
  const response = await axiosInstance.delete<DeleteVolumeResponse>(
    '/api/volume/delete',
    {
      data: { volume_name },
    }
  );

  return response.data;
};

interface UseDeleteVolumeOptions {
  onSuccess?: (volumeName: string) => void;
  onError?: (error: Error, volumeName: string) => void;
}

export const useDeleteVolume = ({
  onSuccess,
  onError,
}: UseDeleteVolumeOptions = {}) => {
  const queryClient = useQueryClient();
  const [targetVolume, setTargetVolume] = useState<VolumeEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useMutation<
    DeleteVolumeResponse,
    Error,
    DeleteVolumePayload
  >({
    mutationFn: deleteVolumeRequest,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<VolumeQueryResult | undefined>(
        ['volumes'],
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            volumes: current.volumes.filter(
              (volume) => volume.fullName !== variables.volume_name
            ),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['volumes'] });
    },
  });

  const requestDelete = useCallback((volume: VolumeEntry) => {
    setErrorMessage(null);
    setTargetVolume(volume);
  }, []);

  const closeModal = useCallback(() => {
    setTargetVolume(null);
    setErrorMessage(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!targetVolume || deleteMutation.isPending) {
      return;
    }

    setErrorMessage(null);

    deleteMutation.mutate(
      { volume_name: targetVolume.fullName },
      {
        onSuccess: () => {
          onSuccess?.(targetVolume.fullName);
          closeModal();
        },
        onError: (error) => {
          setErrorMessage(error.message);
          onError?.(error, targetVolume.fullName);
        },
      }
    );
  }, [closeModal, deleteMutation, onError, onSuccess, targetVolume]);

  return {
    isOpen: Boolean(targetVolume),
    targetVolume,
    requestDelete,
    closeModal,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    errorMessage,
  };
};

export type UseDeleteVolumeReturn = ReturnType<typeof useDeleteVolume>;
