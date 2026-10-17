// Generic paginated response — matches C# PagedResponse<T>
export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
}

