import { useState, useCallback } from 'react';
import type { Book, BookStatus } from 'app-domain';
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
}

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = useCallback(async (payload: SearchBooksPayload = {}): Promise<ApiResponse<Book[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api<Book[]>('searchBooks', payload as unknown as Record<string, unknown>);
      
      console.log('searchBooks response:', response);
      
      if (response.success && response.data) {
        const booksData = Array.isArray(response.data) ? response.data : [];
        setBooks(booksData);
      } else {
        console.error('Search books failed:', response.error);
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
      const response = await api<Book>('createBook', payload as unknown as Record<string, unknown>);
      
      if (response.success && response.data) {
        setBooks(prev => [...prev, response.data!]);
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
    clearError,
  };
};