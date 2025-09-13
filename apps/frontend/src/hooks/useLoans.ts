import { useState, useCallback } from 'react';
import type { Loan } from 'app-domain';
import { api, type ApiResponse } from '../controller/api-controller.js';

interface BorrowBookPayload {
  bookId: string;
  userId: string;
}

interface ReturnBookPayload {
  loanId: string;
}

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserLoans = useCallback(async (userId: string): Promise<ApiResponse<Loan[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api<Loan[]>('getUserLoans', { userId });
      
      if (response.success && response.data) {
        setLoans(response.data);
      } else {
        setError(response.error || 'Failed to get user loans');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user loans';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const borrowBook = useCallback(async (payload: BorrowBookPayload): Promise<ApiResponse<Loan>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api<Loan>('borrowBook', payload as unknown as Record<string, unknown>);
      
      if (response.success && response.data) {
        setLoans(prev => [...prev, response.data!]);
      } else {
        setError(response.error || 'Failed to borrow book');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to borrow book';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const returnBook = useCallback(async (payload: ReturnBookPayload): Promise<ApiResponse<Loan>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api<Loan>('returnBook', payload as unknown as Record<string, unknown>);
      
      if (response.success && response.data) {
        setLoans(prev => prev.map(loan => 
          loan.id === response.data!.id ? response.data! : loan
        ));
      } else {
        setError(response.error || 'Failed to return book');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to return book';
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
    loans,
    loading,
    error,
    getUserLoans,
    borrowBook,
    returnBook,
    clearError,
  };
};