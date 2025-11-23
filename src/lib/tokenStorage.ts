const ACCESS_TOKEN_KEY = 'auth:access-token';
const REFRESH_TOKEN_KEY = 'auth:refresh-token';
const USERNAME_KEY = 'auth:username';

const getWebStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const candidates: (Storage | undefined)[] = [
    window.localStorage,
    window.sessionStorage,
  ];

  for (const storage of candidates) {
    if (!storage) {
      continue;
    }

    try {
      const testKey = '__auth_storage_test__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return storage;
    } catch (error) {
      console.warn('Web storage is not available, falling back to in-memory tokens.', error);
    }
  }

  return null;
};

const storageRef = getWebStorage();

let accessToken: string | null | undefined;
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

const ensureAccessTokenLoaded = () => {
  if (accessToken !== undefined) {
    return;
  }
  accessToken = readFromStorage(ACCESS_TOKEN_KEY);
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
    ensureAccessTokenLoaded();
    return accessToken ?? null;
  },
  setAccessToken: (token: string | null) => {
    accessToken = token;
    writeToStorage(ACCESS_TOKEN_KEY, token);
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