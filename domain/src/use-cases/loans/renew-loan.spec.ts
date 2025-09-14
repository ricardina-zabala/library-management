import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renewLoan } from './renew-loan.js';
import { UserRole } from '../../entities/user.js';
import { LoanStatus } from '../../entities/loan.js';
import type { LoanService } from '../../services/loan-service.js';
import type { UserService } from '../../services/user-service.js';

describe('renewLoan', () => {
  let mockLoanService: LoanService;
  let mockUserService: UserService;
  
  const mockLoan = {
    id: 'loan-1',
    userId: 'user-1',
    bookId: 'book-1',
    loanDate: new Date('2023-01-01'),
    dueDate: new Date('2023-01-15'),
    status: LoanStatus.ACTIVE,
    renewalCount: 0,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(() => {
    mockLoanService = {
      findById: vi.fn(),
      renewLoan: vi.fn(),
    } as any;

    mockUserService = {} as any;
  });

  it('should renew loan successfully for authorized user', async () => {
    const renewedLoan = { ...mockLoan, renewalCount: 1, dueDate: new Date('2023-01-29') };
    
    vi.mocked(mockLoanService.findById).mockResolvedValue(mockLoan);
    vi.mocked(mockLoanService.renewLoan).mockResolvedValue(renewedLoan);

    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: 'loan-1', 
        requestingUserRole: UserRole.MEMBER,
        requestingUserId: 'user-1'
      }
    );

    expect(result.success).toBe(true);
    expect(result.loan?.renewalCount).toBe(1);
    expect(result.message).toContain('renewed successfully');
  });

  it('should return error when loan not found', async () => {
    vi.mocked(mockLoanService.findById).mockResolvedValue(undefined);

    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: 'loan-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Loan not found');
  });

  it('should return error when loanId is missing', async () => {
    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: '', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Loan ID is required');
  });

  it('should enforce authorization for members', async () => {
    vi.mocked(mockLoanService.findById).mockResolvedValue(mockLoan);

    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: 'loan-1', 
        requestingUserRole: UserRole.MEMBER,
        requestingUserId: 'different-user'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Members can only renew their own loans');
  });

  it('should reject renewal of non-active loans', async () => {
    const returnedLoan = { ...mockLoan, status: LoanStatus.RETURNED };
    vi.mocked(mockLoanService.findById).mockResolvedValue(returnedLoan);

    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: 'loan-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Only active loans can be renewed');
  });

  it('should reject renewal when max renewals reached', async () => {
    const maxRenewedLoan = { ...mockLoan, renewalCount: 3 };
    vi.mocked(mockLoanService.findById).mockResolvedValue(maxRenewedLoan);

    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: 'loan-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Maximum number of renewals reached (3)');
  });

  it('should reject renewal of overdue loans', async () => {
    const overdueLoan = { ...mockLoan, dueDate: new Date('2020-01-01') };
    vi.mocked(mockLoanService.findById).mockResolvedValue(overdueLoan);

    const result = await renewLoan(
      { loanService: mockLoanService, userService: mockUserService },
      { 
        loanId: 'loan-1', 
        requestingUserRole: UserRole.ADMIN,
        requestingUserId: 'admin-1'
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Overdue loans cannot be renewed');
  });
});