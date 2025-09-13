export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue'
}

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: LoanStatus;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
}