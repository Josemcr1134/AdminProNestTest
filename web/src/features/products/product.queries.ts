import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { productsApi, type ProductQuery } from "./products.api"
import { categoryApi } from "../categories/categories.api";

export const productKeys = {
  all: ['products'] as const,
  list: (query: ProductQuery) => [...productKeys.all, 'list', query] as const
}



export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => productsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
    staleTime: 5 * 60_000
  });
}

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
};

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({ mutationFn: productsApi.create, onSuccess: invalidate });
}
export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({ mutationFn: productsApi.update, onSuccess: invalidate });
}
export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({ mutationFn: productsApi.remove, onSuccess: invalidate });
}
