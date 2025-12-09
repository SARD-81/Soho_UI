import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSambaGroup } from '../lib/sambaGroupService';
import { sambaGroupsQueryKey } from './/useSambaGroups';

interface UseDeleteSambaGroupOptions {
  onSuccess?: (groupname: string) => void;
  onError?: (message: string, groupname: string) => void;
}

export const useDeleteSambaGroup = ({
  onSuccess,
  onError,
}: UseDeleteSambaGroupOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: async (groupname) => deleteSambaGroup(groupname),
    onSuccess: (_data, groupname) => {
      queryClient.invalidateQueries({ queryKey: sambaGroupsQueryKey });
      onSuccess?.(groupname);
    },
    onError: (error, groupname) => {
      onError?.(error.message, groupname);
    },
  });
};

export type UseDeleteSambaGroupReturn = ReturnType<typeof useDeleteSambaGroup>;