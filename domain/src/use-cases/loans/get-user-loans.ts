import type { LoanService } from "../../services/loan-service.js";
import type { UserService } from "../../services/user-service.js";
import { UserRole } from "../../entities/user.js";
import { LoanStatus } from "../../entities/loan.js";

export interface GetUserLoansDeps {
  loanService: LoanService;
  userService: UserService;
}

export interface GetUserLoansPayload {
  userId: string;
  requestingUserRole: UserRole;
  requestingUserId?: string;
  status?: LoanStatus;
  includeHistory?: boolean;
}

export async function getUserLoans(
  deps: GetUserLoansDeps,
  payload: GetUserLoansPayload
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

  if (payload.requestingUserRole === UserRole.MEMBER) {
    if (!payload.requestingUserId || user.id !== payload.requestingUserId) {
      return {
        success: false,
        error: "Members can only view their own loans"
      };
    }
  }

  let loans;
  if (payload.status) {
    const criteria = { userId: payload.userId, status: payload.status };
    loans = await deps.loanService.search(criteria);
  } else if (payload.includeHistory) {
    loans = await deps.loanService.findByUser(payload.userId);
  } else {
    loans = await deps.loanService.getUserActiveLoans(payload.userId);
  }

  const activeLoans = loans.filter((loan: any) => loan.status === LoanStatus.ACTIVE);
  const overdueLoans = loans.filter((loan: any) => 
    loan.status === LoanStatus.ACTIVE && new Date() > loan.dueDate
  );

  return {
    success: true,
    loans,
    summary: {
      total: loans.length,
      active: activeLoans.length,
      overdue: overdueLoans.length,
      returned: loans.filter((loan: any) => loan.status === LoanStatus.RETURNED).length
    }
  };
}