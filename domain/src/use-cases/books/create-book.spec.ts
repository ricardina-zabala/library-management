import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { createBook, type CreateBookDeps } from "./create-book.js";
import { UserRole } from "../../entities/user.js";
import { BookStatus } from "../../entities/book.js";

describe("createBook", () => {
  let deps: CreateBookDeps;
  let mockBookService: MockBookService;

  beforeEach(() => {
    mockBookService = new MockBookService();
    deps = {
      bookService: mockBookService
    };

    (mockBookService as any).books = [];
  });

  it("should successfully create a book as librarian", async () => {
    const result = await createBook(deps, {
      title: "Test Book",
      author: "Test Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 5,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.book).toBeDefined();
    expect(result.book?.title).toBe("Test Book");
    expect(result.book?.author).toBe("Test Author");
    expect(result.book?.isbn).toBe("123456789");
    expect(result.book?.totalCopies).toBe(5);
    expect(result.book?.availableCopies).toBe(5);
    expect(result.book?.status).toBe(BookStatus.AVAILABLE);
  });

  it("should successfully create a book as admin", async () => {
    const result = await createBook(deps, {
      title: "Admin Book",
      author: "Admin Author",
      isbn: "987654321",
      category: "Non-Fiction",
      publishedYear: 2024,
      totalCopies: 3,
      userRole: UserRole.ADMIN
    });

    expect(result.success).toBe(true);
    expect(result.book).toBeDefined();
    expect(result.book?.title).toBe("Admin Book");
  });

  it("should fail when user is not librarian or admin", async () => {
    const result = await createBook(deps, {
      title: "Test Book",
      author: "Test Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 5,
      userRole: UserRole.MEMBER
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only librarians and admins can create books");
  });

  it("should fail when title is missing", async () => {
    const result = await createBook(deps, {
      title: "",
      author: "Test Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 5,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Title, author, ISBN, and category are required");
  });

  it("should fail when author is missing", async () => {
    const result = await createBook(deps, {
      title: "Test Book",
      author: "",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 5,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Title, author, ISBN, and category are required");
  });

  it("should fail when ISBN is missing", async () => {
    const result = await createBook(deps, {
      title: "Test Book",
      author: "Test Author",
      isbn: "",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 5,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Title, author, ISBN, and category are required");
  });

  it("should fail when category is missing", async () => {
    const result = await createBook(deps, {
      title: "Test Book",
      author: "Test Author",
      isbn: "123456789",
      category: "",
      publishedYear: 2023,
      totalCopies: 5,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Title, author, ISBN, and category are required");
  });

  it("should fail when published year is too old", async () => {
    const result = await createBook(deps, {
      title: "Ancient Book",
      author: "Ancient Author",
      isbn: "123456789",
      category: "History",
      publishedYear: 999,
      totalCopies: 1,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid published year");
  });

  it("should fail when published year is in the future", async () => {
    const futureYear = new Date().getFullYear() + 1;
    const result = await createBook(deps, {
      title: "Future Book",
      author: "Future Author",
      isbn: "123456789",
      category: "Sci-Fi",
      publishedYear: futureYear,
      totalCopies: 1,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid published year");
  });

  it("should fail when total copies is less than 1", async () => {
    const result = await createBook(deps, {
      title: "Test Book",
      author: "Test Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 0,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Total copies must be at least 1");
  });

  it("should fail when book with ISBN already exists", async () => {
    await createBook(deps, {
      title: "First Book",
      author: "First Author",
      isbn: "123456789",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 1,
      userRole: UserRole.LIBRARIAN
    });

    const result = await createBook(deps, {
      title: "Second Book",
      author: "Second Author",
      isbn: "123456789",
      category: "Non-Fiction",
      publishedYear: 2024,
      totalCopies: 1,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("A book with this ISBN already exists");
  });

  it("should trim whitespace from string fields", async () => {
    const result = await createBook(deps, {
      title: "  Test Book  ",
      author: "  Test Author  ",
      isbn: "  123456789  ",
      category: "  Fiction  ",
      publishedYear: 2023,
      totalCopies: 1,
      userRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.book?.title).toBe("Test Book");
    expect(result.book?.author).toBe("Test Author");
    expect(result.book?.isbn).toBe("123456789");
    expect(result.book?.category).toBe("Fiction");
  });
});