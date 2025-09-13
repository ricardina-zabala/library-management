import type { BookService, CreateBookData } from "../../services/book-service.js";
import { UserRole } from "../../entities/user.js";

export interface CreateBookDeps {
  bookService: BookService;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
  userRole: UserRole;
}

export async function createBook(
  deps: CreateBookDeps,
  payload: CreateBookPayload
) {
  if (payload.userRole !== UserRole.LIBRARIAN && payload.userRole !== UserRole.ADMIN) {
    return {
      success: false,
      error: "Only librarians and admins can create books"
    };
  }

  if (!payload.title || !payload.author || !payload.isbn || !payload.category) {
    return {
      success: false,
      error: "Title, author, ISBN, and category are required"
    };
  }

  if (payload.publishedYear < 1000 || payload.publishedYear > new Date().getFullYear()) {
    return {
      success: false,
      error: "Invalid published year"
    };
  }

  if (payload.totalCopies < 1) {
    return {
      success: false,
      error: "Total copies must be at least 1"
    };
  }

  const existingBook = await deps.bookService.findByISBN(payload.isbn);
  if (existingBook) {
    return {
      success: false,
      error: "A book with this ISBN already exists"
    };
  }

  const createBookData: CreateBookData = {
    title: payload.title.trim(),
    author: payload.author.trim(),
    isbn: payload.isbn.trim(),
    category: payload.category.trim(),
    publishedYear: payload.publishedYear,
    totalCopies: payload.totalCopies
  };

  const book = await deps.bookService.create(createBookData);

  return {
    success: true,
    book
  };
}