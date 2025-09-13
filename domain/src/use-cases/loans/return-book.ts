import type { BookService } from "../../services/book-service.js";
import type { LoanService } from "../../services/loan-service.js";
import { UserRole } from "../../entities/user.js";
import { LoanStatus } from "../../entities/loan.js";

export interface ReturnBookDeps {
  bookService: BookService;
  loanService: LoanService;
}

export interface ReturnBookPayload {
  loanId: string;
  requestingUserRole: UserRole;
  requestingUserId?: string;
}

export async function returnBook(
  deps: ReturnBookDeps,
  payload: ReturnBookPayload
) {
  if (!payload.loanId) {
    return {
      success: false,
      error: "Loan ID is required"
    };
  }

  const loan = await deps.loanService.findById(payload.loanId);
  if (!loan) {
    return {
      success: false,
      error: "Loan not found"
    };
  }

  if (loan.status !== LoanStatus.ACTIVE) {
    return {
      success: false,
      error: "Loan is not active"
    };
  }

  if (payload.requestingUserRole === UserRole.MEMBER) {
    if (!payload.requestingUserId || loan.userId !== payload.requestingUserId) {
      return {
        success: false,
        error: "Members can only return their own books"
      };
    }
  }

  const returnDate = new Date();
  const wasOverdue = returnDate > loan.dueDate;

  const updatedLoan = await deps.loanService.returnBook(payload.loanId, returnDate);

  await deps.bookService.updateAvailableCopies(loan.bookId, 1);

  return {
    success: true,
    loan: updatedLoan,
    returnDate,
    wasOverdue,
    daysOverdue: wasOverdue ? 
      Math.ceil((returnDate.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
  };
}