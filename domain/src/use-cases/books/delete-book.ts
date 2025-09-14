import type { BookService } from "../../services/book-service.js";
import type { LoanService } from "../../services/loan-service.js";
import { UserRole } from "../../entities/user.js";

export interface DeleteBookDeps {
  bookService: BookService;
  loanService: LoanService;
}

export interface DeleteBookPayload {
  bookId: string;
  userRole: UserRole;
}

export async function deleteBook(
  deps: DeleteBookDeps,
  payload: DeleteBookPayload
) {
  if (payload.userRole !== UserRole.LIBRARIAN && payload.userRole !== UserRole.ADMIN) {
    return {
      success: false,
      error: "Only librarians and admins can delete books"
    };
  }

  const existingBook = await deps.bookService.findById(payload.bookId);
  if (!existingBook) {
    return {
      success: false,
      error: "Book not found"
    };
  }

  try {
    const activeLoan = await deps.loanService.getActiveLoanForBook(payload.bookId);
    if (activeLoan) {
      return {
        success: false,
        error: "Cannot delete book with active loans. Please ensure the book is returned first."
      };
    }
  } catch (error) {
    console.warn("Could not check for active loans:", error);
  }

  try {
    const deleted = await deps.bookService.delete(payload.bookId);
    
    if (!deleted) {
      return {
        success: false,
        error: "Failed to delete book"
      };
    }

    return {
      success: true,
      message: "Book deleted successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete book"
    };
  }
}