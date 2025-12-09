import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSambaGroup } from '../lib/sambaGroupService';
import { sambaGroupsQueryKey } from './useSambaGroups';

interface UseCreateSambaGroupOptions {
  onSuccess?: (groupname: string) => void;
  onError?: (message: string) => void;
}

export const useCreateSambaGroup = ({
  onSuccess,
  onError,
}: UseCreateSambaGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: async (groupname) => createSambaGroup(groupname),
    onSuccess: (_data, groupname) => {
      queryClient.invalidateQueries({ queryKey: sambaGroupsQueryKey });
      onSuccess?.(groupname);
    },
    onError: (error) => {
      onError?.(error.message);
    },
  });
};

export type UseCreateSambaGroupReturn = ReturnType<typeof useCreateSambaGroup>;
