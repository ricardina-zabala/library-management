import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Sistema de Gestión de Biblioteca
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Descubre, solicita prestado y gestiona tus libros favoritos
          </p>

          {isAuthenticated ? (
            <div className="space-y-6">
              <p className="text-lg text-gray-700">
                ¡Bienvenido de nuevo, <span className="font-semibold">{user?.name}</span>!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  to="/books"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-4">📖</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Explorar Libros</h3>
                  <p className="text-gray-600">Busca y descubre libros en nuestra colección</p>
                </Link>

                <Link
                  to="/loans"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mis Préstamos</h3>
                  <p className="text-gray-600">Gestiona tus libros prestados y fechas de vencimiento</p>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">Buscar Libros</h3>
                    <p className="text-gray-600">Encuentra libros por título, autor o categoría</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold mb-2">Solicitar Préstamos</h3>
                    <p className="text-gray-600">Solicita libros prestados con solo unos clics</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">⏰</div>
                    <h3 className="text-lg font-semibold mb-2">Seguir Fechas de Vencimiento</h3>
                    <p className="text-gray-600">Nunca olvides una fecha de devolución</p>
                  </div>
                </div>
              </div>

              <Link
                to="/auth"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Comenzar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
