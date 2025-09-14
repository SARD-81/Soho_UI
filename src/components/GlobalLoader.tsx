import LoadingPage from './LoadingPage.tsx';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export default function GlobalLoader() {
  const isFetching = useIsFetching({
    predicate: (query) => !query.meta?.skipGlobalLoader,
  });
  const isMutating = useIsMutating({
    predicate: (mutation) => !mutation.meta?.skipGlobalLoader,
  });

  return isFetching + isMutating > 0 ? <LoadingPage /> : null;
}
