import { useState, useCallback } from 'react';
import type { Book, BookStatus } from 'app-domain';
import { UserRole } from 'app-domain';
import { api, type ApiResponse } from '../controller/api-controller.js';

interface SearchBooksPayload {
  query?: string;
  category?: string;
  status?: BookStatus;
  limit?: number;
  offset?: number;
}

interface CreateBookPayload {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
  userRole: UserRole;
}

interface UpdateBookPayload {
  bookId: string;
  title?: string;
  author?: string;
  category?: string;
  publishedYear?: number;
  totalCopies?: number;
  userRole: UserRole;
}

interface DeleteBookPayload {
  bookId: string;
  userRole: UserRole;
}

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = useCallback(async (payload: SearchBooksPayload = {}): Promise<ApiResponse<Book[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api('searchBooks', payload as unknown as Record<string, unknown>);
      
      console.log('searchBooks response:', response);
      
      if (response.success && response.data) {
        const useCaseResponse = response.data;
        if (useCaseResponse.success && useCaseResponse.books) {
          const booksData = Array.isArray(useCaseResponse.books) ? useCaseResponse.books : [];
          setBooks(booksData);
        } else {
          console.error('Search books failed:', useCaseResponse.error);
          setError(useCaseResponse.error || 'Failed to search books');
          setBooks([]);
        }
      } else {
        console.error('API call failed:', response.error);
        setError(response.error || 'Failed to search books');
        setBooks([]);
      }
      
      return response;
    } catch (error) {
      console.error('Search books error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search books';
      setError(errorMessage);
      setBooks([]);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getBook = useCallback(async (bookId: string): Promise<ApiResponse<Book>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api<Book>('getBook', { bookId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get book';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const createBook = useCallback(async (payload: CreateBookPayload): Promise<ApiResponse<Book>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api('createBook', payload as unknown as Record<string, unknown>);
      
      if (response.success && response.data) {
        const useCaseResponse = response.data;
        if (useCaseResponse.success && useCaseResponse.book) {
          setBooks(prev => [...prev, useCaseResponse.book]);
        } else {
          setError(useCaseResponse.error || 'Failed to create book');
        }
      } else {
        setError(response.error || 'Failed to create book');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create book';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBook = useCallback(async (payload: UpdateBookPayload): Promise<ApiResponse<Book>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api('updateBook', payload as unknown as Record<string, unknown>);
      
      if (response.success && response.data) {
        const useCaseResponse = response.data;
        if (useCaseResponse.success && useCaseResponse.book) {
          setBooks(prev => prev.map(book => 
            book.id === payload.bookId ? useCaseResponse.book : book
          ));
        } else {
          setError(useCaseResponse.error || 'Failed to update book');
        }
      } else {
        setError(response.error || 'Failed to update book');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update book';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBook = useCallback(async (payload: DeleteBookPayload): Promise<ApiResponse<void>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api('deleteBook', payload as unknown as Record<string, unknown>);
      
      if (response.success && response.data) {
        const useCaseResponse = response.data;
        if (useCaseResponse.success) {
          setBooks(prev => prev.filter(book => book.id !== payload.bookId));
        } else {
          setError(useCaseResponse.error || 'Failed to delete book');
        }
      } else {
        setError(response.error || 'Failed to delete book');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete book';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    books,
    loading,
    error,
    searchBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    clearError,
  };
};