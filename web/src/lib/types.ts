export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: number,
  name: string,
  email: string,
  role: Role,
  createdAt: string
}

export interface AuthResponse {
  user: User,
  accessToken: string
}

export interface Category {
  id: number;
  name: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: string; // Prisma Decimal llega como texto en el JSON: "199.99"
  stock: number;
  active: boolean;
  categoryId: number;
  category: Category;
  createdAt: string;
}

// Forma estándar de los listados paginados de la API
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}



