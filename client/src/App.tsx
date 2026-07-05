import { useMemo } from "react";
import type { UserFilters } from "./api/types";
import { MultiSelectDropdown } from "./components/MultiSelectDropdown";
import { SearchInput } from "./components/SearchInput";
import { Sidebar } from "./components/Sidebar";
import { SortControls } from "./components/SortControls";
import { EmptyState, ErrorState, LoadingState } from "./components/StatusViews";
import { UserList } from "./components/UserList";
import { useFilterOptions } from "./hooks/useFilterOptions";
import { useInfiniteUsers } from "./hooks/useInfiniteUsers";
import { useStats } from "./hooks/useStats";
import { PAGE_SIZE, useViewState } from "./hooks/useViewState";

export default function App() {
  const view = useViewState();
  const filters = useMemo<UserFilters>(
    () => ({
      firstName: view.firstName,
      lastName: view.lastName,
      hobbies: view.hobbies,
      nationalities: view.nationalities,
    }),
    [view.firstName, view.lastName, view.hobbies, view.nationalities]
  );

  const {
    users,
    pagination,
    loading,
    loadingMore,
    loadingPrevious,
    error,
    hasMore,
    hasPrevious,
    loadMoreError,
    loadPreviousError,
    loadMore,
    loadPrevious,
    retry,
  } = useInfiniteUsers(filters, view.sortBy, view.sortDir, PAGE_SIZE);
  const stats = useStats(filters);
  const filterOptions = useFilterOptions();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <h1 className="text-lg font-semibold text-slate-900">User Directory</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-4 lg:basis-0 lg:grow-3 lg:shrink">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                value={view.firstName}
                onChange={view.setFirstName}
                placeholder="Search by first name…"
              />
              <SearchInput
                value={view.lastName}
                onChange={view.setLastName}
                placeholder="Search by last name…"
              />
              <MultiSelectDropdown
                label="Nationality"
                options={filterOptions.options?.nationalities ?? []}
                selected={view.nationalities}
                onApply={view.setNationalities}
              />
              <MultiSelectDropdown
                label="Hobbies"
                options={filterOptions.options?.hobbies ?? []}
                selected={view.hobbies}
                onApply={view.setHobbies}
              />
              <SortControls sortBy={view.sortBy} sortDir={view.sortDir} onChange={view.setSort} />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            {pagination ? `${pagination.totalItems} people match your filters` : ""}
          </p>

          {loading && <LoadingState label="Loading users…" />}
          {!loading && error && <ErrorState message={error} onRetry={retry} />}
          {!loading && !error && users.length === 0 && <EmptyState />}
          {!loading && !error && users.length > 0 && (
            <UserList
              users={users}
              hasMore={hasMore}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
              onLoadMore={loadMore}
              hasPrevious={hasPrevious}
              loadingPrevious={loadingPrevious}
              loadPreviousError={loadPreviousError}
              onLoadPrevious={loadPrevious}
            />
          )}
        </section>
        <Sidebar
          loading={stats.loading}
          error={stats.error}
          topHobbies={stats.stats?.topHobbies ?? []}
          topNationalities={stats.stats?.topNationalities ?? []}
          selectedHobbies={view.hobbies}
          selectedNationalities={view.nationalities}
          onToggleHobby={view.toggleHobby}
          onToggleNationality={view.toggleNationality}
          onClearFilters={view.clearFilters}
          onRetry={stats.retry}
        />
      </main>
    </div>
  );
}
