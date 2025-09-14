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
        const loansData = Array.isArray(response.data) ? response.data : [];
        setLoans(loansData);
      } else {
        setError(response.error || 'Failed to get user loans');
        setLoans([]);
      }
      
      return response;
    } catch (error) {
      console.error('Get user loans error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user loans';
      setError(errorMessage);
      setLoans([]);
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
        setLoans(prev => Array.isArray(prev) ? [...prev, response.data!] : [response.data!]);
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
        const useCaseResponse = response.data as any;
        if (useCaseResponse.success && useCaseResponse.loan) {
          setLoans(prev => Array.isArray(prev) ? prev.map(loan => 
            loan.id === useCaseResponse.loan.id ? useCaseResponse.loan : loan
          ) : [useCaseResponse.loan]);
        } else {
          setError(useCaseResponse.error || 'Failed to return book');
        }
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

  const returnBookByBookId = useCallback(async (bookId: string, userId: string): Promise<ApiResponse<Loan>> => {
    setLoading(true);
    setError(null);

    try {
      const loansResponse = await getUserLoans(userId);
      if (loansResponse.success && loansResponse.data) {
        const userLoans = Array.isArray(loansResponse.data) ? loansResponse.data : [];
        const activeLoan = userLoans.find(loan => 
          loan.bookId === bookId && loan.status === 'active'
        );

        if (activeLoan) {
          return await returnBook({ loanId: activeLoan.id });
        } else {
          const errorMessage = 'No active loan found for this book';
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }
      } else {
        const errorMessage = loansResponse.error || 'Failed to get user loans';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
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
  }, [getUserLoans, returnBook]);

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
    returnBookByBookId,
    clearError,
  };
};