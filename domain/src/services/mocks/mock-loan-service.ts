import type { LoanService, CreateLoanData, LoanSearchCriteria } from "../loan-service.js";
import type { Loan, LoanStatus } from "../../entities/loan.js";

export class MockLoanService implements LoanService {
  private loans: Loan[] = [];

  constructor(initialLoans: Loan[] = []) {
    this.loans = [...initialLoans];
  }

  async findById(id: string): Promise<Loan | undefined> {
    return this.loans.find(loan => loan.id === id);
  }

  async findAll(): Promise<Loan[]> {
    return [...this.loans];
  }

  async findByUser(userId: string): Promise<Loan[]> {
    return this.loans.filter(loan => loan.userId === userId);
  }

  async findByBook(bookId: string): Promise<Loan[]> {
    return this.loans.filter(loan => loan.bookId === bookId);
  }

  async findByStatus(status: LoanStatus): Promise<Loan[]> {
    return this.loans.filter(loan => loan.status === status);
  }

  async findOverdue(): Promise<Loan[]> {
    const now = new Date();
    return this.loans.filter(loan => 
      loan.status === 'active' && loan.dueDate < now
    );
  }

  async search(criteria: LoanSearchCriteria): Promise<Loan[]> {
    return this.loans.filter(loan => {
      if (criteria.userId && loan.userId !== criteria.userId) {
        return false;
      }
      if (criteria.bookId && loan.bookId !== criteria.bookId) {
        return false;
      }
      if (criteria.status && loan.status !== criteria.status) {
        return false;
      }
      if (criteria.overdue) {
        const now = new Date();
        const isOverdue = loan.status === 'active' && loan.dueDate < now;
        if (!isOverdue) return false;
      }
      return true;
    });
  }

  async create(loanData: CreateLoanData): Promise<Loan> {
    const newLoan: Loan = {
      id: `loan_${Date.now()}_${Math.random()}`,
      userId: loanData.userId,
      bookId: loanData.bookId,
      loanDate: new Date(),
      dueDate: loanData.dueDate,
      status: 'active' as LoanStatus,
      renewalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.loans.push(newLoan);
    return newLoan;
  }

  async returnBook(loanId: string, returnDate: Date): Promise<Loan | undefined> {
    const loanIndex = this.loans.findIndex(loan => loan.id === loanId);
    
    if (loanIndex === -1) {
      return undefined;
    }

    const updatedLoan: Loan = {
      ...this.loans[loanIndex]!,
      returnDate,
      status: 'returned' as LoanStatus,
      updatedAt: new Date()
    };

    this.loans[loanIndex] = updatedLoan;
    return updatedLoan;
  }

  async renewLoan(loanId: string, newDueDate: Date): Promise<Loan | undefined> {
    const loanIndex = this.loans.findIndex(loan => loan.id === loanId);
    
    if (loanIndex === -1) {
      return undefined;
    }

    const loan = this.loans[loanIndex]!;
    if (loan.status !== 'active') {
      return undefined;
    }

    const updatedLoan: Loan = {
      ...loan,
      dueDate: newDueDate,
      renewalCount: loan.renewalCount + 1,
      updatedAt: new Date()
    };

    this.loans[loanIndex] = updatedLoan;
    return updatedLoan;
  }

  async markOverdue(loanId: string): Promise<Loan | undefined> {
    const loanIndex = this.loans.findIndex(loan => loan.id === loanId);
    
    if (loanIndex === -1) {
      return undefined;
    }

    const updatedLoan: Loan = {
      ...this.loans[loanIndex]!,
      status: 'overdue' as LoanStatus,
      updatedAt: new Date()
    };

    this.loans[loanIndex] = updatedLoan;
    return updatedLoan;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.loans.length;
    this.loans = this.loans.filter(loan => loan.id !== id);
    return this.loans.length < initialLength;
  }

  async getActiveLoanForBook(bookId: string): Promise<Loan | undefined> {
    return this.loans.find(loan => 
      loan.bookId === bookId && loan.status === 'active'
    );
  }

  async getUserActiveLoans(userId: string): Promise<Loan[]> {
    return this.loans.filter(loan => 
      loan.userId === userId && loan.status === 'active'
    );
  }

  addLoan(loan: Loan): void {
    this.loans.push(loan);
  }

  getLoans(): Loan[] {
    return [...this.loans];
  }

  clearLoans(): void {
    this.loans = [];
  }
}