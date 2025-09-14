import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { MockLoanService } from "../../services/mocks/mock-loan-service.js";
import { deleteBook, type DeleteBookDeps } from "./delete-book.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";
import type { Book } from "../../entities/book.js";

describe("deleteBook", () => {
  let deps: DeleteBookDeps;
  let mockBookService: MockBookService;
  let mockLoanService: MockLoanService;
  let mockBook: Book;

  beforeEach(() => {
    mockBookService = new MockBookService();
    mockLoanService = new MockLoanService();
    deps = {
      bookService: mockBookService,
      loanService: mockLoanService
    };

    mockBook = {
      id: "1",
      title: "Test Book",
      author: "Test Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 3,
      availableCopies: 3,
      status: BookStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockBookService as any).books = [mockBook];
    (mockLoanService as any).loans = [];
  });

  it("should successfully delete a book as librarian", async () => {
    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Book deleted successfully");
    
    const deletedBook = await deps.bookService.findById("1");
    expect(deletedBook).toBeUndefined();
  });

  it("should successfully delete a book as admin", async () => {
    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.ADMIN
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Book deleted successfully");
  });

  it("should fail when user is not librarian or admin", async () => {
    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.MEMBER
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only librarians and admins can delete books");
  });

  it("should fail when book does not exist", async () => {
    const result = await deleteBook(deps, {
      bookId: "999",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Book not found");
  });

  it("should fail when book has active loans", async () => {
    const activeLoan = {
      id: "1",
      bookId: "1",
      userId: "1",
      loanDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "active" as const,
      renewalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockLoanService as any).loans = [activeLoan];

    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Cannot delete book with active loans. Please ensure the book is returned first.");
  });

  it("should successfully delete book when all loans are returned", async () => {
    const returnedLoan = {
      id: "1",
      bookId: "1",
      userId: "1",
      loanDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "returned" as const,
      renewalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockLoanService as any).loans = [returnedLoan];

    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Book deleted successfully");
  });

  it("should handle service errors gracefully", async () => {
    mockBookService.delete = async () => {
      throw new Error("Database error");
    };

    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to delete book");
  });

  it("should handle loan service errors gracefully and continue with deletion", async () => {
    mockLoanService.getActiveLoanForBook = async () => {
      throw new Error("Loan service error");
    };

    const result = await deleteBook(deps, {
      bookId: "1",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Book deleted successfully");
  });
});