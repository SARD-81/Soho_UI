import { useEffect, useRef } from 'react';

const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_IDLE_CHECK_INTERVAL_MS = 30 * 1000;
const LAST_ACTIVITY_STORAGE_KEY = 'auth:last-activity-at';

const ACTIVITY_WRITE_THROTTLE_MS = 5 * 1000;

const getCurrentTimestamp = () => Date.now();

const readLastActivityAt = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.sessionStorage.getItem(
      LAST_ACTIVITY_STORAGE_KEY
    );
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

const writeLastActivityAt = (timestamp: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(timestamp));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[auth] unable to write last activity timestamp', error);
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

    let intervalId: number | null = null;
    let listenersActive = true;

    const recordActivity = (timestamp: number) => {
      lastActivityWriteRef.current = timestamp;
      writeLastActivityAt(timestamp);
    };

    const isPastIdleTimeout = (
      previousLastActivityAt: number,
      timestamp: number
    ) => timestamp - previousLastActivityAt >= SESSION_IDLE_TIMEOUT_MS;

    const recordActivityUnlessTimedOut = (timestamp: number) => {
      const previousLastActivityAt = readLastActivityAt();

      if (
        previousLastActivityAt !== null &&
        isPastIdleTimeout(previousLastActivityAt, timestamp)
      ) {
        handleTimeout();
        return;
      }

      recordActivity(timestamp);
    };

    const handleActivity = () => {
      if (timeoutFiredRef.current) {
        return;
      }

      const now = getCurrentTimestamp();
      if (now - lastActivityWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
        return;
      }

      recordActivityUnlessTimedOut(now);
    };

    const stopTracking = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

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
    };

    const handleTimeout = () => {
      if (timeoutFiredRef.current) {
        return;
      }

      timeoutFiredRef.current = true;
      stopTracking();
      void onTimeoutRef.current();
    };

    const checkIdleTimeout = () => {
      if (timeoutFiredRef.current) {
        return;
      }

      const lastActivityAt = readLastActivityAt();
      const now = getCurrentTimestamp();

      if (lastActivityAt === null) {
        recordActivity(now);
        return;
      }

      if (isPastIdleTimeout(lastActivityAt, now)) {
        handleTimeout();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkIdleTimeout();
      }
    };

    // A successful authenticated mount should start a fresh activity window.
    // Without this, a stale timestamp from a previous session can immediately
    // trigger the idle-timeout logout right after a new login.
    recordActivity(getCurrentTimestamp());

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('focus', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    intervalId = window.setInterval(
      checkIdleTimeout,
      SESSION_IDLE_CHECK_INTERVAL_MS
    );

    return () => {
      stopTracking();
    };
  }, [enabled]);
};
