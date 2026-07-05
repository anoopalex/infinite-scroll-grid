export type SortField = "id" | "first_name" | "last_name" | "age" | "nationality";
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

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedUsers {
  data: User[];
  pagination: Pagination;
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
