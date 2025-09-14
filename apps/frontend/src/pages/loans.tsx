import { useEffect, useState } from 'react';
import { useLoans } from '../hooks/useLoans.js';
import { useAuth } from '../hooks/useAuth.js';
import { useBooks } from '../hooks/useBooks.js';
import type { Loan } from 'app-domain';
import { LoanStatus } from 'app-domain';

export const LoansPage = () => {
  const { loans, loading, error, getUserLoans, returnBook } = useLoans();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getUserLoans(user.id);
    }
  }, [user, getUserLoans]);

  const handleReturnBook = async (loanId: string) => {
    const response = await returnBook({ loanId });
    if (response.success) {
      alert('Book returned successfully!');
      if (user) {
        getUserLoans(user.id);
      }
    } else {
      alert(response.error || 'Failed to return book');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Loans</h1>
          <p className="text-gray-600">Manage your borrowed books</p>
        </div>

        {Array.isArray(loans) && loans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg">You haven't borrowed any books yet.</p>
            <a
              href="/books"
              className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700"
            >
              Browse Books
            </a>
          </div>
        ) : Array.isArray(loans) && loans.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {loans.map((loan) => (
                <li key={loan.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Book ID: {loan.bookId}
                        </h3>
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
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                          {loan.status === LoanStatus.OVERDUE && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>Borrowed: {formatDate(loan.loanDate)}</span>
                        <span>Due: {formatDate(loan.dueDate)}</span>
                        {loan.returnDate && (
                          <span>Returned: {formatDate(loan.returnDate)}</span>
                        )}
                        <span>Renewals: {loan.renewalCount}</span>
                      </div>
                    </div>

                    {loan.status === LoanStatus.ACTIVE && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleReturnBook(loan.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
                        >
                          Return Book
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
            <p className="text-gray-500 text-lg">Unable to load loans data.</p>
            <button
              onClick={() => user && getUserLoans(user.id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};