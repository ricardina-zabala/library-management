import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { MockLoanService } from "../../services/mocks/mock-loan-service.js";
import type { Book } from "../../entities/book.js";
import type { Loan } from "../../entities/loan.js";
import { returnBook, type ReturnBookDeps } from "./return-book.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";
import { LoanStatus } from "../../entities/loan.js";

describe("returnBook", () => {
  let deps: ReturnBookDeps;
  let mockLoan: Loan;
  let mockBook: Book;

  beforeEach(async () => {

    deps = {
      bookService: new MockBookService(),
      loanService: new MockLoanService()
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    mockLoan = {
      id: "1",
      userId: "1",
      bookId: "1",
      loanDate: yesterday,
      dueDate: nextWeek,
      status: LoanStatus.ACTIVE,
      renewalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockBook = {
      id: "1",
      title: "Test Book",
      author: "Test Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 3,
      availableCopies: 2,
      status: BookStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (deps.loanService as any).loans = [mockLoan];
    (deps.bookService as any).books = [mockBook];
  });

  it("should successfully return a book", async () => {
    const result = await returnBook(deps, {
      loanId: "1",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.loan).toBeDefined();
    expect(result.returnDate).toBeDefined();
    expect(result.wasOverdue).toBe(false);
    expect(result.daysOverdue).toBe(0);

    const updatedBook = await deps.bookService.findById("1");
    expect(updatedBook?.availableCopies).toBe(3);
  });

  it("should fail when loan ID is missing", async () => {
    const result = await returnBook(deps, {
      loanId: "",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Loan ID is required");
  });

  it("should fail when loan not found", async () => {
    const result = await returnBook(deps, {
      loanId: "999",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Loan not found");
  });

  it("should fail when loan is not active", async () => {
    const returnedLoan: Loan = {
      ...mockLoan,
      id: "2",
      status: LoanStatus.RETURNED
    };
    (deps.loanService as any).loans.push(returnedLoan);

    const result = await returnBook(deps, {
      loanId: "2",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Loan is not active");
  });

  it("should fail when member tries to return another user's book", async () => {
    const result = await returnBook(deps, {
      loanId: "1",
      requestingUserRole: UserRole.MEMBER,
      requestingUserId: "2"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Members can only return their own books");
  });

  it("should allow member to return their own book", async () => {
    const result = await returnBook(deps, {
      loanId: "1",
      requestingUserRole: UserRole.MEMBER,
      requestingUserId: "1"
    });

    expect(result.success).toBe(true);
    expect(result.loan).toBeDefined();
  });

  it("should detect overdue books", async () => {
    const overdueLoan: Loan = {
      ...mockLoan,
      id: "2",
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    };
    (deps.loanService as any).loans.push(overdueLoan);

    const result = await returnBook(deps, {
      loanId: "2",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.wasOverdue).toBe(true);
    expect(result.daysOverdue).toBeGreaterThan(0);
  });
});