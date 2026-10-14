import { useSearchParams } from "react-router";
import type { ProductQuery, SortBy } from "./products.api";

const SORTABLE: SortBy[] = ['name', 'price', 'stock', 'createdAt'];

export function useProductFilters() {
  const [params, setParams] = useSearchParams();

  const sortBy = params.get('sortBy') as SortBy | null;
  const categoryId = Number(params.get('categoryId'));

  const query: ProductQuery = {
    page: Number(params.get('page')) || 1,
    limit: Number(params.get('limit')) || 10,
    search: params.get('search') || undefined,
    categoryId: categoryId > 0 ? categoryId : undefined,
    sortBy: sortBy && SORTABLE.includes(sortBy) ? sortBy : 'createdAt',
    sortOrder: params.get('sortOrder') === 'asc' ? 'asc' : 'desc',
    active: params.get('active') === 'true' ? true : params.get('active') === 'false' ? false : undefined,
  };


  function setFilters(changes: Partial<ProductQuery>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || value === '') next.delete(key)
          else next.set(key, String(value));
        }
        if (!('page' in changes)) next.delete('page');
        return next;
      }
    )
  }

  return { query, setFilters }
}
