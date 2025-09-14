import { useEffect, useState } from 'react';
import { useLoans } from '../hooks/useLoans.js';
import { useAuth } from '../hooks/useAuth.js';
import { LoanStatus } from 'app-domain';
import { toast } from 'react-toastify';

type FilterType = 'all' | 'active' | 'overdue' | 'returned';

export const LoansPage = () => {
  const { loans, loading, error, getUserLoans, returnBook, renewLoan } = useLoans();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (user) {
      getUserLoans(user.id);
    }
  }, [user, getUserLoans]);

  const handleReturnBook = async (loanId: string) => {
    const response = await returnBook({ loanId });
    if (response.success) {
      toast.success('¡Libro devuelto exitosamente!');
      if (user) {
        getUserLoans(user.id);
      }
    } else {
      toast.error('No se pudo devolver el libro');
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    const response = await renewLoan({ loanId });
    if (response.success) {
      toast.success('¡Préstamo renovado exitosamente!');
      if (user) {
        getUserLoans(user.id);
      }
    } else {
      toast.error(response.error || 'No se pudo renovar el préstamo');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  const getFilteredLoans = () => {
    if (!Array.isArray(loans)) return [];
    
    switch (filter) {
      case 'active':
        return loans.filter(loan => loan.status === LoanStatus.ACTIVE && !isOverdue(loan.dueDate));
      case 'overdue':
        return loans.filter(loan => loan.status === LoanStatus.ACTIVE && isOverdue(loan.dueDate));
      case 'returned':
        return loans.filter(loan => loan.status === LoanStatus.RETURNED);
      default:
        return loans;
    }
  };

  const filteredLoans = getFilteredLoans();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => user && getUserLoans(user.id)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis préstamos</h1>
          <p className="text-gray-600">Gestiona tus libros prestados</p>
          
          {Array.isArray(loans) && loans.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-md">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(loan => loan.status === LoanStatus.ACTIVE).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-md">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vencidos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(loan => 
                        loan.status === LoanStatus.ACTIVE && isOverdue(loan.dueDate)
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-md">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Devueltos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loans.filter(loan => loan.status === LoanStatus.RETURNED).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        {Array.isArray(loans) && loans.length > 0 && (
          <div className="mb-6 flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos ({loans.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'active'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Activos ({loans.filter(loan => loan.status === LoanStatus.ACTIVE && !isOverdue(loan.dueDate)).length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Vencidos ({loans.filter(loan => loan.status === LoanStatus.ACTIVE && isOverdue(loan.dueDate)).length})
            </button>
            <button
              onClick={() => setFilter('returned')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'returned'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Devueltos ({loans.filter(loan => loan.status === LoanStatus.RETURNED).length})
            </button>
          </div>
        )}

        {Array.isArray(loans) && loans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg">Aún no has tomado prestado ningún libro.</p>
            <a
              href="/books"
              className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700"
            >
              Explorar libros
            </a>
          </div>
        ) : Array.isArray(loans) && loans.length > 0 && filteredLoans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg">No hay préstamos que coincidan con el filtro seleccionado.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver todos los préstamos
            </button>
          </div>
        ) : filteredLoans.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <li key={loan.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {(loan as any).book?.title || 'Cargando título...'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          por {(loan as any).book?.author || 'Cargando autor...'}
                        </p>
                        {(loan as any).book?.category && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {(loan as any).book.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              loan.status === LoanStatus.ACTIVE
                                ? 'bg-yellow-100 text-yellow-800'
                                : loan.status === LoanStatus.RETURNED
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {loan.status === LoanStatus.ACTIVE ? 'Activo' : 
                             loan.status === LoanStatus.RETURNED ? 'Devuelto' : 'Vencido'}
                          </span>
                          {isOverdue(loan.dueDate) && loan.status === LoanStatus.ACTIVE && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Vencido
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Loan Details */}
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>Prestado: {formatDate(loan.loanDate)}</span>
                        <span className={isOverdue(loan.dueDate) && loan.status === LoanStatus.ACTIVE ? 'text-red-600 font-medium' : ''}>
                          Vence: {formatDate(loan.dueDate)}
                        </span>
                        {loan.returnDate && (
                          <span>Devuelto: {formatDate(loan.returnDate)}</span>
                        )}
                        <span>Renovaciones: {loan.renewalCount}/3</span>
                      </div>
                    </div>

                    {loan.status === LoanStatus.ACTIVE && (
                      <div className="ml-4 flex space-x-2">
                        {loan.renewalCount < 3 && !isOverdue(loan.dueDate) && (
                          <button
                            onClick={() => handleRenewLoan(loan.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                          >
                            Renovar
                          </button>
                        )}
                        <button
                          onClick={() => handleReturnBook(loan.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
                        >
                          Devolver
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg">No se pueden cargar los datos de los préstamos.</p>
            <button
              onClick={() => user && getUserLoans(user.id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cargar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};