export interface PageView<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
