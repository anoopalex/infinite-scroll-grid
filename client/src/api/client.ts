import type { FilterOptions, PaginatedUsers, SortDir, SortField, Stats, UserFilters } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function appendFilterParams(params: URLSearchParams, filters: UserFilters): void {
  if (filters.firstName) params.set("firstName", filters.firstName);
  if (filters.lastName) params.set("lastName", filters.lastName);
  if (filters.nationalities.length) params.set("nationalities", filters.nationalities.join(","));
  if (filters.hobbies.length) params.set("hobbies", filters.hobbies.join(","));
}

export interface FetchUsersParams {
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortDir: SortDir;
  filters: UserFilters;
}

export function fetchUsers(
  { page, pageSize, sortBy, sortDir, filters }: FetchUsersParams,
  signal?: AbortSignal
): Promise<PaginatedUsers> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortDir,
  });
  appendFilterParams(params, filters);
  return getJson<PaginatedUsers>(`${API_BASE}/users?${params}`, signal);
}

export function fetchStats(filters: UserFilters, signal?: AbortSignal): Promise<Stats> {
  const params = new URLSearchParams();
  appendFilterParams(params, filters);
  const qs = params.toString();
  return getJson<Stats>(`${API_BASE}/stats${qs ? `?${qs}` : ""}`, signal);
}

export function fetchFilterOptions(signal?: AbortSignal): Promise<FilterOptions> {
  return getJson<FilterOptions>(`${API_BASE}/filter-options`, signal);
}
