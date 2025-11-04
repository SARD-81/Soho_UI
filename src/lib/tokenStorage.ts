const REFRESH_TOKEN_KEY = 'auth:refresh-token';
const USERNAME_KEY = 'auth:username';

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return null;
  }

  try {
    const storage = window.sessionStorage;
    const testKey = '__auth_session_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch (error) {
    console.warn('Session storage is not available, falling back to in-memory tokens.', error);
    return null;
  }
};

const sessionStorageRef = getSessionStorage();

let accessToken: string | null = null;
let refreshToken: string | null | undefined;
let storedUsername: string | null | undefined;

const readFromSession = (key: string): string | null => {
  if (!sessionStorageRef) {
    return null;
  }
  const value = sessionStorageRef.getItem(key);
  return value ?? null;
};

const writeToSession = (key: string, value: string | null) => {
  if (!sessionStorageRef) {
    return;
  }

  if (value == null) {
    sessionStorageRef.removeItem(key);
  } else {
    sessionStorageRef.setItem(key, value);
  }
};

const ensureRefreshTokenLoaded = () => {
  if (refreshToken !== undefined) {
    return;
  }
  refreshToken = readFromSession(REFRESH_TOKEN_KEY);
};

const ensureUsernameLoaded = () => {
  if (storedUsername !== undefined) {
    return;
  }
  storedUsername = readFromSession(USERNAME_KEY);
};

const tokenStorage = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },
  getRefreshToken: () => {
    ensureRefreshTokenLoaded();
    return refreshToken ?? null;
  },
  setRefreshToken: (token: string | null) => {
    refreshToken = token;
    writeToSession(REFRESH_TOKEN_KEY, token);
  },
  getUsername: () => {
    ensureUsernameLoaded();
    return storedUsername ?? null;
  },
  setUsername: (username: string | null) => {
    storedUsername = username;
    writeToSession(USERNAME_KEY, username);
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
