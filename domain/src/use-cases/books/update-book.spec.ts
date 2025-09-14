import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { updateBook, type UpdateBookDeps } from "./update-book.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";
import type { Book } from "../../entities/book.js";

describe("updateBook", () => {
  let deps: UpdateBookDeps;
  let mockBookService: MockBookService;
  let mockBook: Book;

  beforeEach(() => {
    mockBookService = new MockBookService();
    deps = {
      bookService: mockBookService
    };

    mockBook = {
      id: "1",
      title: "Original Title",
      author: "Original Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 3,
      availableCopies: 2,
      status: BookStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockBookService as any).books = [mockBook];
  });

  it("should successfully update book as librarian", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      title: "Updated Title",
      author: "Updated Author",
      category: "Updated Category",
      publishedYear: 2024,
      totalCopies: 5,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.book).toBeDefined();
    expect(result.book?.title).toBe("Updated Title");
    expect(result.book?.author).toBe("Updated Author");
    expect(result.book?.category).toBe("Updated Category");
    expect(result.book?.publishedYear).toBe(2024);
    expect(result.book?.totalCopies).toBe(5);
  });

  it("should successfully update book as admin", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      title: "Admin Updated Title",
      userRole: UserRole.ADMIN
    });

    expect(result.success).toBe(true);
    expect(result.book?.title).toBe("Admin Updated Title");
  });

  it("should fail when user is not librarian or admin", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      title: "Updated Title",
      userRole: UserRole.MEMBER
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only librarians and admins can update books");
  });

  it("should fail when book does not exist", async () => {
    const result = await updateBook(deps, {
      bookId: "999",
      title: "Updated Title",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Book not found");
  });

  it("should fail when published year is too old", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      publishedYear: 999,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid published year");
  });

  it("should fail when published year is in the future", async () => {
    const futureYear = new Date().getFullYear() + 1;
    const result = await updateBook(deps, {
      bookId: "1",
      publishedYear: futureYear,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid published year");
  });

  it("should fail when total copies is less than 1", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      totalCopies: 0,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Total copies must be at least 1");
  });

  it("should fail when title is empty", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      title: "   ",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Title cannot be empty");
  });

  it("should fail when author is empty", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      author: "   ",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Author cannot be empty");
  });

  it("should fail when category is empty", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      category: "   ",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Category cannot be empty");
  });

  it("should update only specified fields", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      title: "Only Title Updated",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.book?.title).toBe("Only Title Updated");
    expect(result.book?.author).toBe("Original Author");
    expect(result.book?.category).toBe("Fiction");
  });

  it("should trim whitespace from string fields", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      title: "  Trimmed Title  ",
      author: "  Trimmed Author  ",
      category: "  Trimmed Category  ",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.book?.title).toBe("Trimmed Title");
    expect(result.book?.author).toBe("Trimmed Author");
    expect(result.book?.category).toBe("Trimmed Category");
  });

  it("should handle service errors gracefully", async () => {
    mockBookService.update = async () => {
      throw new Error("Database error");
    };

    const result = await updateBook(deps, {
      bookId: "1",
      title: "Updated Title",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update book");
  });

  it("should handle when update returns null", async () => {
    mockBookService.update = async () => undefined;

    const result = await updateBook(deps, {
      bookId: "1",
      title: "Updated Title",
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update book");
  });

  it("should allow updating total copies to increase available copies", async () => {
    const result = await updateBook(deps, {
      bookId: "1",
      totalCopies: 10,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.book?.totalCopies).toBe(10);
  });
});