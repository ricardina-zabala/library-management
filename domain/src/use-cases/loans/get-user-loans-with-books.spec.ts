import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserLoansWithBooks } from './get-user-loans-with-books.js';
import { UserRole } from '../../entities/user.js';
import { LoanStatus } from '../../entities/loan.js';
import type { LoanService, LoanWithBook } from '../../services/loan-service.js';
import type { UserService } from '../../services/user-service.js';

describe('getUserLoansWithBooks', () => {
  let mockLoanService: LoanService;
  let mockUserService: UserService;
  
  const mockUser = {
    id: 'user-1',
    email: 'john@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.MEMBER,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockLoanWithBook: LoanWithBook = {
    id: 'loan-1',
    userId: 'user-1',
    bookId: 'book-1',
    loanDate: new Date('2023-01-01'),
    dueDate: new Date('2023-01-15'),
    status: LoanStatus.ACTIVE,
    renewalCount: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    book: {
      id: 'book-1',
      title: 'Test Book',
      author: 'Test Author',
      isbn: '123456789',
      category: 'Fiction'
    }
  };

  beforeEach(() => {
    mockLoanService = {
      getUserLoansWithBookInfo: vi.fn(),
    } as any;

    mockUserService = {
      findById: vi.fn(),
    } as any;
  });

  it('should return success with loans when user exists', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);
    vi.mocked(mockLoanService.getUserLoansWithBookInfo).mockResolvedValue([mockLoanWithBook]);

    const result = await getUserLoansWithBooks(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        userId: 'user-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(true);
    expect(result.loans).toHaveLength(1);
    expect((result as any).loans[0].book.title).toBe('Test Book');
    expect(result.summary?.total).toBe(1);
    expect(result.summary?.active).toBe(1);
  });

  it('should return error when user not found', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(undefined);

    const result = await getUserLoansWithBooks(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        userId: 'user-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not found');
  });

  it('should return error when userId is missing', async () => {
    const result = await getUserLoansWithBooks(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        userId: '', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('User ID is required');
  });

  it('should enforce authorization for members', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);

    const result = await getUserLoansWithBooks(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        userId: 'user-1', 
        requestingUserRole: UserRole.MEMBER,
        requestingUserId: 'different-user'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Members can only view their own loans');
  });

  it('should mark overdue loans correctly', async () => {
    const overdueLoan = {
      ...mockLoanWithBook,
      dueDate: new Date('2020-01-01') // Past date
    };

    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);
    vi.mocked(mockLoanService.getUserLoansWithBookInfo).mockResolvedValue([overdueLoan]);

    const result = await getUserLoansWithBooks(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        userId: 'user-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(true);
    expect((result as any).loans[0].status).toBe(LoanStatus.OVERDUE);
    expect(result.summary?.overdue).toBe(1);
    expect(result.summary?.active).toBe(0);
  });
});