export type RawOsUserDetails = string | Record<string, unknown>;

export interface OsUsersResponse {
  data?: RawOsUserDetails[] | Record<string, RawOsUserDetails>;
  [key: string]: unknown;
}

export interface CreateOsUserPayload {
  username: string;
  login_shell?: string;
  shell?: string;
}

export interface OsUserTableItem {
  id: string;
  username: string;
  fullName?: string;
  uid?: string;
  gid?: string;
  homeDirectory?: string;
  loginShell?: string;
  hasSambaUser?: boolean;
  raw: RawOsUserDetails;
}
