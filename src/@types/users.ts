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

export interface WebUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  date_joined: string;
}

export interface CreateWebUserPayload {
  username: string;
  email: string;
  password: string;
  is_superuser: boolean;
  is_staff: boolean;
  first_name?: string;
  last_name?: string;
}

export interface UpdateWebUserPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface UpdateWebUserPasswordPayload {
  username: string;
  new_password: string;
}

export interface ApiResponseEnvelope<T> {
  ok: boolean;
  error: string | null;
  message: string | null;
  data: T;
  details?: Record<string, unknown>;
  meta?: {
    timestamp: string;
    response_status_code: number;
    response_status_text: string;
  };
  request_data?: unknown;
}

export type WebUsersResponse = ApiResponseEnvelope<WebUser[]>;