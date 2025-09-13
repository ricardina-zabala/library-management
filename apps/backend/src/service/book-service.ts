import Database from 'better-sqlite3';
import type { Book, BookStatus, BookService, CreateBookData, UpdateBookData, BookSearchCriteria } from 'app-domain';

export class DatabaseBookService implements BookService {
  constructor(private db: Database.Database) {}

  async create(bookData: CreateBookData): Promise<Book> {
    const book: Book = {
      id: crypto.randomUUID(),
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      category: bookData.category,
      publishedYear: bookData.publishedYear,
      totalCopies: bookData.totalCopies,
      availableCopies: bookData.totalCopies,
      status: 'AVAILABLE' as BookStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO books (id, title, author, isbn, category, publishedYear, totalCopies, availableCopies, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      book.id,
      book.title,
      book.author,
      book.isbn,
      book.category,
      book.publishedYear,
      book.totalCopies,
      book.availableCopies,
      book.status,
      book.createdAt.toISOString(),
      book.updatedAt.toISOString()
    );

    return book;
  }

  async findAll(): Promise<Book[]> {
    const stmt = this.db.prepare('SELECT * FROM books ORDER BY title ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category,
      publishedYear: row.publishedYear,
      totalCopies: row.totalCopies,
      availableCopies: row.availableCopies,
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async findById(id: string): Promise<Book | undefined> {
    const stmt = this.db.prepare('SELECT * FROM books WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return undefined;

    return {
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category,
      publishedYear: row.publishedYear,
      totalCopies: row.totalCopies,
      availableCopies: row.availableCopies,
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async search(criteria: BookSearchCriteria): Promise<Book[]> {
    let query = 'SELECT * FROM books WHERE 1=1';
    const queryParams: any[] = [];

    if (criteria.title) {
      query += ' AND title LIKE ?';
      queryParams.push(`%${criteria.title}%`);
    }

    if (criteria.author) {
      query += ' AND author LIKE ?';
      queryParams.push(`%${criteria.author}%`);
    }

    if (criteria.isbn) {
      query += ' AND isbn = ?';
      queryParams.push(criteria.isbn);
    }

    if (criteria.category) {
      query += ' AND category = ?';
      queryParams.push(criteria.category);
    }

    if (criteria.status) {
      query += ' AND status = ?';
      queryParams.push(criteria.status);
    }

    query += ' ORDER BY title ASC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category,
      publishedYear: row.publishedYear,
      totalCopies: row.totalCopies,
      availableCopies: row.availableCopies,
      status: row.status as BookStatus,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async updateAvailableCopies(bookId: string, change: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE books 
      SET availableCopies = availableCopies + ?, updatedAt = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(change, new Date().toISOString(), bookId);

    if (result.changes > 0) {
      const book = await this.findById(bookId);
      if (book) {
        const newStatus = book.availableCopies > 0 ? 'AVAILABLE' : 'BORROWED';
        const updateStatusStmt = this.db.prepare(`
          UPDATE books SET status = ?, updatedAt = ? WHERE id = ?
        `);
        updateStatusStmt.run(newStatus, new Date().toISOString(), bookId);
      }
      return true;
    }
    return false;
  }

  async findByISBN(isbn: string): Promise<Book | undefined> {
    const row = this.db.prepare('SELECT * FROM books WHERE isbn = ?').get(isbn) as any;
    
    if (!row) return undefined;

    return {
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category,
      publishedYear: row.publishedYear,
      totalCopies: row.totalCopies,
      availableCopies: row.availableCopies,
      status: row.status as BookStatus,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async update(id: string, bookData: UpdateBookData): Promise<Book | undefined> {
    const existingBook = await this.findById(id);
    if (!existingBook) return undefined;

    const updateFields: string[] = [];
    const values: any[] = [];

    if (bookData.title !== undefined) {
      updateFields.push('title = ?');
      values.push(bookData.title);
    }
    if (bookData.author !== undefined) {
      updateFields.push('author = ?');
      values.push(bookData.author);
    }
    if (bookData.category !== undefined) {
      updateFields.push('category = ?');
      values.push(bookData.category);
    }
    if (bookData.publishedYear !== undefined) {
      updateFields.push('publishedYear = ?');
      values.push(bookData.publishedYear);
    }
    if (bookData.totalCopies !== undefined) {
      updateFields.push('totalCopies = ?');
      values.push(bookData.totalCopies);
    }
    if (bookData.status !== undefined) {
      updateFields.push('status = ?');
      values.push(bookData.status);
    }

    if (updateFields.length === 0) return existingBook;

    updateFields.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE books SET ${updateFields.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM books WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async findByCategory(category: string): Promise<Book[]> {
    const rows = this.db.prepare('SELECT * FROM books WHERE category = ?').all(category) as any[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category,
      publishedYear: row.publishedYear,
      totalCopies: row.totalCopies,
      availableCopies: row.availableCopies,
      status: row.status as BookStatus,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async findAvailable(): Promise<Book[]> {
    const rows = this.db.prepare('SELECT * FROM books WHERE status = "AVAILABLE" AND availableCopies > 0').all() as any[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category,
      publishedYear: row.publishedYear,
      totalCopies: row.totalCopies,
      availableCopies: row.availableCopies,
      status: row.status as BookStatus,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }
}