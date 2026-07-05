import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortDir, SortField } from "../api/types";

export const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "age", label: "Age" },
  { value: "nationality", label: "Nationality" },
];

const SORT_FIELD_VALUES = SORT_FIELDS.map((f) => f.value);
const DEFAULT_SORT_BY: SortField = "first_name";
const DEFAULT_SORT_DIR: SortDir = "asc";
export const PAGE_SIZE = 80;

function parseSortBy(raw: string | null): SortField {
  return raw && (SORT_FIELD_VALUES as string[]).includes(raw)
    ? (raw as SortField)
    : DEFAULT_SORT_BY;
}

function parseSortDir(raw: string | null): SortDir {
  return raw === "desc" ? "desc" : DEFAULT_SORT_DIR;
}

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return Array.from(new Set(raw.split(",").map((v) => v.trim()).filter(Boolean)));
}

export interface ViewState {
  firstName: string;
  lastName: string;
  hobbies: string[];
  nationalities: string[];
  sortBy: SortField;
  sortDir: SortDir;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  toggleHobby: (hobby: string) => void;
  toggleNationality: (nationality: string) => void;
  setHobbies: (hobbies: string[]) => void;
  setNationalities: (nationalities: string[]) => void;
  setSort: (sortBy: SortField, sortDir: SortDir) => void;
  clearFilters: () => void;
}

export function useViewState(): ViewState {
  const [searchParams, setSearchParams] = useSearchParams();

  const firstName = useMemo(() => searchParams.get("firstName")?.trim() ?? "", [searchParams]);
  const lastName = useMemo(() => searchParams.get("lastName")?.trim() ?? "", [searchParams]);
  const hobbies = useMemo(() => parseList(searchParams.get("hobbies")), [searchParams]);
  const nationalities = useMemo(
    () => parseList(searchParams.get("nationalities")),
    [searchParams]
  );
  const sortBy = useMemo(() => parseSortBy(searchParams.get("sortBy")), [searchParams]);
  const sortDir = useMemo(() => parseSortDir(searchParams.get("sortDir")), [searchParams]);

  const setTextFilter = useCallback(
    (param: "firstName" | "lastName", nextValue: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextValue) next.set(param, nextValue);
          else next.delete(param);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setFirstName = useCallback(
    (nextValue: string) => setTextFilter("firstName", nextValue),
    [setTextFilter]
  );
  const setLastName = useCallback(
    (nextValue: string) => setTextFilter("lastName", nextValue),
    [setTextFilter]
  );

  const toggleValue = useCallback(
    (param: "hobbies" | "nationalities", value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const current = parseList(next.get(param));
          const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          if (updated.length) next.set(param, updated.join(","));
          else next.delete(param);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const toggleHobby = useCallback((hobby: string) => toggleValue("hobbies", hobby), [
    toggleValue,
  ]);
  const toggleNationality = useCallback(
    (nationality: string) => toggleValue("nationalities", nationality),
    [toggleValue]
  );

  const setValues = useCallback(
    (param: "hobbies" | "nationalities", values: string[]) => {
      const deduped = Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (deduped.length) next.set(param, deduped.join(","));
          else next.delete(param);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setHobbies = useCallback((values: string[]) => setValues("hobbies", values), [setValues]);
  const setNationalities = useCallback(
    (values: string[]) => setValues("nationalities", values),
    [setValues]
  );

  const setSort = useCallback(
    (nextSortBy: SortField, nextSortDir: SortDir) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("sortBy", nextSortBy);
          next.set("sortDir", nextSortDir);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("firstName");
        next.delete("lastName");
        next.delete("hobbies");
        next.delete("nationalities");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return {
    firstName,
    lastName,
    hobbies,
    nationalities,
    sortBy,
    sortDir,
    setFirstName,
    setLastName,
    toggleHobby,
    toggleNationality,
    setHobbies,
    setNationalities,
    setSort,
    clearFilters,
  };
}
