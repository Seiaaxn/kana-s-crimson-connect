import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean, loading: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      }, { rootMargin: '200px' });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    return () => { observerRef.current?.disconnect(); };
  }, []);

  return sentinelRef;
}
