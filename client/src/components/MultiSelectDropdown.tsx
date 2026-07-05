import { useEffect, useRef, useState } from "react";

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onApply,
}: {
  label: string;
  options: string[];
  selected: string[];
  onApply: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggleDraft(value: string) {
    setDraft((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleClear() {
    setDraft([]);
    onApply([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-xs font-medium text-white">
            {selected.length}
          </span>
        )}
        <span aria-hidden="true" className="text-slate-400">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 flex w-56 flex-col rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="max-h-64 overflow-y-auto p-1">
            {options.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-slate-400">No options available.</p>
            ) : (
              options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={draft.includes(option)}
                    onChange={() => toggleDraft(option)}
                    className="h-3.5 w-3.5 rounded border-slate-300"
                  />
                  {option}
                </label>
              ))
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-1.5">
            <button
              type="button"
              onClick={handleClear}
              className="rounded px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
