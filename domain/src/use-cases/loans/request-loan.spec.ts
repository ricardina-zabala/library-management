import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requestLoan } from './request-loan.js';
import { UserRole } from '../../entities/user.js';
import { BookStatus } from '../../entities/book.js';
import type { BookService } from '../../services/book-service.js';
import type { UserService } from '../../services/user-service.js';
import type { EmailService } from '../../services/email-service.js';

describe('requestLoan', () => {
  let mockBookService: BookService;
  let mockUserService: UserService;
  let mockEmailService: EmailService;
  
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

  const mockBook = {
    id: 'book-1',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '123456789',
    category: 'Fiction',
    publishedYear: 2023,
    totalCopies: 3,
    availableCopies: 2,
    status: BookStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockBookService = {
      findById: vi.fn(),
    } as any;

    mockUserService = {
      findById: vi.fn(),
    } as any;

    mockEmailService = {
      sendLoanRequestEmail: vi.fn(),
      sendLoanApprovalEmail: vi.fn(),
      sendLoanRejectionEmail: vi.fn(),
    };
  });

  it('should send loan request email successfully', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);
    vi.mocked(mockBookService.findById).mockResolvedValue(mockBook);
    vi.mocked(mockEmailService.sendLoanRequestEmail).mockResolvedValue(true);

    const result = await requestLoan(
      { 
        bookService: mockBookService, 
        userService: mockUserService,
        emailService: mockEmailService 
      },
      { 
        userId: 'user-1',
        bookId: 'book-1',
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('Loan request sent successfully');
    expect(mockEmailService.sendLoanRequestEmail).toHaveBeenCalledWith(
      'john@example.com',
      'John Doe',
      'Test Book',
      'Test Author'
    );
  });

  it('should return error when user not found', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(undefined);

    const result = await requestLoan(
      { 
        bookService: mockBookService, 
        userService: mockUserService,
        emailService: mockEmailService 
      },
      { 
        userId: 'user-1',
        bookId: 'book-1',
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not found');
  });

  it('should return error when book not found', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);
    vi.mocked(mockBookService.findById).mockResolvedValue(undefined);

    const result = await requestLoan(
      { 
        bookService: mockBookService, 
        userService: mockUserService,
        emailService: mockEmailService 
      },
      { 
        userId: 'user-1',
        bookId: 'book-1',
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Book not found');
  });

  it('should enforce authorization for members', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);

    const result = await requestLoan(
      { 
        bookService: mockBookService, 
        userService: mockUserService,
        emailService: mockEmailService 
      },
      { 
        userId: 'user-1',
        bookId: 'book-1',
        requestingUserRole: UserRole.MEMBER,
        requestingUserId: 'different-user'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Members can only request loans for themselves');
  });

  it('should reject request for books under maintenance', async () => {
    const maintenanceBook = { ...mockBook, status: BookStatus.MAINTENANCE };
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);
    vi.mocked(mockBookService.findById).mockResolvedValue(maintenanceBook);

    const result = await requestLoan(
      { 
        bookService: mockBookService, 
        userService: mockUserService,
        emailService: mockEmailService 
      },
      { 
        userId: 'user-1',
        bookId: 'book-1',
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Book is currently under maintenance and cannot be requested');
  });

  it('should return error when email fails to send', async () => {
    vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);
    vi.mocked(mockBookService.findById).mockResolvedValue(mockBook);
    vi.mocked(mockEmailService.sendLoanRequestEmail).mockResolvedValue(false);

    const result = await requestLoan(
      { 
        bookService: mockBookService, 
        userService: mockUserService,
        emailService: mockEmailService 
      },
      { 
        userId: 'user-1',
        bookId: 'book-1',
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to send loan request email');
  });
});