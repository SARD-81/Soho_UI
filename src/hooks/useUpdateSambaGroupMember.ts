import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSambaGroupMember } from '../lib/sambaGroupService';
import { sambaAvailableUsersByGroupQueryKey } from './useSambaAvailableUsersByGroup';
import { sambaGroupMembersQueryKey } from './useSambaGroupMembers';
import { sambaGroupsQueryKey } from './useSambaGroups';

type SambaGroupMemberAction = 'add' | 'remove';

interface UpdateSambaGroupMemberPayload {
  groupname: string;
  usernames: string[];
  action: SambaGroupMemberAction;
}

interface UseUpdateSambaGroupMemberOptions {
  onSuccess?: (groupname: string, usernames: string[], action: SambaGroupMemberAction) => void;
  onError?: (
    message: string,
    groupname: string,
    usernames: string[],
    action: SambaGroupMemberAction
  ) => void;
}

export const useUpdateSambaGroupMember = ({
  onSuccess,
  onError,
}: UseUpdateSambaGroupMemberOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateSambaGroupMemberPayload>({
    mutationFn: ({ groupname, usernames, action }) =>
      updateSambaGroupMember({ groupname, usernames, action }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sambaGroupsQueryKey });
      queryClient.invalidateQueries({
        queryKey: sambaGroupMembersQueryKey(variables.groupname),
      });
      queryClient.invalidateQueries({
        queryKey: sambaAvailableUsersByGroupQueryKey(variables.groupname),
      });
      onSuccess?.(variables.groupname, variables.usernames, variables.action);
    },
    onError: (error, variables) => {
      onError?.(
        error.message,
        variables.groupname,
        variables.usernames,
        variables.action
      );
    },
  });
};

export type UseUpdateSambaGroupMemberReturn = ReturnType<
  typeof useUpdateSambaGroupMember
>;