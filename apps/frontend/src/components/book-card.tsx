import type { Book } from 'app-domain';
import { BookStatus } from 'app-domain';

export interface BookCardProps {
  book: Book;
  onBorrow?: () => void;
  onReturn?: () => void;
  onDetails?: () => void;
}

export const BookCard = ({ book, onBorrow, onReturn, onDetails }: BookCardProps) => {
  const getStatusStyles = (status: BookStatus) => {
    switch (status) {
      case BookStatus.AVAILABLE:
        return {
          badge: 'bg-green-100 text-green-800',
          border: 'border-l-green-500'
        };
      case BookStatus.BORROWED:
        return {
          badge: 'bg-yellow-100 text-yellow-800',
          border: 'border-l-yellow-500'
        };
      case BookStatus.RESERVED:
        return {
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-l-blue-500'
        };
      case BookStatus.MAINTENANCE:
        return {
          badge: 'bg-red-100 text-red-800',
          border: 'border-l-red-500'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          border: 'border-l-gray-500'
        };
    }
  };

  const statusStyles = getStatusStyles(book.status);
  const canBorrow = book.status === BookStatus.AVAILABLE && book.availableCopies > 0;
  const canReturn = book.status === BookStatus.BORROWED;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 m-2 shadow-md hover:shadow-lg transition-shadow duration-200 max-w-sm min-w-[280px] ${statusStyles.border} border-l-4`}>
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1" title={book.title}>
          {book.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase whitespace-nowrap ${statusStyles.badge}`}>
          {book.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="mb-4 space-y-2">
        <p className="text-gray-600 italic text-sm">by {book.author}</p>
        <p className="text-gray-500 text-xs">ISBN: {book.isbn}</p>
        <p className="text-gray-500 text-xs">{book.category}</p>
        <p className="text-gray-500 text-xs">Published: {book.publishedYear}</p>
        
        <div className="pt-2 mt-3 border-t border-gray-100">
          <span className="text-sm text-gray-600 font-medium">
            {book.availableCopies} of {book.totalCopies} available
          </span>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onDetails && (
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors duration-200"
            onClick={onDetails}
          >
            Details
          </button>
        )}
        
        {canBorrow && onBorrow && (
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
            onClick={onBorrow}
          >
            Borrow
          </button>
        )}
        
        {canReturn && onReturn && (
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
            onClick={onReturn}
          >
            Return
          </button>
        )}
      </div>
    </div>
  );
};