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
