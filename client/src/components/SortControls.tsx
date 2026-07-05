import type { SortDir, SortField } from "../api/types";
import { SORT_FIELDS } from "../hooks/useViewState";

export function SortControls({
  sortBy,
  sortDir,
  onChange,
}: {
  sortBy: SortField;
  sortDir: SortDir;
  onChange: (sortBy: SortField, sortDir: SortDir) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <label className="flex items-center gap-1.5 text-sm text-slate-600 min-w-40">
        Sort by
        <select
          value={sortBy}
          onChange={(e) => onChange(e.target.value as SortField, sortDir)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          {SORT_FIELDS.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => onChange(sortBy, sortDir === "asc" ? "desc" : "asc")}
        aria-label={`Sort direction: ${sortDir === "asc" ? "ascending" : "descending"}`}
        className="flex min-w-10 items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
      </button>
    </div>
  );
}
