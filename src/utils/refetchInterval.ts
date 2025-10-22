export const createVisibilityAwareInterval = (intervalMs: number) => {
  return () => {
    if (typeof document === 'undefined') {
      return intervalMs;
    }

    return document.visibilityState === 'visible' ? intervalMs : false;
  };
};
