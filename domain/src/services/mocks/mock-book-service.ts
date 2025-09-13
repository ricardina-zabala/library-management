import type { BookService, CreateBookData, UpdateBookData, BookSearchCriteria } from "../book-service.js";
import type { Book, BookStatus } from "../../entities/book.js";

export class MockBookService implements BookService {
  private books: Book[] = [];

  constructor(initialBooks: Book[] = []) {
    this.books = [...initialBooks];
  }

  async findById(id: string): Promise<Book | undefined> {
    return this.books.find(book => book.id === id);
  }

  async findByISBN(isbn: string): Promise<Book | undefined> {
    return this.books.find(book => book.isbn === isbn);
  }

  async findAll(): Promise<Book[]> {
    return [...this.books];
  }

  async search(criteria: BookSearchCriteria): Promise<Book[]> {
    return this.books.filter(book => {
      if (criteria.title && !book.title.toLowerCase().includes(criteria.title.toLowerCase())) {
        return false;
      }
      if (criteria.author && !book.author.toLowerCase().includes(criteria.author.toLowerCase())) {
        return false;
      }
      if (criteria.isbn && book.isbn !== criteria.isbn) {
        return false;
      }
      if (criteria.category && book.category !== criteria.category) {
        return false;
      }
      if (criteria.status && book.status !== criteria.status) {
        return false;
      }
      return true;
    });
  }

  async create(bookData: CreateBookData): Promise<Book> {
    const newBook: Book = {
      id: `book_${Date.now()}_${Math.random()}`,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      category: bookData.category,
      publishedYear: bookData.publishedYear,
      totalCopies: bookData.totalCopies,
      availableCopies: bookData.totalCopies,
      status: 'available' as BookStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.books.push(newBook);
    return newBook;
  }

  async update(id: string, bookData: UpdateBookData): Promise<Book | undefined> {
    const bookIndex = this.books.findIndex(book => book.id === id);
    
    if (bookIndex === -1) {
      return undefined;
    }

    const updatedBook: Book = {
      ...this.books[bookIndex]!,
      ...bookData,
      updatedAt: new Date()
    };

    this.books[bookIndex] = updatedBook;
    return updatedBook;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.books.length;
    this.books = this.books.filter(book => book.id !== id);
    return this.books.length < initialLength;
  }

  async findByCategory(category: string): Promise<Book[]> {
    return this.books.filter(book => book.category === category);
  }

  async findAvailable(): Promise<Book[]> {
    return this.books.filter(book => book.availableCopies > 0 && book.status === 'available');
  }

  async updateAvailableCopies(bookId: string, change: number): Promise<boolean> {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return false;

    const newAvailable = book.availableCopies + change;
    if (newAvailable < 0 || newAvailable > book.totalCopies) {
      return false;
    }

    book.availableCopies = newAvailable;
    book.updatedAt = new Date();
    
    if (book.availableCopies === 0) {
      book.status = 'borrowed' as BookStatus;
    } else if (book.availableCopies > 0 && book.status === 'borrowed') {
      book.status = 'available' as BookStatus;
    }

    return true;
  }

  addBook(book: Book): void {
    this.books.push(book);
  }

  getBooks(): Book[] {
    return [...this.books];
  }

  clearBooks(): void {
    this.books = [];
  }
}