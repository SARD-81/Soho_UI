export interface SambaShareDetails {
  path?: string;
  full_path?: string;
  valid_users?: string;
  ['valid users']?: string;
  [key: string]: unknown;
}

export interface SambaShareEntry {
  name: string;
  details: SambaShareDetails;
}

export interface SambaSharesResponse {
  data?: Record<string, SambaShareDetails>;
  [key: string]: unknown;
}

export interface CreateSambaSharePayload {
  full_path: string;
  valid_users: string;
}

export interface CreateDirectoryPermissionsPayload {
  path: string;
  owner: string;
  group: string;
  mode?: string;
}

export interface CreateShareWithPermissionsPayload
  extends CreateSambaSharePayload {
  mode?: string;
}

export interface SetDirectoryPermissionsPayload {
  path: string;
  owner: string;
  group: string;
  mode: string;
  recursive: string;
}

export type RawSambaUserDetails = Record<string, unknown>;

export type SambaUsersResponseData =
  | RawSambaUserDetails[]
  | Record<string, RawSambaUserDetails>;

export interface SambaUsersResponse {
  data?: SambaUsersResponseData;
  [key: string]: unknown;
}

export type SambaUserAccountStatus = 'enabled' | 'disabled' | 'unknown';

export interface SambaUserTableItem {
  id: string;
  username: string;
  domain?: string;
  profilePath?: string;
  passwordMustChange?: string;
  logonTime?: string;
  logoffTime?: string;
  kickoffTime?: string;
  passwordLastSet?: string;
  passwordCanChange?: string;
  details: Record<string, string>;
}

export interface CreateSambaUserPayload {
  username: string;
  password: string;
  save_to_db?: boolean;
}

export type SambaUserUpdateAction = 'enable' | 'disable' | 'change_password';

export interface UpdateSambaUserPayload {
  username: string;
  action: SambaUserUpdateAction;
  new_password?: string;
  save_to_db?: boolean;
}

export type UpdateSambaUserPasswordPayload = Pick<
  UpdateSambaUserPayload,
  'username' | 'new_password'
>;

export interface SambaGroupEntry {
  name: string;
  gid: string;
  members: string[];
}

export interface SambaGroupsResponse {
  data?: SambaGroupEntry[];
  [key: string]: unknown;
}

export interface SambaGroupMembersResponse {
  data?: SambaGroupEntry;
  [key: string]: unknown;
}

export interface SambaGroupMembersListEntry {
  name?: string;
  groupname?: string;
  members: string[];
}

export interface SambaGroupMembersListResponse {
  data?: SambaGroupMembersListEntry[];
  [key: string]: unknown;
}

export interface SambaUsernamesResponse {
  data?: string[] | Record<string, string>;
  [key: string]: unknown;
}
