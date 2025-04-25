import { useState, useEffect, useCallback, RefObject } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
  enabled?: boolean;
}

export function useInfiniteScroll(
  scrollRef: RefObject<HTMLElement>,
  loadMore: () => void,
  options: UseInfiniteScrollOptions = {},
) {
  const { threshold = 200, initialPage = 1, enabled = true } = options;
  const [page, setPage] = useState(initialPage);
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !enabled || isFetching) return;

    const scrollElement = scrollRef.current;
    const scrollPosition = scrollElement.scrollTop + scrollElement.clientHeight;
    const scrollHeight = scrollElement.scrollHeight;

    // Check if we've scrolled to the threshold
    if (scrollHeight - scrollPosition <= threshold) {
      setIsFetching(true);
    }
  }, [scrollRef, threshold, isFetching, enabled]);

  // Set up scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !enabled) return;

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [scrollRef, handleScroll, enabled]);

  // Handle fetching state
  useEffect(() => {
    if (!isFetching || !enabled) return;

    loadMore();
    setPage((prev) => prev + 1);
    setIsFetching(false);
  }, [isFetching, loadMore, enabled]);

  return { page, setPage, isFetching };
}
