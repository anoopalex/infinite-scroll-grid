import type { ValueCount } from "../api/types";
import { EmptyState, ErrorState, LoadingState } from "./StatusViews";

function StatList({
  items,
  selected,
  onToggle,
}: {
  items: ValueCount[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (items.length === 0) return <EmptyState message="No data available." />;

  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const isSelected = selected.includes(item.value);
        return (
          <li key={item.value}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(item.value)}
              className={`my-0.5 flex w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors ${
                isSelected ? "bg-slate-900 text-white" : "hover:bg-slate-100"
              }`}
            >
              <span
                className={`min-w-0 flex-1 truncate text-left ${
                  isSelected ? "text-white" : "text-slate-600"
                }`}
                title={item.value}
              >
                {item.value}
              </span>
              <span
                className={`w-6 shrink-0 text-right text-xs ${
                  isSelected ? "text-slate-200" : "text-slate-400"
                }`}
              >
                {item.count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveFilterChips({
  selectedHobbies,
  selectedNationalities,
  onToggleHobby,
  onToggleNationality,
  onClearAll,
}: {
  selectedHobbies: string[];
  selectedNationalities: string[];
  onToggleHobby: (hobby: string) => void;
  onToggleNationality: (nationality: string) => void;
  onClearAll: () => void;
}) {
  if (selectedHobbies.length === 0 && selectedNationalities.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Active filters</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-slate-400 hover:text-slate-700"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {selectedHobbies.map((hobby) => (
          <button
            key={`hobby-${hobby}`}
            type="button"
            onClick={() => onToggleHobby(hobby)}
            className="flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            {hobby}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {selectedNationalities.map((nationality) => (
          <button
            key={`nationality-${nationality}`}
            type="button"
            onClick={() => onToggleNationality(nationality)}
            className="flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            {nationality}
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Sidebar({
  loading,
  error,
  topHobbies,
  topNationalities,
  selectedHobbies,
  selectedNationalities,
  onToggleHobby,
  onToggleNationality,
  onClearFilters,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  topHobbies: ValueCount[];
  topNationalities: ValueCount[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  onToggleHobby: (hobby: string) => void;
  onToggleNationality: (nationality: string) => void;
  onClearFilters: () => void;
  onRetry: () => void;
}) {
  return (
    <aside className="flex w-full min-w-0 flex-col gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:basis-0 lg:grow lg:shrink">

      <ActiveFilterChips
        selectedHobbies={selectedHobbies}
        selectedNationalities={selectedNationalities}
        onToggleHobby={onToggleHobby}
        onToggleNationality={onToggleNationality}
        onClearAll={onClearFilters}
      />

      {loading && <LoadingState label="Loading insights…" />}
      {error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <section className="flex min-w-0 flex-1 flex-col gap-3">
            <h3 className="whitespace-nowrap text-sm font-medium text-slate-700">Top Hobbies</h3>
            <StatList items={topHobbies} selected={selectedHobbies} onToggle={onToggleHobby} />
          </section>
          <section className="flex min-w-0 flex-1 flex-col gap-3 sm:border-l sm:border-slate-100 sm:pl-4">
            <h3 className="whitespace-nowrap text-sm font-medium text-slate-700">
              Top Nationalities
            </h3>
            <StatList
              items={topNationalities}
              selected={selectedNationalities}
              onToggle={onToggleNationality}
            />
          </section>
        </div>
      )}
    </aside>
  );
}
