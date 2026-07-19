import { useEffect, useRef } from 'react';

export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const LAST_ACTIVITY_STORAGE_KEY = 'auth:last-activity-at';
const ACTIVITY_WRITE_THROTTLE_MS = 5 * 1000;

const getCurrentTimestamp = () => Date.now();

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[auth] sessionStorage is unavailable', error);
    }
    return null;
  }
};

export const readSessionLastActivityAt = (): number | null => {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  try {
    const storedValue = storage.getItem(LAST_ACTIVITY_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const parsedValue = Number(storedValue);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[auth] unable to read last activity timestamp', error);
    }
    return null;
  }
};

const writeSessionLastActivityAt = (timestamp: number) => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(timestamp));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[auth] unable to write last activity timestamp', error);
    }
  }
};

export const startSessionActivityWindow = () => {
  writeSessionLastActivityAt(getCurrentTimestamp());
};

export const clearSessionActivityTimestamp = () => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[auth] unable to clear last activity timestamp', error);
    }
  }
};

export const useSessionActivityTimeout = ({
  enabled,
  onTimeout,
}: {
  enabled: boolean;
  onTimeout: () => void | Promise<void>;
}) => {
  const onTimeoutRef = useRef(onTimeout);
  const timeoutFiredRef = useRef(false);
  const lastActivityWriteRef = useRef(0);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    timeoutFiredRef.current = false;
    let timeoutId: number | null = null;
    let listenersActive = false;

    const isPastIdleTimeout = (
      previousLastActivityAt: number,
      timestamp: number
    ) => timestamp - previousLastActivityAt >= SESSION_IDLE_TIMEOUT_MS;

    function clearIdleTimer() {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function stopTracking() {
      clearIdleTimer();

      if (!listenersActive) {
        return;
      }

      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('focus', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      listenersActive = false;
    }

    function handleTimeout() {
      if (timeoutFiredRef.current) {
        return;
      }

      timeoutFiredRef.current = true;
      stopTracking();
      clearSessionActivityTimestamp();
      void onTimeoutRef.current();
    }

    function scheduleTimeout(lastActivityAt: number) {
      clearIdleTimer();
      const elapsed = getCurrentTimestamp() - lastActivityAt;
      const remaining = SESSION_IDLE_TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        handleTimeout();
        return;
      }

      timeoutId = window.setTimeout(handleTimeout, remaining);
    }

    function recordActivity(timestamp: number) {
      lastActivityWriteRef.current = timestamp;
      writeSessionLastActivityAt(timestamp);
      scheduleTimeout(timestamp);
    }

    function checkIdleTimeout() {
      if (timeoutFiredRef.current) {
        return;
      }

      const lastActivityAt = readSessionLastActivityAt();
      const now = getCurrentTimestamp();

      if (lastActivityAt === null) {
        recordActivity(now);
        return;
      }

      if (isPastIdleTimeout(lastActivityAt, now)) {
        handleTimeout();
        return;
      }

      lastActivityWriteRef.current = lastActivityAt;
      scheduleTimeout(lastActivityAt);
    }

    function handleActivity() {
      if (timeoutFiredRef.current) {
        return;
      }

      const now = getCurrentTimestamp();
      const previousLastActivityAt = readSessionLastActivityAt();

      if (
        previousLastActivityAt !== null &&
        isPastIdleTimeout(previousLastActivityAt, now)
      ) {
        handleTimeout();
        return;
      }

      if (now - lastActivityWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
        return;
      }

      recordActivity(now);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkIdleTimeout();
      }
    }

    const storedLastActivityAt = readSessionLastActivityAt();
    const now = getCurrentTimestamp();

    // Preserve the timestamp across page reloads. If the user returns after
    // thirty minutes, expire the session before accepting that return as new
    // activity. A fresh timestamp is created only for a genuinely new login.
    if (
      storedLastActivityAt !== null &&
      isPastIdleTimeout(storedLastActivityAt, now)
    ) {
      handleTimeout();
      return;
    }

    if (storedLastActivityAt === null) {
      recordActivity(now);
    } else {
      lastActivityWriteRef.current = storedLastActivityAt;
      scheduleTimeout(storedLastActivityAt);
    }

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('focus', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    listenersActive = true;

    return () => {
      stopTracking();
    };
  }, [enabled]);
};
