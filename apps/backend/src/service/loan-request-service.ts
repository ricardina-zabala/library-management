import Database from 'better-sqlite3';
import type { LoanRequest, LoanRequestStatus, LoanRequestService, CreateLoanRequestData } from 'app-domain';

export class DatabaseLoanRequestService implements LoanRequestService {
  constructor(private db: Database.Database) {}

  async create(requestData: CreateLoanRequestData): Promise<LoanRequest> {
    const request: LoanRequest = {
      id: crypto.randomUUID(),
      userId: requestData.userId,
      bookId: requestData.bookId,
      status: 'PENDING' as LoanRequestStatus,
      requestDate: new Date(),
      token: requestData.token,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO loan_requests (id, userId, bookId, status, requestDate, reviewDate, reviewedBy, dueDate, rejectionReason, token, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      request.id,
      request.userId,
      request.bookId,
      request.status,
      request.requestDate.toISOString(),
      request.reviewDate?.toISOString() || null,
      request.reviewedBy || null,
      request.dueDate?.toISOString() || null,
      request.rejectionReason || null,
      request.token,
      request.createdAt.toISOString(),
      request.updatedAt.toISOString()
    );

    return request;
  }

  async findById(id: string): Promise<LoanRequest | undefined> {
    const stmt = this.db.prepare('SELECT * FROM loan_requests WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return undefined;
    
    return this.mapRowToLoanRequest(row);
  }

  async findByToken(token: string): Promise<LoanRequest | undefined> {
    const stmt = this.db.prepare('SELECT * FROM loan_requests WHERE token = ?');
    const row = stmt.get(token) as any;
    
    if (!row) return undefined;
    
    return this.mapRowToLoanRequest(row);
  }

  async findByUser(userId: string): Promise<LoanRequest[]> {
    const stmt = this.db.prepare('SELECT * FROM loan_requests WHERE userId = ? ORDER BY requestDate DESC');
    const rows = stmt.all(userId) as any[];
    
    return this.mapRowsToLoanRequests(rows);
  }

  async findByStatus(status: LoanRequestStatus): Promise<LoanRequest[]> {
    const stmt = this.db.prepare('SELECT * FROM loan_requests WHERE status = ? ORDER BY requestDate DESC');
    const rows = stmt.all(status) as any[];
    
    return this.mapRowsToLoanRequests(rows);
  }

  async findPending(): Promise<LoanRequest[]> {
    return this.findByStatus('PENDING' as LoanRequestStatus);
  }

  async approve(id: string, reviewedBy: string, dueDate?: Date): Promise<LoanRequest | undefined> {
    const stmt = this.db.prepare(`
      UPDATE loan_requests 
      SET status = 'APPROVED', reviewDate = ?, reviewedBy = ?, dueDate = ?, updatedAt = ?
      WHERE id = ?
    `);

    const reviewDate = new Date();
    const result = stmt.run(
      reviewDate.toISOString(),
      reviewedBy,
      dueDate?.toISOString() || null,
      new Date().toISOString(),
      id
    );

    if (result.changes === 0) {
      return undefined;
    }

    return this.findById(id);
  }

  async reject(id: string, reviewedBy: string, reason?: string): Promise<LoanRequest | undefined> {
    const stmt = this.db.prepare(`
      UPDATE loan_requests 
      SET status = 'REJECTED', reviewDate = ?, reviewedBy = ?, rejectionReason = ?, updatedAt = ?
      WHERE id = ?
    `);

    const reviewDate = new Date();
    const result = stmt.run(
      reviewDate.toISOString(),
      reviewedBy,
      reason || null,
      new Date().toISOString(),
      id
    );

    if (result.changes === 0) {
      return undefined;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM loan_requests WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToLoanRequest(row: any): LoanRequest {
    const request: LoanRequest = {
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      status: row.status as LoanRequestStatus,
      requestDate: new Date(row.requestDate),
      token: row.token,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };

    if (row.reviewDate) {
      request.reviewDate = new Date(row.reviewDate);
    }
    if (row.reviewedBy) {
      request.reviewedBy = row.reviewedBy;
    }
    if (row.dueDate) {
      request.dueDate = new Date(row.dueDate);
    }
    if (row.rejectionReason) {
      request.rejectionReason = row.rejectionReason;
    }

    return request;
  }

  private mapRowsToLoanRequests(rows: any[]): LoanRequest[] {
    return rows.map(row => this.mapRowToLoanRequest(row));
  }
}