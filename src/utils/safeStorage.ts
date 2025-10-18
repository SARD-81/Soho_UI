const isBrowserEnvironment = typeof window !== 'undefined';

const getStorage = () => {
  if (!isBrowserEnvironment) {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Access to localStorage is not available.', error);
    return undefined;
  }
};

const storage = getStorage();

export const safeStorage = {
  getItem(key: string) {
    return storage?.getItem(key) ?? null;
  },
  setItem(key: string, value: string) {
    try {
      storage?.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to localStorage.', error);
    }
  },
  removeItem(key: string) {
    try {
      storage?.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove key from localStorage.', error);
    }
  },
};

export const isBrowser = isBrowserEnvironment;
