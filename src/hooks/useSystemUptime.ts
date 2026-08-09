import { useEffect, useMemo, useState } from 'react';

export type SystemUptimeSource = 'mock' | 'api';

export interface SystemUptimeSnapshot {
  uptimeSeconds: number;
  sampledAt: number;
  source: SystemUptimeSource;
}

/**
 * Temporary uptime source until the backend endpoint is available.
 *
 * API integration boundary:
 * Replace this snapshot with the normalized response from the uptime endpoint.
 * The presentation layer does not need to change as long as the API adapter
 * returns `uptimeSeconds`, `sampledAt`, and `source: 'api'`.
 */
const MOCK_UPTIME_SNAPSHOT: SystemUptimeSnapshot = {
  uptimeSeconds: 12 * 24 * 60 * 60 + 4 * 60 * 60 + 32 * 60 + 18,
  sampledAt: Date.now(),
  source: 'mock',
};

const useSystemUptimeSource = (): SystemUptimeSnapshot => {
  // TODO(api): replace this return value with the real uptime query result.
  return MOCK_UPTIME_SNAPSHOT;
};

export const useSystemUptime = () => {
  const snapshot = useSystemUptimeSource();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const uptimeSeconds = useMemo(() => {
    const baseSeconds = Math.max(0, Math.floor(snapshot.uptimeSeconds));
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now - snapshot.sampledAt) / 1000)
    );

    return baseSeconds + elapsedSeconds;
  }, [now, snapshot.sampledAt, snapshot.uptimeSeconds]);

  return {
    uptimeSeconds,
    source: snapshot.source,
    isMock: snapshot.source === 'mock',
  } as const;
};

export default useSystemUptime;
