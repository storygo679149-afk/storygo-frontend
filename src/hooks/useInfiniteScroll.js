import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scrolling
 * @param {Function} fetchMore - Function to fetch more data
 * @param {Object} options - Configuration options
 * @returns {Object} - Infinite scroll state and refs
 */
const useInfiniteScroll = (fetchMore, options = {}) => {
  const {
    threshold = 100,
    enabled = true,
    initialPage = 1,
    hasMore = true
  } = options;

  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEndReached, setIsEndReached] = useState(!hasMore);
  
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Intersection observer callback
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && enabled && !isLoading && !isEndReached) {
      loadMore();
    }
  }, [enabled, isLoading, isEndReached]);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled || isEndReached) return;

    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0
    });

    observerRef.current.observe(loadMoreElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, enabled, threshold, isEndReached]);

  // Set up scroll-based fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (!enabled || isLoading || isEndReached) return;

      const scrollPosition = window.innerHeight + window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight - scrollPosition <= threshold) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, isLoading, isEndReached, threshold]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (isLoading || isEndReached) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const nextPage = page + 1;
      const result = await fetchMore(nextPage);

      if (result && result.hasMore !== undefined) {
        setIsEndReached(!result.hasMore);
      } else if (result && result.length === 0) {
        setIsEndReached(true);
      }

      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, fetchMore, isLoading, isEndReached]);

  // Reset infinite scroll
  const reset = useCallback(() => {
    setPage(initialPage);
    setIsLoading(false);
    setHasError(false);
    setIsEndReached(!hasMore);
  }, [initialPage, hasMore]);

  // Retry loading
  const retry = useCallback(() => {
    setHasError(false);
    loadMore();
  }, [loadMore]);

  return {
    page,
    isLoading,
    hasError,
    isEndReached,
    loadMoreRef,
    loadMore,
    reset,
    retry
  };
};

export default useInfiniteScroll;