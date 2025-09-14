export enum LoanRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface LoanRequest {
  id: string;
  userId: string;
  bookId: string;
  status: LoanRequestStatus;
  requestDate: Date;
  reviewDate?: Date;
  reviewedBy?: string;
  dueDate?: Date;
  rejectionReason?: string;
  token: string; // Para acceso seguro del bibliotecario
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLoanRequestData {
  userId: string;
  bookId: string;
  token: string;
}