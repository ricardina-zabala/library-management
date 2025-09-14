import type { Book } from 'app-domain';
import { Modal } from './modal.js';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: (() => void | Promise<void>) | undefined;
  onReturn?: (() => void | Promise<void>) | undefined;
  canBorrow?: boolean;
  canReturn?: boolean;
}

export const BookDetailModal = ({ 
  book, 
  isOpen, 
  onClose, 
  onBorrow, 
  onReturn, 
  canBorrow = false, 
  canReturn = false 
}: BookDetailModalProps) => {
  if (!book) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'BORROWED':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'RESERVED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'MAINTENANCE':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Libro">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h2>
              <p className="text-lg text-gray-600 italic">por {book.author}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(book.status)}`}>
              {book.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">ISBN</label>
              <p className="mt-1 text-gray-900 font-mono">{book.isbn}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Categoría</label>
              <p className="mt-1 text-gray-900">{book.category}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Año de Publicación</label>
              <p className="mt-1 text-gray-900">{book.publishedYear}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total de Copias</label>
              <p className="mt-1 text-gray-900">{book.totalCopies}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Copias Disponibles</label>
              <p className="mt-1 text-gray-900">{book.availableCopies}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Estado de Disponibilidad</h3>
              <p className="text-sm text-gray-600 mt-1">
                {book.availableCopies > 0 
                  ? `${book.availableCopies} de ${book.totalCopies} copias disponibles para préstamo`
                  : `No hay copias disponibles. ${book.totalCopies} copias en total.`
                }
              </p>
            </div>
            
            <div className="flex-shrink-0">
              {book.availableCopies > 0 ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Disponible
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  No disponible
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cerrar
          </button>
          
          {canReturn && onReturn && (
            <button
              onClick={() => {
                onReturn();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Devolver Libro
            </button>
          )}
          
          {canBorrow && onBorrow && (
            <button
              onClick={() => {
                onBorrow();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Pedir Prestado
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};