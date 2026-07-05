import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUsers } from "../api/client";
import type { Pagination, SortDir, SortField, User, UserFilters } from "../api/types";

const MAX_PAGES_IN_WINDOW = 3;

interface InfiniteUsersState {
  users: User[];
  pagination: Pagination | null;
  loading: boolean;
  loadingMore: boolean;
  loadingPrevious: boolean;
  error: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
  loadMoreError: string | null;
  loadPreviousError: string | null;
  loadMore: () => void;
  loadPrevious: () => void;
  retry: () => void;
}

export function useInfiniteUsers(
  filters: UserFilters,
  sortBy: SortField,
  sortDir: SortDir,
  pageSize: number
): InfiniteUsersState {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [loadPreviousError, setLoadPreviousError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const windowStartRef = useRef(1);
  const windowEndRef = useRef(1);
  const pageLengthsRef = useRef<number[]>([]);
  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const paginationRef = useRef<Pagination | null>(null);
  const inFlightRef = useRef<"more" | "previous" | null>(null);

  const hobbiesKey = filters.hobbies.join(",");
  const nationalitiesKey = filters.nationalities.join(",");

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    windowStartRef.current = 1;
    windowEndRef.current = 1;
    pageLengthsRef.current = [];
    paginationRef.current = null;
    inFlightRef.current = null;
    setUsers([]);
    setPagination(null);
    setLoading(true);
    setLoadingMore(false);
    setLoadingPrevious(false);
    setError(null);
    setLoadMoreError(null);
    setLoadPreviousError(null);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchUsers({ page: 1, pageSize, sortBy, sortDir, filters }, controller.signal)
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        pageLengthsRef.current = [result.data.length];
        paginationRef.current = result.pagination;
        setUsers(result.data);
        setPagination(result.pagination);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load users.");
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.firstName,
    filters.lastName,
    hobbiesKey,
    nationalitiesKey,
    sortBy,
    sortDir,
    pageSize,
    retryToken,
  ]);

  const loadMore = useCallback(() => {
    if (loading || inFlightRef.current) return;
    const currentPagination = paginationRef.current;
    if (!currentPagination || windowEndRef.current >= currentPagination.totalPages) return;
    inFlightRef.current = "more";
    const requestId = requestIdRef.current;
    const nextPage = windowEndRef.current + 1;
    setLoadingMore(true);
    setLoadMoreError(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchUsers({ page: nextPage, pageSize, sortBy, sortDir, filters }, controller.signal)
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        windowEndRef.current = nextPage;
        const lengths = [...pageLengthsRef.current, result.data.length];
        let trimmed = 0;
        if (lengths.length > MAX_PAGES_IN_WINDOW) {
          trimmed = lengths.shift()!;
          windowStartRef.current += 1;
        }
        pageLengthsRef.current = lengths;
        paginationRef.current = result.pagination;
        setUsers((prev) => {
          const next = [...prev, ...result.data];
          return trimmed > 0 ? next.slice(trimmed) : next;
        });
        setPagination(result.pagination);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (requestId !== requestIdRef.current) return;
        setLoadMoreError(err instanceof Error ? err.message : "Failed to load more users.");
      })
      .finally(() => {
        inFlightRef.current = null;
        if (requestId === requestIdRef.current) setLoadingMore(false);
      });
  }, [loading, pageSize, sortBy, sortDir, filters]);

  const loadPrevious = useCallback(() => {
    if (loading || inFlightRef.current) return;
    if (windowStartRef.current <= 1) return;
    inFlightRef.current = "previous";
    const requestId = requestIdRef.current;
    const prevPage = windowStartRef.current - 1;
    setLoadingPrevious(true);
    setLoadPreviousError(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchUsers({ page: prevPage, pageSize, sortBy, sortDir, filters }, controller.signal)
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        windowStartRef.current = prevPage;
        const lengths = [result.data.length, ...pageLengthsRef.current];
        let trimmed = 0;
        if (lengths.length > MAX_PAGES_IN_WINDOW) {
          trimmed = lengths.pop()!;
          windowEndRef.current -= 1;
        }
        pageLengthsRef.current = lengths;
        paginationRef.current = result.pagination;
        setUsers((prev) => {
          const next = [...result.data, ...prev];
          return trimmed > 0 ? next.slice(0, next.length - trimmed) : next;
        });
        setPagination(result.pagination);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (requestId !== requestIdRef.current) return;
        setLoadPreviousError(err instanceof Error ? err.message : "Failed to load previous users.");
      })
      .finally(() => {
        inFlightRef.current = null;
        if (requestId === requestIdRef.current) setLoadingPrevious(false);
      });
  }, [loading, pageSize, sortBy, sortDir, filters]);

  return {
    users,
    pagination,
    loading,
    loadingMore,
    loadingPrevious,
    error,
    hasMore: pagination ? windowEndRef.current < pagination.totalPages : false,
    hasPrevious: windowStartRef.current > 1,
    loadMoreError,
    loadPreviousError,
    loadMore,
    loadPrevious,
    retry: () => setRetryToken((t) => t + 1),
  };
}
