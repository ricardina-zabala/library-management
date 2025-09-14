import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { getBook, type GetBookDeps } from "./get-book.js";
import { BookStatus } from "../../entities/book.js";
import type { Book } from "../../entities/book.js";

describe("getBook", () => {
  let deps: GetBookDeps;
  let mockBookService: MockBookService;
  let mockBook: Book;

  beforeEach(() => {
    mockBookService = new MockBookService();
    deps = {
      bookService: mockBookService
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

    (mockBookService as any).books = [mockBook];
  });

  it("should successfully get a book by ID", async () => {
    const result = await getBook(deps, { id: "1" });

    expect(result.success).toBe(true);
    expect(result.book).toBeDefined();
    expect(result.book?.id).toBe("1");
    expect(result.book?.title).toBe("Test Book");
    expect(result.book?.author).toBe("Test Author");
    expect(result.book?.isbn).toBe("123456789");
    expect(result.book?.category).toBe("Fiction");
    expect(result.book?.publishedYear).toBe(2023);
    expect(result.book?.totalCopies).toBe(3);
    expect(result.book?.availableCopies).toBe(2);
    expect(result.book?.status).toBe(BookStatus.AVAILABLE);
  });

  it("should fail when book ID is missing", async () => {
    const result = await getBook(deps, { id: "" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Book ID is required");
  });

  it("should fail when book does not exist", async () => {
    const result = await getBook(deps, { id: "999" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Book not found");
  });

  it("should return correct book when multiple books exist", async () => {
    const secondBook: Book = {
      id: "2",
      title: "Another Book",
      author: "Another Author",
      isbn: "987654321",
      category: "Non-Fiction",
      publishedYear: 2024,
      totalCopies: 1,
      availableCopies: 1,
      status: BookStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockBookService as any).books = [mockBook, secondBook];

    const result = await getBook(deps, { id: "2" });

    expect(result.success).toBe(true);
    expect(result.book?.id).toBe("2");
    expect(result.book?.title).toBe("Another Book");
    expect(result.book?.author).toBe("Another Author");
  });

  it("should return book with borrowed status", async () => {
    const borrowedBook: Book = {
      id: "3",
      title: "Borrowed Book",
      author: "Test Author",
      isbn: "111222333",
      category: "Fiction",
      publishedYear: 2023,
      totalCopies: 1,
      availableCopies: 0,
      status: BookStatus.BORROWED,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockBookService as any).books = [borrowedBook];

    const result = await getBook(deps, { id: "3" });

    expect(result.success).toBe(true);
    expect(result.book?.status).toBe(BookStatus.BORROWED);
    expect(result.book?.availableCopies).toBe(0);
  });
});