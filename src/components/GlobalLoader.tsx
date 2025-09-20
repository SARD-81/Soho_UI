import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import LoadingPage from './LoadingPage.tsx';

export default function GlobalLoader() {
  const isFetching = useIsFetching({
    predicate: (query) =>
      !query.meta?.skipGlobalLoader &&
      query.state.fetchStatus === 'fetching' &&
      query.state.status === 'error' &&
      query.state.data === undefined,
  });
  const isMutating = useIsMutating({
    predicate: (mutation) => !mutation.meta?.skipGlobalLoader,
  });

  return isFetching + isMutating > 0 ? <LoadingPage /> : null;
}
