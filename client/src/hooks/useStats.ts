import { useEffect, useState } from "react";
import { fetchStats } from "../api/client";
import type { Stats, UserFilters } from "../api/types";

interface StatsState {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useStats(filters: UserFilters): StatsState {
  const [state, setState] = useState<Omit<StatsState, "retry">>({
    stats: null,
    loading: true,
    error: null,
  });
  const [retryToken, setRetryToken] = useState(0);

  const hobbiesKey = filters.hobbies.join(",");
  const nationalitiesKey = filters.nationalities.join(",");

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchStats(filters, controller.signal)
      .then((stats) => setState({ stats, loading: false, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to load stats.";
        setState({ stats: null, loading: false, error: message });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.firstName, filters.lastName, hobbiesKey, nationalitiesKey, retryToken]);

  return { ...state, retry: () => setRetryToken((t) => t + 1) };
}
