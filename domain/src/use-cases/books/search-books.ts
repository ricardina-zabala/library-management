import type { BookService, BookSearchCriteria } from "../../services/book-service.js";
import { BookStatus } from "../../entities/book.js";

export interface SearchBooksDeps {
  bookService: BookService;
}

export interface SearchBooksPayload {
  query?: string;
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  status?: BookStatus;
  availableOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchBooks(
  deps: SearchBooksDeps,
  payload: SearchBooksPayload
) {
  const hasSearchCriteria = payload.query || payload.title || payload.author || payload.isbn || payload.category || payload.status;

  if (!hasSearchCriteria) {
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
  
  if (payload.query) {
    const query = payload.query.trim();
    criteria.query = query;
  }
  
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
  
  if (payload.status) {
    criteria.status = payload.status;
  } else if (payload.availableOnly) {
    criteria.status = BookStatus.AVAILABLE;
  }
  
  if (payload.limit) {
    criteria.limit = payload.limit;
  }
  if (payload.offset) {
    criteria.offset = payload.offset;
  }

  const books = await deps.bookService.search(criteria);

  return {
    success: true,
    books
  };
}