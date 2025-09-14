import type { BookService, UpdateBookData } from "../../services/book-service.js";
import { UserRole } from "../../entities/user.js";

export interface UpdateBookDeps {
  bookService: BookService;
}

export interface UpdateBookPayload {
  bookId: string;
  title?: string;
  author?: string;
  category?: string;
  publishedYear?: number;
  totalCopies?: number;
  userRole: UserRole;
}

export async function updateBook(
  deps: UpdateBookDeps,
  payload: UpdateBookPayload
) {
  if (payload.userRole !== UserRole.LIBRARIAN && payload.userRole !== UserRole.ADMIN) {
    return {
      success: false,
      error: "Only librarians and admins can update books"
    };
  }

  const existingBook = await deps.bookService.findById(payload.bookId);
  if (!existingBook) {
    return {
      success: false,
      error: "Book not found"
    };
  }

  if (payload.publishedYear !== undefined && (payload.publishedYear < 1000 || payload.publishedYear > new Date().getFullYear())) {
    return {
      success: false,
      error: "Invalid published year"
    };
  }

  if (payload.totalCopies !== undefined && payload.totalCopies < 1) {
    return {
      success: false,
      error: "Total copies must be at least 1"
    };
  }

  if (payload.title !== undefined && !payload.title.trim()) {
    return {
      success: false,
      error: "Title cannot be empty"
    };
  }

  if (payload.author !== undefined && !payload.author.trim()) {
    return {
      success: false,
      error: "Author cannot be empty"
    };
  }

  if (payload.category !== undefined && !payload.category.trim()) {
    return {
      success: false,
      error: "Category cannot be empty"
    };
  }

  const updateData: UpdateBookData = {};
  if (payload.title !== undefined) updateData.title = payload.title.trim();
  if (payload.author !== undefined) updateData.author = payload.author.trim();
  if (payload.category !== undefined) updateData.category = payload.category.trim();
  if (payload.publishedYear !== undefined) updateData.publishedYear = payload.publishedYear;
  if (payload.totalCopies !== undefined) {
    updateData.totalCopies = payload.totalCopies;
    if (payload.totalCopies > existingBook.totalCopies) {
    }
  }

  try {
    const updatedBook = await deps.bookService.update(payload.bookId, updateData);
    
    if (!updatedBook) {
      return {
        success: false,
        error: "Failed to update book"
      };
    }

    return {
      success: true,
      book: updatedBook
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update book"
    };
  }
}