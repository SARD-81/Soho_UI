const REFRESH_TOKEN_KEY = 'auth:refresh-token';
const USERNAME_KEY = 'auth:username';

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const testKey = '__auth_storage_test__';
    window.sessionStorage.setItem(testKey, '1');
    window.sessionStorage.removeItem(testKey);
    return window.sessionStorage;
  } catch (error) {
    console.warn(
      'Session storage is not available, falling back to in-memory tokens.',
      error
    );
    return null;
  }
};

const storageRef = getSessionStorage();

// Clean up any legacy tokens that might have been persisted previously so access
// tokens stay memory-only and refresh tokens stay scoped to sessionStorage.
if (typeof window !== 'undefined') {
  try {
    window.sessionStorage.removeItem('auth:access-token');
    window.localStorage.removeItem('auth:access-token');
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USERNAME_KEY);
  } catch (error) {
    console.warn('Unable to remove legacy auth values from storage', error);
  }
}

let accessToken: string | null = null;
let refreshToken: string | null | undefined;
let storedUsername: string | null | undefined;

const readFromStorage = (key: string): string | null => {
  if (!storageRef) {
    return null;
  }
  const value = storageRef.getItem(key);
  return value ?? null;
};

const writeToStorage = (key: string, value: string | null) => {
  if (!storageRef) {
    return;
  }

  if (value == null) {
    storageRef.removeItem(key);
  } else {
    storageRef.setItem(key, value);
  }
};

const ensureRefreshTokenLoaded = () => {
  if (refreshToken !== undefined) {
    return;
  }
  refreshToken = readFromStorage(REFRESH_TOKEN_KEY);
};

const ensureUsernameLoaded = () => {
  if (storedUsername !== undefined) {
    return;
  }
  storedUsername = readFromStorage(USERNAME_KEY);
};

const tokenStorage = {
  getAccessToken: () => {
    return accessToken;
  },
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },
  getRefreshToken: () => {
    ensureRefreshTokenLoaded();
    return refreshToken ?? null;
  },
  setRefreshToken: (token: string | null) => {
    refreshToken = token;
    writeToStorage(REFRESH_TOKEN_KEY, token);
  },
  getUsername: () => {
    ensureUsernameLoaded();
    return storedUsername ?? null;
  },
  setUsername: (username: string | null) => {
    storedUsername = username;
    writeToStorage(USERNAME_KEY, username);
  },
  setSession: ({
    accessToken: newAccess,
    refreshToken: newRefresh,
    username,
  }: {
    accessToken: string | null;
    refreshToken: string | null;
    username: string | null;
  }) => {
    tokenStorage.setAccessToken(newAccess);
    tokenStorage.setRefreshToken(newRefresh);
    tokenStorage.setUsername(username);
  },
  clear: () => {
    tokenStorage.setAccessToken(null);
    tokenStorage.setRefreshToken(null);
    tokenStorage.setUsername(null);
  },
};

export default tokenStorage;
