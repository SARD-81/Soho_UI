export const AUTH_EVENTS = {
  TOKEN_REFRESHED: 'auth:token-refreshed',
  SESSION_CLEARED: 'auth:session-cleared',
} as const;

export const authEventTarget = new EventTarget();

export const emitTokenRefreshed = (accessToken: string) => {
  authEventTarget.dispatchEvent(
    new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, { detail: accessToken })
  );
};

export const emitSessionCleared = () => {
  authEventTarget.dispatchEvent(new Event(AUTH_EVENTS.SESSION_CLEARED));
};