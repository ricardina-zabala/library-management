import Database from 'better-sqlite3';
import type { Loan, LoanStatus, LoanService, CreateLoanData, LoanSearchCriteria } from 'app-domain';

export class DatabaseLoanService implements LoanService {
  constructor(private db: Database.Database) {}

  async create(loanData: CreateLoanData): Promise<Loan> {
    const loanDate = new Date();

    const loan: Loan = {
      id: crypto.randomUUID(),
      userId: loanData.userId,
      bookId: loanData.bookId,
      loanDate,
      dueDate: loanData.dueDate,
      status: 'ACTIVE' as LoanStatus,
      renewalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO loans (id, userId, bookId, loanDate, dueDate, returnDate, status, renewalCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      loan.id,
      loan.userId,
      loan.bookId,
      loan.loanDate.toISOString(),
      loan.dueDate.toISOString(),
      loan.returnDate?.toISOString() || null,
      loan.status,
      loan.renewalCount,
      loan.createdAt.toISOString(),
      loan.updatedAt.toISOString()
    );

    return loan;
  }



  async findById(id: string): Promise<Loan | undefined> {
    const stmt = this.db.prepare('SELECT * FROM loans WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return undefined;

    const loan: Loan = {
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      loanDate: new Date(row.loanDate),
      dueDate: new Date(row.dueDate),
      status: row.status,
      renewalCount: row.renewalCount,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    if (row.returnDate) {
      loan.returnDate = new Date(row.returnDate);
    }
    return loan;
  }



  async findActiveLoanByUserAndBook(userId: string, bookId: string): Promise<Loan | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM loans 
      WHERE userId = ? AND bookId = ? AND status = 'ACTIVE'
    `);
    const row = stmt.get(userId, bookId) as any;
    
    if (!row) return null;

    const loan: Loan = {
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      loanDate: new Date(row.loanDate),
      dueDate: new Date(row.dueDate),
      status: row.status,
      renewalCount: row.renewalCount,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    if (row.returnDate) {
      loan.returnDate = new Date(row.returnDate);
    }
    return loan;
  }

  async findAll(): Promise<Loan[]> {
    const stmt = this.db.prepare('SELECT * FROM loans ORDER BY loanDate DESC');
    const rows = stmt.all() as any[];
    
    return this.mapRowsToLoans(rows);
  }

  async findByUser(userId: string): Promise<Loan[]> {
    const stmt = this.db.prepare('SELECT * FROM loans WHERE userId = ? ORDER BY loanDate DESC');
    const rows = stmt.all(userId) as any[];
    
    return this.mapRowsToLoans(rows);
  }

  async findByBook(bookId: string): Promise<Loan[]> {
    const stmt = this.db.prepare('SELECT * FROM loans WHERE bookId = ? ORDER BY loanDate DESC');
    const rows = stmt.all(bookId) as any[];
    
    return this.mapRowsToLoans(rows);
  }

  async findByStatus(status: LoanStatus): Promise<Loan[]> {
    const stmt = this.db.prepare('SELECT * FROM loans WHERE status = ? ORDER BY loanDate DESC');
    const rows = stmt.all(status) as any[];
    
    return this.mapRowsToLoans(rows);
  }

  async findOverdue(): Promise<Loan[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM loans 
      WHERE status = 'ACTIVE' AND dueDate < ?
      ORDER BY dueDate ASC
    `);
    const rows = stmt.all(new Date().toISOString()) as any[];
    
    return this.mapRowsToLoans(rows);
  }

  async search(criteria: LoanSearchCriteria): Promise<Loan[]> {
    let query = 'SELECT * FROM loans WHERE 1=1';
    const params: any[] = [];

    if (criteria.userId) {
      query += ' AND userId = ?';
      params.push(criteria.userId);
    }

    if (criteria.bookId) {
      query += ' AND bookId = ?';
      params.push(criteria.bookId);
    }

    if (criteria.status) {
      query += ' AND status = ?';
      params.push(criteria.status);
    }

    if (criteria.overdue === true) {
      query += ' AND status = "ACTIVE" AND dueDate < ?';
      params.push(new Date().toISOString());
    } else if (criteria.overdue === false) {
      query += ' AND (status != "ACTIVE" OR dueDate >= ?)';
      params.push(new Date().toISOString());  
    }

    query += ' ORDER BY loanDate DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return this.mapRowsToLoans(rows);
  }

  async returnBook(loanId: string, returnDate: Date): Promise<Loan | undefined> {
    const stmt = this.db.prepare(`
      UPDATE loans 
      SET returnDate = ?, status = ?, updatedAt = ?
      WHERE id = ? AND status = 'ACTIVE'
    `);

    const result = stmt.run(
      returnDate.toISOString(),
      'RETURNED',
      new Date().toISOString(),
      loanId
    );

    if (result.changes > 0) {
      return this.findById(loanId);
    }
    return undefined;
  }

  async renewLoan(loanId: string, newDueDate: Date): Promise<Loan | undefined> {
    const stmt = this.db.prepare(`
      UPDATE loans 
      SET dueDate = ?, renewalCount = renewalCount + 1, updatedAt = ?
      WHERE id = ? AND status = 'ACTIVE'
    `);

    const result = stmt.run(
      newDueDate.toISOString(),
      new Date().toISOString(),
      loanId
    );

    if (result.changes > 0) {
      return this.findById(loanId);
    }
    return undefined;
  }

  async markOverdue(loanId: string): Promise<Loan | undefined> {
    const stmt = this.db.prepare(`
      UPDATE loans 
      SET status = ?, updatedAt = ?
      WHERE id = ? AND status = 'ACTIVE' AND dueDate < ?
    `);

    const result = stmt.run(
      'OVERDUE',
      new Date().toISOString(),
      loanId,
      new Date().toISOString()
    );

    if (result.changes > 0) {
      return this.findById(loanId);
    }
    return undefined;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM loans WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getActiveLoanForBook(bookId: string): Promise<Loan | undefined> {
    const stmt = this.db.prepare(`
      SELECT * FROM loans 
      WHERE bookId = ? AND status = 'ACTIVE'
      LIMIT 1
    `);
    const row = stmt.get(bookId) as any;
    
    if (!row) return undefined;

    return this.mapRowToLoan(row);
  }

  async getUserActiveLoans(userId: string): Promise<Loan[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM loans 
      WHERE userId = ? AND status = 'ACTIVE'
      ORDER BY loanDate DESC
    `);
    const rows = stmt.all(userId) as any[];
    
    return this.mapRowsToLoans(rows);
  }

  private mapRowToLoan(row: any): Loan {
    const loan: Loan = {
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      loanDate: new Date(row.loanDate),
      dueDate: new Date(row.dueDate),
      status: row.status as LoanStatus,
      renewalCount: row.renewalCount,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    if (row.returnDate) {
      loan.returnDate = new Date(row.returnDate);
    }
    return loan;
  }

  private mapRowsToLoans(rows: any[]): Loan[] {
    return rows.map(row => this.mapRowToLoan(row));
  }
}