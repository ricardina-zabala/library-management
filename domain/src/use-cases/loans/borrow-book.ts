import type { BookService } from "../../services/book-service.js";
import type { LoanService, CreateLoanData } from "../../services/loan-service.js";
import type { UserService } from "../../services/user-service.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";

export interface BorrowBookDeps {
  bookService: BookService;
  loanService: LoanService;
  userService: UserService;
}

export interface BorrowBookPayload {
  userId: string;
  bookId: string;
  requestingUserRole: UserRole;
  requestingUserId?: string;
  loanDurationDays?: number;
}

export async function borrowBook(
  deps: BorrowBookDeps,
  payload: BorrowBookPayload
) {
  if (!payload.userId || !payload.bookId) {
    return {
      success: false,
      error: "User ID and Book ID are required"
    };
  }

  const loanDurationDays = payload.loanDurationDays || 14;

  const user = await deps.userService.findById(payload.userId);
  if (!user) {
    return {
      success: false,
      error: "User not found"
    };
  }

  if (payload.requestingUserRole === UserRole.MEMBER) {
    if (!payload.requestingUserId || payload.requestingUserId !== payload.userId) {
      return {
        success: false,
        error: "Members can only borrow books for themselves"
      };
    }
  }

  const book = await deps.bookService.findById(payload.bookId);
  if (!book) {
    return {
      success: false,
      error: "Book not found"
    };
  }

  if (book.availableCopies <= 0 || book.status !== BookStatus.AVAILABLE) {
    return {
      success: false,
      error: "Book is not available for borrowing"
    };
  }

  const existingLoan = await deps.loanService.getActiveLoanForBook(payload.bookId);
  if (existingLoan && book.availableCopies <= 1) {
    return {
      success: false,
      error: "Book is currently borrowed"
    };
  }

  const userActiveLoans = await deps.loanService.getUserActiveLoans(payload.userId);
  const maxLoans = user.role === UserRole.LIBRARIAN || user.role === UserRole.ADMIN ? 10 : 5;
  
  if (userActiveLoans.length >= maxLoans) {
    return {
      success: false,
      error: `User has reached maximum loan limit (${maxLoans})`
    };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanDurationDays);

  const createLoanData: CreateLoanData = {
    userId: payload.userId,
    bookId: payload.bookId,
    dueDate
  };

  const loan = await deps.loanService.create(createLoanData);

  await deps.bookService.updateAvailableCopies(payload.bookId, -1);

  return {
    success: true,
    loan,
    dueDate
  };
}