import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import LoadingComponent from './LoadingComponent.tsx';

export default function GlobalLoader() {
  const isFetching = useIsFetching({
    predicate: (query) =>
      !query.meta?.skipGlobalLoader && query.state.fetchStatus === 'fetching',
  });
  const isMutating = useIsMutating({
    predicate: (mutation) =>
      !mutation.meta?.skipGlobalLoader && mutation.state.status === 'pending',
  });

  return isFetching + isMutating > 0 ? <LoadingComponent /> : null;
}
