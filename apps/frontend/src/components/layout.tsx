import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <nav className="bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-white">
                Library Management
              </Link>
              
              {isAuthenticated && (
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/books"
                    className="text-primary-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Libros
                  </Link>
                  <Link
                    to="/loans"
                    className="text-primary-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Mis prestamos
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-primary-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-primary-100 text-sm">
                    Bienvenido, {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-800"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-800"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};