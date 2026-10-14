import { api } from "../../lib/api";
import type { Category } from "../../lib/types";

export interface CategoryInput {
  name: string;
}

export const categoryApi = {
  list: async () => (await api.get<Category[]>('/categories')).data,
  create: async (data: CategoryInput) => (await api.post<Category>('/categories', data)).data,
  update: async ({ id, data }: { id: number, data: CategoryInput }) => (await api.patch<Category>(`/categories/${id}`, data)).data,
  delete: async (id: number) => (await api.delete<Category>(`/categories/${id}`)).data,
}
