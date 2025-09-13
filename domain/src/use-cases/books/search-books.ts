import type { BookService, BookSearchCriteria } from "../../services/book-service.js";
import { BookStatus } from "../../entities/book.js";

export interface SearchBooksDeps {
  bookService: BookService;
}

export interface SearchBooksPayload {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  availableOnly?: boolean;
}

export async function searchBooks(
  deps: SearchBooksDeps,
  payload: SearchBooksPayload
) {
  if (!payload.title && !payload.author && !payload.isbn && !payload.category) {
    if (payload.availableOnly) {
      const books = await deps.bookService.findAvailable();
      return {
        success: true,
        books
      };
    } else {
      const books = await deps.bookService.findAll();
      return {
        success: true,
        books
      };
    }
  }

  const criteria: BookSearchCriteria = {};
  
  if (payload.title) {
    criteria.title = payload.title.trim();
  }
  if (payload.author) {
    criteria.author = payload.author.trim();
  }
  if (payload.isbn) {
    criteria.isbn = payload.isbn.trim();
  }
  if (payload.category) {
    criteria.category = payload.category.trim();
  }
  if (payload.availableOnly) {
    criteria.status = BookStatus.AVAILABLE;
  }

  const books = await deps.bookService.search(criteria);

  return {
    success: true,
    books
  };
}