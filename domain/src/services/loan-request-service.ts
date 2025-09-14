import type { LoanRequest, LoanRequestStatus, CreateLoanRequestData } from "../entities/loan-request.js";

export interface LoanRequestService {
  findById: (id: string) => Promise<LoanRequest | undefined>;
  findByToken: (token: string) => Promise<LoanRequest | undefined>;
  findByUser: (userId: string) => Promise<LoanRequest[]>;
  findByStatus: (status: LoanRequestStatus) => Promise<LoanRequest[]>;
  findPending: () => Promise<LoanRequest[]>;
  create: (requestData: CreateLoanRequestData) => Promise<LoanRequest>;
  approve: (id: string, reviewedBy: string, dueDate?: Date) => Promise<LoanRequest | undefined>;
  reject: (id: string, reviewedBy: string, reason?: string) => Promise<LoanRequest | undefined>;
  delete: (id: string) => Promise<boolean>;
}