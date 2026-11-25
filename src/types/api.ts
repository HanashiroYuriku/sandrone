/**
 * Shared API contracts. Adjust these to match your backend's envelope once;
 * every feature module builds on them.
 */

export type SortDirection = "asc" | "desc";

export interface SortParam {
  /** Column/field id the backend sorts by. */
  id: string;
  desc: boolean;
}

/** Query params for any server-side paginated list. */
export interface ListParams {
  /** 1-based page index. */
  page: number;
  pageSize: number;
  search?: string;
  sort?: SortParam[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Wrapper for single-resource endpoints that return `{ data: T }`. */
export interface DataResponse<T> {
  data: T;
}

/** Field-level validation messages, keyed by field path (e.g. "price", "lines.0.qty"). */
export type FieldErrors = Record<string, string[]>;

/** Error body the API client understands. Unknown shapes are normalized to this. */
export interface ApiErrorBody {
  message: string;
  code?: string;
  errors?: FieldErrors;
}

export type Id = string;

/** Columns every persisted entity carries. */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}
