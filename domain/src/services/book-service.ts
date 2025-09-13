import type { Book, BookStatus } from "../entities/book.js";

export interface CreateBookData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  category?: string;
  publishedYear?: number;
  totalCopies?: number;
  status?: BookStatus;
}

export interface BookSearchCriteria {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  status?: BookStatus;
}

export interface BookService {
  findById: (id: string) => Promise<Book | undefined>;
  findByISBN: (isbn: string) => Promise<Book | undefined>;
  findAll: () => Promise<Book[]>;
  search: (criteria: BookSearchCriteria) => Promise<Book[]>;
  create: (bookData: CreateBookData) => Promise<Book>;
  update: (id: string, bookData: UpdateBookData) => Promise<Book | undefined>;
  delete: (id: string) => Promise<boolean>;
  findByCategory: (category: string) => Promise<Book[]>;
  findAvailable: () => Promise<Book[]>;
  updateAvailableCopies: (bookId: string, change: number) => Promise<boolean>;
}