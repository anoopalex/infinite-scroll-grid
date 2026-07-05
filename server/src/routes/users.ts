import { Request, Router } from "express";
import {
  getFilterOptions,
  getStats,
  getUsers,
  isSortField,
  SortDir,
  UserFilters,
} from "../services/users.service";

export const usersRouter = Router();

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_QUERY_LENGTH = 200;
const MAX_FILTER_VALUES = 50;

function parseMultiValue(raw: unknown): string[] {
  const values: string[] = [];
  if (Array.isArray(raw)) {
    for (const v of raw) values.push(...String(v).split(","));
  } else if (typeof raw === "string" && raw.length > 0) {
    values.push(...raw.split(","));
  }
  const trimmed = values.map((v) => v.trim()).filter((v) => v.length > 0);
  return Array.from(new Set(trimmed)).slice(0, MAX_FILTER_VALUES);
}

function parseFilters(req: Request): UserFilters {
  return {
    firstName: String(req.query.firstName ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    lastName: String(req.query.lastName ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    nationalities: parseMultiValue(req.query.nationalities),
    hobbies: parseMultiValue(req.query.hobbies),
  };
}

usersRouter.get("/users", (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSizeRaw =
    parseInt(String(req.query.pageSize ?? DEFAULT_PAGE_SIZE), 10) ||
    DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);

  const sortByRaw = String(req.query.sortBy ?? "first_name");
  if (!isSortField(sortByRaw)) {
    res.status(400).json({
      error: `Invalid sortBy value "${sortByRaw}". Allowed: id, first_name, last_name, age, nationality.`,
    });
    return;
  }

  const sortDirRaw = String(req.query.sortDir ?? "asc").toLowerCase();
  if (sortDirRaw !== "asc" && sortDirRaw !== "desc") {
    res.status(400).json({
      error: `Invalid sortDir value "${sortDirRaw}". Allowed: asc, desc.`,
    });
    return;
  }
  const sortDir = sortDirRaw as SortDir;

  const filters = parseFilters(req);
  const result = getUsers(filters, { page, pageSize }, { sortBy: sortByRaw, sortDir });
  res.json(result);
});

usersRouter.get("/stats", (req, res) => {
  res.json(getStats(parseFilters(req)));
});

usersRouter.get("/filter-options", (_req, res) => {
  res.json(getFilterOptions());
});
