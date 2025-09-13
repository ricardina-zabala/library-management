import type { BookService } from "../../services/book-service.js";

export interface GetBookDeps {
  bookService: BookService;
}

export interface GetBookPayload {
  id: string;
}

export async function getBook(
  deps: GetBookDeps,
  payload: GetBookPayload
) {
  if (!payload.id) {
    return {
      success: false,
      error: "Book ID is required"
    };
  }

  const book = await deps.bookService.findById(payload.id);

  if (!book) {
    return {
      success: false,
      error: "Book not found"
    };
  }

  return {
    success: true,
    book
  };
}