import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Funcionarios from "@/pages/Funcionarios";
import Equipamentos from "@/pages/Equipamentos";
import Eventos from "@/pages/Eventos";
import Financeiro from "@/pages/Financeiro";
import Calendario from "@/pages/Calendario";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/funcionarios",
    element: (
      <ProtectedRoute requireSecretaryOrAdmin>
        <Layout>
          <Funcionarios />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/equipamentos",
    element: (
      <ProtectedRoute requireSecretaryOrAdmin>
        <Layout>
          <Equipamentos />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/eventos",
    element: (
      <ProtectedRoute requireSecretaryOrAdmin>
        <Layout>
          <Eventos />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/financeiro",
    element: (
      <ProtectedRoute requireSecretaryOrAdmin>
        <Layout>
          <Financeiro />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendario",
    element: (
      <ProtectedRoute requireSecretaryOrAdmin>
        <Layout>
          <Calendario />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/configuracoes",
    element: (
      <ProtectedRoute>
        <Layout>
          <Configuracoes />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;