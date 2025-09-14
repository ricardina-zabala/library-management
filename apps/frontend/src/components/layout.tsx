import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <nav className="bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-lg sm:text-xl font-bold text-white" onClick={closeMobileMenu}>
                <span className="sm:inline">Library Management</span>
              </Link>
            </div>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/books"
                  className="text-primary-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Libros
                </Link>
                <Link
                  to="/loans"
                  className="text-primary-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Mis préstamos
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-primary-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-primary-100 text-sm hidden lg:inline">
                    Hola, {user?.firstName}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-800 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-800 transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-primary-100 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg z-40 md:hidden">
            <div className="px-4 pt-2 pb-3 space-y-1 border-t border-primary-500">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-primary-100 text-sm font-medium">
                    Hola, {user?.firstName}
                  </div>

                  <Link
                    to="/books"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-primary-100 hover:text-white hover:bg-primary-500 rounded-md text-base font-medium transition-colors"
                  >
                    Libros
                  </Link>
                  <Link
                    to="/loans"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-primary-100 hover:text-white hover:bg-primary-500 rounded-md text-base font-medium transition-colors"
                  >
                    Mis préstamos
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 text-primary-100 hover:text-white hover:bg-primary-500 rounded-md text-base font-medium transition-colors"
                    >
                      Administración
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left px-3 py-2 text-primary-100 hover:text-white hover:bg-primary-500 rounded-md text-base font-medium transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-primary-100 hover:text-white hover:bg-primary-500 rounded-md text-base font-medium transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <main>{children}</main>
    </div>
  );
};