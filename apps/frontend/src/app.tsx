import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Layout } from "./components/layout.js";
import { useAuth } from "./hooks/useAuth.js";
import { AuthProvider } from "./contexts/AuthContext.js";
import Home from "./pages/home.js";
import { AuthPage } from "./pages/auth.js";
import { BooksPage } from "./pages/books.js";
import { LoansPage } from "./pages/loans.js";
import { AdminBooksPage } from "./pages/admin-books.js";
import LibrarianLoanManagement from "./pages/librarian-loan-management.js";
import { ToastContainer } from 'react-toastify';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/books" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/books" 
              element={
                <ProtectedRoute>
                  <BooksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loans" 
              element={
                <ProtectedRoute>
                  <LoansPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminBooksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/librarian/loan-request/:token" 
              element={<LibrarianLoanManagement />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
