import { useEffect, useState } from 'react';
import { BookList } from '../components/book-list.js';
import { SearchFilters } from '../components/search-filters.js';
import { BookDetailModal } from '../components/book-detail-modal.js';
import { useBooks } from '../hooks/useBooks.js';
import { useLoans } from '../hooks/useLoans.js';
import { useAuth } from '../hooks/useAuth.js';
import { BookStatus } from 'app-domain';
import type { Book } from 'app-domain';

export const BooksPage = () => {
  const { books, loading, error, searchBooks, getBook } = useBooks();
  const { borrowBook, returnBookByBookId } = useLoans();
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    searchBooks();
  }, [searchBooks]);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(books.map(book => book.category)));
    setCategories(uniqueCategories);
  }, [books]);

  const handleSearch = (query: string) => {
    searchBooks({ query });
  };

  const handleFilterByStatus = (status: BookStatus | 'all') => {
    if (status === 'all') {
      searchBooks();
    } else {
      searchBooks({ status });
    }
  };

  const handleFilterByCategory = (category: string) => {
    if (category === 'all') {
      searchBooks();
    } else {
      searchBooks({ category });
    }
  };

  const handleBorrowBook = async (bookId: string) => {
    if (!user) {
      alert('Please login to borrow books');
      return;
    }

    const response = await borrowBook({ bookId, userId: user.id });
    if (response.success) {
      searchBooks();
      alert('¡Libro prestado exitosamente!');
    } else {
      alert(response.error || 'Error al solicitar el préstamo del libro');
    }
  };

  const handleBookDetails = async (bookId: string) => {
    try {
      const response = await getBook(bookId);
      
      if (response.success && response.data) {
        const useCaseResponse = response.data as any;
        
        if (useCaseResponse.success && useCaseResponse.book) {
          setSelectedBook(useCaseResponse.book);
          setIsDetailModalOpen(true);
        } else {
          console.log(useCaseResponse.error || 'Error al obtener los detalles del libro');
        }
      } else {
        console.log(response.error || 'Error al obtener los detalles del libro');
      }
    } catch (error) {
      console.log('Error inesperado al obtener los detalles del libro');
    }
  };

  const handleReturnBook = async (bookId: string) => {
    if (!user) {
      alert('Please login to return books');  
      return;
    }

    const response = await returnBookByBookId(bookId, user.id);
    if (response.success) {
      searchBooks();
      alert('¡Libro devuelto exitosamente!');
    } else {
      alert(response.error || 'Error al devolver el libro');
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBook(null);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => searchBooks()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Libros</h1>
          <p className="text-gray-600">Explora y solicita libros prestados de nuestra colección</p>
        </div>

        <SearchFilters
          onSearch={handleSearch}
          onFilterByStatus={handleFilterByStatus}
          onFilterByCategory={handleFilterByCategory}
          categories={categories}
          placeholder="Buscar libros por título, autor o ISBN..."
        />

        <BookList
          books={books}
          loading={loading}
          onBorrow={handleBorrowBook}
          onReturn={handleReturnBook}
          onDetails={handleBookDetails}
          emptyMessage="No se encontraron libros. Intenta ajustar tus criterios de búsqueda."
        />

        <BookDetailModal
          book={selectedBook}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          onBorrow={selectedBook && selectedBook.status === BookStatus.AVAILABLE && selectedBook.availableCopies > 0 ? () => handleBorrowBook(selectedBook.id) : undefined}
          onReturn={selectedBook && selectedBook.status === BookStatus.BORROWED ? () => handleReturnBook(selectedBook.id) : undefined}
          canBorrow={selectedBook ? selectedBook.status === BookStatus.AVAILABLE && selectedBook.availableCopies > 0 : false}
          canReturn={selectedBook ? selectedBook.status === BookStatus.BORROWED : false}
        />
      </div>
    </div>
  );
};