import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSambaGroupMember } from '../lib/sambaGroupService';
import { sambaAvailableUsersQueryKey } from './useSambaAvailableUsersWithoutGroup';
import { sambaGroupMembersQueryKey } from './useSambaGroupMembers';
import { sambaGroupsQueryKey } from './useSambaGroups';

type SambaGroupMemberAction = 'add' | 'remove';

interface UpdateSambaGroupMemberPayload {
  groupname: string;
  username: string;
  action: SambaGroupMemberAction;
}

interface UseUpdateSambaGroupMemberOptions {
  onSuccess?: (groupname: string, username: string, action: SambaGroupMemberAction) => void;
  onError?: (
    message: string,
    groupname: string,
    username: string,
    action: SambaGroupMemberAction
  ) => void;
}

export const useUpdateSambaGroupMember = ({
  onSuccess,
  onError,
}: UseUpdateSambaGroupMemberOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateSambaGroupMemberPayload>({
    mutationFn: ({ groupname, username, action }) =>
      updateSambaGroupMember({ groupname, username, action }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaGroupsQueryKey });
      queryClient.invalidateQueries({
        queryKey: sambaGroupMembersQueryKey(variables.groupname),
      });
      queryClient.invalidateQueries({ queryKey: sambaAvailableUsersQueryKey });
      onSuccess?.(variables.groupname, variables.username, variables.action);
    },
    onError: (error, variables) => {
      onError?.(
        error.message,
        variables.groupname,
        variables.username,
        variables.action
      );
    },
  });
};

export type UseUpdateSambaGroupMemberReturn = ReturnType<
  typeof useUpdateSambaGroupMember
>;