export type UserPrimitiveValue = string | number | boolean | null | undefined;

export type UserValue = UserPrimitiveValue | UserPrimitiveValue[];

export interface UserRecord {
  username?: string | null;
  [key: string]: UserValue;
}

export interface UsersResponse {
  data?: UserRecord[];
}

export interface CreateUserPayload {
  username: string;
  login_shell: string;
}
