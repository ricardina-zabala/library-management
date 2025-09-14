import type { LoanService, LoanWithBook } from "../../services/loan-service.js";
import type { UserService } from "../../services/user-service.js";
import { UserRole } from "../../entities/user.js";
import { LoanStatus } from "../../entities/loan.js";

export interface GetUserLoansWithBooksDeps {
  loanService: LoanService;
  userService: UserService;
}

export interface GetUserLoansWithBooksPayload {
  userId: string;
  requestingUserRole: UserRole;
  requestingUserId?: string;
}

export async function getUserLoansWithBooks(
  deps: GetUserLoansWithBooksDeps,
  payload: GetUserLoansWithBooksPayload
) {
  if (!payload.userId) {
    return {
      success: false,
      error: "User ID is required"
    };
  }

  const user = await deps.userService.findById(payload.userId);
  if (!user) {
    return {
      success: false,
      error: "User not found"
    };
  }

  // Authorization check
  if (payload.requestingUserRole === UserRole.MEMBER) {
    if (!payload.requestingUserId || user.id !== payload.requestingUserId) {
      return {
        success: false,
        error: "Members can only view their own loans"
      };
    }
  }

  try {
    const loans = await deps.loanService.getUserLoansWithBookInfo(payload.userId);
    
    // Update overdue status
    const currentDate = new Date();
    const loansWithStatus = loans.map(loan => {
      if (loan.status === LoanStatus.ACTIVE && currentDate > loan.dueDate) {
        return { ...loan, status: LoanStatus.OVERDUE };
      }
      return loan;
    });

    const activeLoans = loansWithStatus.filter(loan => loan.status === LoanStatus.ACTIVE);
    const overdueLoans = loansWithStatus.filter(loan => loan.status === LoanStatus.OVERDUE);

    return {
      success: true,
      loans: loansWithStatus,
      summary: {
        total: loansWithStatus.length,
        active: activeLoans.length,
        overdue: overdueLoans.length,
        returned: loansWithStatus.filter(loan => loan.status === LoanStatus.RETURNED).length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to get user loans with book information"
    };
  }
}