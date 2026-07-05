import { useEffect, useState } from "react";
import { fetchFilterOptions } from "../api/client";
import type { FilterOptions } from "../api/types";

interface FilterOptionsState {
  options: FilterOptions | null;
  loading: boolean;
  error: string | null;
}

export function useFilterOptions(): FilterOptionsState {
  const [state, setState] = useState<FilterOptionsState>({
    options: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchFilterOptions(controller.signal)
      .then((options) => setState({ options, loading: false, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to load filter options.";
        setState({ options: null, loading: false, error: message });
      });

    return () => controller.abort();
  }, []);

  return state;
}
