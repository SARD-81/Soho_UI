export interface SambaShareDetails {
  name?: string;
  path?: string;
  full_path?: string;
  ['valid users']?: string;
  ['valid groups']?: string;
  ['create mask']?: string;
  ['directory mask']?: string;
  ['max connections']?: string | number;
  ['read only']?: boolean | string;
  available?: boolean | string;
  ['guest ok']?: boolean | string;
  browseable?: boolean | string;
  ['inherit permissions']?: boolean | string;
  is_custom?: boolean | string;
  created_time?: string | null;
  [key: string]: unknown;
}

export interface SambaShareEntry {
  name: string;
  details: SambaShareDetails;
}

export interface SambaSharepointsResponse {
  data?: SambaShareDetails[];
  [key: string]: unknown;
}

export interface CreateSambaSharepointPayload {
  sharepoint_name: string;
  path: string;
  valid_users: string[];
  valid_groups: string[];
  available: boolean;
  read_only: boolean;
  guest_ok: boolean;
  browseable: boolean;
  max_connections: number;
  create_mask: string;
  directory_mask: string;
  inherit_permissions: boolean;
  save_to_db: boolean;
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