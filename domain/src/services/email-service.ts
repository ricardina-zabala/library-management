export interface EmailService {
  sendLoanRequestEmail: (
    userEmail: string, 
    userName: string, 
    bookTitle: string, 
    bookAuthor: string,
    confirmationToken: string
  ) => Promise<boolean>;
  sendLoanApprovalEmail: (
    userEmail: string, 
    userName: string, 
    bookTitle: string
  ) => Promise<boolean>;
  sendLoanRejectionEmail: (
    userEmail: string, 
    userName: string, 
    bookTitle: string,
    reason?: string
  ) => Promise<boolean>;
}