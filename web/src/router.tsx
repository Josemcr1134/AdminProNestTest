import { createBrowserRouter } from "react-router";
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
export const router = createBrowserRouter([
  {
    path:'/login', element: <LoginPage/>
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <div>Products(Fase 4)</div>},
          { path: 'categories', element: <div>Categorias(Fase 4)</div>}
        ]
      }
    ]
  }
])
