import { db } from "../db/client";

export const SORTABLE_FIELDS = [
  "id",
  "first_name",
  "last_name",
  "age",
  "nationality",
] as const;

export type SortField = (typeof SORTABLE_FIELDS)[number];
export type SortDir = "asc" | "desc";

export interface User {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface PaginatedUsers {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ValueCount {
  value: string;
  count: number;
}

export interface Stats {
  topHobbies: ValueCount[];
  topNationalities: ValueCount[];
}

export interface FilterOptions {
  nationalities: string[];
  hobbies: string[];
}

export interface UserFilters {
  firstName: string;
  lastName: string;
  nationalities: string[];
  hobbies: string[];
}

export function isSortField(value: string): value is SortField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function buildUserWhere(filters: UserFilters): { sql: string; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.firstName) {
    clauses.push("first_name LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(filters.firstName)}%`);
  }

  if (filters.lastName) {
    clauses.push("last_name LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(filters.lastName)}%`);
  }

  if (filters.nationalities.length > 0) {
    clauses.push(`nationality IN (${filters.nationalities.map(() => "?").join(",")})`);
    params.push(...filters.nationalities);
  }

  if (filters.hobbies.length > 0) {
    clauses.push(
      `id IN (
         SELECT uh.user_id FROM user_hobbies uh
         JOIN hobbies h ON h.id = uh.hobby_id
         WHERE h.name IN (${filters.hobbies.map(() => "?").join(",")})
         GROUP BY uh.user_id
         HAVING COUNT(DISTINCT h.name) = ?
       )`
    );
    params.push(...filters.hobbies, filters.hobbies.length);
  }

  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export function getUsers(
  filters: UserFilters,
  pagination: { page: number; pageSize: number },
  sort: { sortBy: SortField; sortDir: SortDir }
): PaginatedUsers {
  const { page, pageSize } = pagination;
  const { sortBy, sortDir } = sort;
  const { sql: whereSql, params: whereParams } = buildUserWhere(filters);

  const { totalItems } = db
    .prepare(`SELECT COUNT(*) as totalItems FROM users ${whereSql}`)
    .get(...whereParams) as { totalItems: number };

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;

  const direction = sortDir.toUpperCase();
  const rows = db
    .prepare(
      `SELECT id, avatar, first_name, last_name, age, nationality
       FROM users
       ${whereSql}
       ORDER BY ${sortBy} ${direction}, id ${direction}
       LIMIT ? OFFSET ?`
    )
    .all(...whereParams, pageSize, offset) as Omit<User, "hobbies">[];

  const hobbiesByUser = new Map<number, string[]>();
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const placeholders = ids.map(() => "?").join(",");
    const hobbyRows = db
      .prepare(
        `SELECT uh.user_id as userId, h.name as name
         FROM user_hobbies uh
         JOIN hobbies h ON h.id = uh.hobby_id
         WHERE uh.user_id IN (${placeholders})
         ORDER BY h.name ASC`
      )
      .all(...ids) as { userId: number; name: string }[];

    for (const { userId, name } of hobbyRows) {
      const list = hobbiesByUser.get(userId) ?? [];
      list.push(name);
      hobbiesByUser.set(userId, list);
    }
  }

  const data: User[] = rows.map((row) => ({
    ...row,
    hobbies: hobbiesByUser.get(row.id) ?? [],
  }));

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export function getStats(filters: UserFilters): Stats {
  const { sql: whereSql, params } = buildUserWhere(filters);

  const topNationalities = db
    .prepare(
      `SELECT nationality as value, COUNT(*) as count
       FROM users
       ${whereSql}
       GROUP BY nationality
       ORDER BY count DESC, value ASC
       LIMIT 20`
    )
    .all(...params) as ValueCount[];

  const topHobbies = db
    .prepare(
      `SELECT h.name as value, COUNT(DISTINCT uh.user_id) as count
       FROM user_hobbies uh
       JOIN hobbies h ON h.id = uh.hobby_id
       WHERE uh.user_id IN (SELECT id FROM users ${whereSql})
       GROUP BY h.name
       ORDER BY count DESC, value ASC
       LIMIT 20`
    )
    .all(...params) as ValueCount[];

  return { topHobbies, topNationalities };
}

export function getFilterOptions(): FilterOptions {
  const nationalities = (
    db
      .prepare(`SELECT DISTINCT nationality as value FROM users ORDER BY nationality ASC`)
      .all() as { value: string }[]
  ).map((row) => row.value);

  const hobbies = (
    db.prepare(`SELECT name as value FROM hobbies ORDER BY name ASC`).all() as { value: string }[]
  ).map((row) => row.value);

  return { nationalities, hobbies };
}
