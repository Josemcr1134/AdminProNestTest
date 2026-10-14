import { api } from "../../lib/api";
import type { Paginated, Product } from "../../lib/types";

export type SortBy = 'name' | 'price' | 'stock' | 'createdAt';

export interface ProductQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: number;
  sortBy: SortBy;
  sortOrder: 'asc' | 'desc';
  active?: boolean
}

export interface ProductInput {
  name: string;
  sku: string;
  price: number;
  stock: number;
  active?: boolean;
  categoryId: number;
}

export const productsApi = {
  list: async (params: ProductQuery) => (await api.get<Paginated<Product>>('/products', { params })).data,
  create: async (data: ProductInput) => (await api.post<Product>('/products', data)).data,
  update: async ({ id, data }: { id: number; data: ProductInput }) => (await api.patch<Product>(`/products/${id}`, data)).data,
  remove: async (id: number) => {
    await api.delete(`/products/${id}`);
  }
}

