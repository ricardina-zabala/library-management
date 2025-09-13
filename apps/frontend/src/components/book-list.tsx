import type { Book } from 'app-domain';
import { BookCard } from './book-card.js';

export interface BookListProps {
  books: Book[];
  onBorrow?: (bookId: string) => void;
  onReturn?: (bookId: string) => void;
  onDetails?: (bookId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const BookList = ({ 
  books, 
  onBorrow, 
  onReturn, 
  onDetails,
  loading = false,
  emptyMessage = "No books found"
}: BookListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {books.map((book) => {
        const cardProps: any = { book };
        if (onBorrow) cardProps.onBorrow = () => onBorrow(book.id);
        if (onReturn) cardProps.onReturn = () => onReturn(book.id);
        if (onDetails) cardProps.onDetails = () => onDetails(book.id);
        
        return <BookCard key={book.id} {...cardProps} />;
      })}
    </div>
  );
};