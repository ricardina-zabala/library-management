import type { Loan, LoanStatus } from "../entities/loan.js";

export interface CreateLoanData {
  userId: string;
  bookId: string;
  dueDate: Date;
}

export interface LoanSearchCriteria {
  userId?: string;
  bookId?: string;
  status?: LoanStatus;
  overdue?: boolean;
}

export interface LoanWithBook extends Loan {
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
  };
}

export interface LoanService {
  findById: (id: string) => Promise<Loan | undefined>;
  findAll: () => Promise<Loan[]>;
  findByUser: (userId: string) => Promise<Loan[]>;
  findByBook: (bookId: string) => Promise<Loan[]>;
  findByStatus: (status: LoanStatus) => Promise<Loan[]>;
  findOverdue: () => Promise<Loan[]>;
  search: (criteria: LoanSearchCriteria) => Promise<Loan[]>;
  create: (loanData: CreateLoanData) => Promise<Loan>;
  returnBook: (loanId: string, returnDate: Date) => Promise<Loan | undefined>;
  renewLoan: (loanId: string, newDueDate: Date) => Promise<Loan | undefined>;
  markOverdue: (loanId: string) => Promise<Loan | undefined>;
  delete: (id: string) => Promise<boolean>;
  getActiveLoanForBook: (bookId: string) => Promise<Loan | undefined>;
  getUserActiveLoans: (userId: string) => Promise<Loan[]>;
  getUserLoansWithBookInfo: (userId: string) => Promise<LoanWithBook[]>;
}