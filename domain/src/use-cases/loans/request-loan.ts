import type { BookService } from "../../services/book-service.js";
import type { UserService } from "../../services/user-service.js";
import type { EmailService } from "../../services/email-service.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";

export interface RequestLoanDeps {
  bookService: BookService;
  userService: UserService;
  emailService: EmailService;
}

export interface RequestLoanPayload {
  userId: string;
  bookId: string;
  requestingUserRole: UserRole;
  requestingUserId?: string;
}

export async function requestLoan(
  deps: RequestLoanDeps,
  payload: RequestLoanPayload
) {
  if (!payload.userId || !payload.bookId) {
    return {
      success: false,
      error: "User ID and Book ID are required"
    };
  }

  // Get user information
  const user = await deps.userService.findById(payload.userId);
  if (!user) {
    return {
      success: false,
      error: "User not found"
    };
  }

  // Authorization check
  if (payload.requestingUserRole === UserRole.MEMBER) {
    if (!payload.requestingUserId || payload.requestingUserId !== payload.userId) {
      return {
        success: false,
        error: "Members can only request loans for themselves"
      };
    }
  }

  // Get book information
  const book = await deps.bookService.findById(payload.bookId);
  if (!book) {
    return {
      success: false,
      error: "Book not found"
    };
  }

  // Check if book is available for loan request
  if (book.status === BookStatus.MAINTENANCE) {
    return {
      success: false,
      error: "Book is currently under maintenance and cannot be requested"
    };
  }

  try {
    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();
    
    // Send email to librarian
    const emailSent = await deps.emailService.sendLoanRequestEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      book.title,
      book.author,
      confirmationToken
    );

    if (!emailSent) {
      return {
        success: false,
        error: "Failed to send loan request email"
      };
    }

    return {
      success: true,
      message: "Loan request sent successfully. The librarian will review your request and contact you soon.",
      data: {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        },
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn
        },
        requestDate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Request loan error:', error);
    return {
      success: false,
      error: "Failed to process loan request"
    };
  }
}