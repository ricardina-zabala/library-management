import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { MockLoanService } from "../../services/mocks/mock-loan-service.js";
import type { Book } from "../../entities/book.js";
import type { User } from "../../entities/user.js";
import { borrowBook, type BorrowBookDeps } from "./borrow-book.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";
import { MockUserService } from "../../services/mocks/mock-user-service.js";

describe("borrowBook", () => {
  let deps: BorrowBookDeps;
  let mockUser: User;
  let mockBook: Book;

  beforeEach(async () => {
    deps = {
      bookService: new MockBookService(),
      loanService: new MockLoanService(),
      userService: new MockUserService()
    };

    mockUser = {
      id: "1",
      email: "user@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.MEMBER,
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

    (deps.userService as any).users = [mockUser];
    (deps.bookService as any).books = [mockBook];
    (deps.loanService as any).loans = [];
  });

  it("should successfully borrow a book", async () => {
    const result = await borrowBook(deps, {
      userId: "1",
      bookId: "1",
      requestingUserRole: UserRole.MEMBER,
      requestingUserId: "1",
      loanDurationDays: 14
    });

    expect(result.success).toBe(true);
    expect(result.loan).toBeDefined();
    expect(result.dueDate).toBeDefined();
    
    const updatedBook = await deps.bookService.findById("1");
    expect(updatedBook?.availableCopies).toBe(1);
  });

  it("should fail when user ID is missing", async () => {
    const result = await borrowBook(deps, {
      userId: "",
      bookId: "1",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User ID and Book ID are required");
  });

  it("should fail when book ID is missing", async () => {
    const result = await borrowBook(deps, {
      userId: "1",
      bookId: "",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User ID and Book ID are required");
  });

  it("should fail when user not found", async () => {
    const result = await borrowBook(deps, {
      userId: "999",
      bookId: "1",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User not found");
  });

  it("should fail when book not found", async () => {
    const result = await borrowBook(deps, {
      userId: "1",
      bookId: "999",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Book not found");
  });

  it("should fail when book is not available", async () => {
    const unavailableBook: Book = {
      ...mockBook,
      id: "2",
      availableCopies: 0
    };
    (deps.bookService as any).books.push(unavailableBook);

    const result = await borrowBook(deps, {
      userId: "1",
      bookId: "2",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Book is not available for borrowing");
  });

  it("should fail when member tries to borrow for another user", async () => {
    const anotherUser: User = {
      ...mockUser,
      id: "2",
      email: "another@example.com"
    };
    (deps.userService as any).users.push(anotherUser);

    const result = await borrowBook(deps, {
      userId: "2",
      bookId: "1",
      requestingUserRole: UserRole.MEMBER,
      requestingUserId: "1"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Members can only borrow books for themselves");
  });

  it("should allow librarian to borrow for another user", async () => {
    const librarian: User = {
      ...mockUser,
      id: "2",
      email: "librarian@example.com",
      firstName: "Librarian",
      lastName: "User",
      role: UserRole.LIBRARIAN
    };
    (deps.userService as any).users.push(librarian);

    const result = await borrowBook(deps, {
      userId: "1",
      bookId: "1",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.loan).toBeDefined();
  });
});