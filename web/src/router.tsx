import { createBrowserRouter } from "react-router";
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./features/products/ProductsPage";
import { CategoriesPage } from "./features/categories/CategoriesPage";
export const router = createBrowserRouter([
  {
    path:'/login', element: <LoginPage/>
  },
  {
    path:'/register', element: <RegisterPage/>
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <ProductsPage/>},
          { path: 'categories', element:  <CategoriesPage/>},
          { path: '',element: <ProtectedRoute roles={['ADMIN']} />, children: [{ path: 'users', element: <div>FASE 4 USUARIOS</div>}] }
        ]
      }
    ]
  }
])
