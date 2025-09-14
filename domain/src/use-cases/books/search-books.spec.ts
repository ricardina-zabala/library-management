import { describe, it, expect, beforeEach } from "vitest";
import { MockBookService } from "../../services/mocks/mock-book-service.js";
import { searchBooks, type SearchBooksDeps } from "./search-books.js";
import { BookStatus } from "../../entities/book.js";
import type { Book } from "../../entities/book.js";

describe("searchBooks", () => {
  let deps: SearchBooksDeps;
  let mockBookService: MockBookService;
  let mockBooks: Book[];

  beforeEach(() => {
    mockBookService = new MockBookService();
    deps = {
      bookService: mockBookService
    };

    mockBooks = [
      {
        id: "1",
        title: "JavaScript Guide",
        author: "John Doe",
        isbn: "123456789",
        category: "Programming",
        publishedYear: 2023,
        totalCopies: 3,
        availableCopies: 2,
        status: BookStatus.AVAILABLE,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        title: "Python Basics",
        author: "Jane Smith",
        isbn: "987654321",
        category: "Programming",
        publishedYear: 2022,
        totalCopies: 2,
        availableCopies: 0,
        status: BookStatus.BORROWED,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3",
        title: "History of Art",
        author: "Bob Johnson",
        isbn: "555666777",
        category: "Art",
        publishedYear: 2021,
        totalCopies: 1,
        availableCopies: 1,
        status: BookStatus.AVAILABLE,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "4",
        title: "Data Structures",
        author: "Alice Brown",
        isbn: "111222333",
        category: "Programming",
        publishedYear: 2024,
        totalCopies: 2,
        availableCopies: 1,
        status: BookStatus.RESERVED,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    (mockBookService as any).books = mockBooks;
  });

  it("should return all books when no search criteria provided", async () => {
    const result = await searchBooks(deps, {});

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(4);
    expect(result.books).toEqual(mockBooks);
  });

  it("should return only available books when availableOnly is true", async () => {
    const result = await searchBooks(deps, { availableOnly: true });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(2);
    expect(result.books?.every(book => book.status === BookStatus.AVAILABLE)).toBe(true);
  });

  it("should search by general query", async () => {
    const result = await searchBooks(deps, { query: "JavaScript" });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.title).toBe("JavaScript Guide");
  });

  it("should search by title", async () => {
    const result = await searchBooks(deps, { title: "Python Basics" });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.title).toBe("Python Basics");
  });

  it("should search by author", async () => {
    const result = await searchBooks(deps, { author: "Jane Smith" });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.author).toBe("Jane Smith");
  });

  it("should search by ISBN", async () => {
    const result = await searchBooks(deps, { isbn: "555666777" });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.isbn).toBe("555666777");
  });

  it("should search by category", async () => {
    const result = await searchBooks(deps, { category: "Programming" });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(3);
    expect(result.books?.every(book => book.category === "Programming")).toBe(true);
  });

  it("should search by status", async () => {
    const result = await searchBooks(deps, { status: BookStatus.BORROWED });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.status).toBe(BookStatus.BORROWED);
  });

  it("should combine multiple search criteria", async () => {
    const result = await searchBooks(deps, { 
      category: "Programming",
      status: BookStatus.AVAILABLE
    });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.title).toBe("JavaScript Guide");
    expect(result.books && result.books[0]?.category).toBe("Programming");
    expect(result.books && result.books[0]?.status).toBe(BookStatus.AVAILABLE);
  });

  it("should respect limit parameter", async () => {
    const result = await searchBooks(deps, { 
      category: "Programming",
      limit: 2
    });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(2);
  });

  it("should respect offset parameter", async () => {
    const result = await searchBooks(deps, { 
      category: "Programming",
      offset: 1,
      limit: 2
    });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(2);
  });

  it("should trim whitespace from search terms", async () => {
    const result = await searchBooks(deps, { 
      title: "  JavaScript Guide  ",
      author: "  John Doe  ",
      category: "  Programming  "
    });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(1);
    expect(result.books && result.books[0]?.title).toBe("JavaScript Guide");
  });

  it("should return empty array when no books match criteria", async () => {
    const result = await searchBooks(deps, { title: "Non-existent Book" });

    expect(result.success).toBe(true);
    expect(result.books).toHaveLength(0);
  });

  it("should prioritize availableOnly over other status criteria", async () => {
    const result = await searchBooks(deps, { 
      status: BookStatus.BORROWED,
      availableOnly: true
    });

    expect(result.success).toBe(true);
    expect(result.books?.every(book => book.status === BookStatus.AVAILABLE)).toBe(true);
  });
});