import type { LoanService } from "../../services/loan-service.js";
import type { UserService } from "../../services/user-service.js";
import { UserRole } from "../../entities/user.js";
import { LoanStatus } from "../../entities/loan.js";

export interface RenewLoanDeps {
  loanService: LoanService;
  userService: UserService;
}

export interface RenewLoanPayload {
  loanId: string;
  requestingUserRole: UserRole;
  requestingUserId?: string;
  renewalDays?: number;
}

export async function renewLoan(
  deps: RenewLoanDeps,
  payload: RenewLoanPayload
) {
  if (!payload.loanId) {
    return {
      success: false,
      error: "Loan ID is required"
    };
  }

  const renewalDays = payload.renewalDays || 14;

  const loan = await deps.loanService.findById(payload.loanId);
  if (!loan) {
    return {
      success: false,
      error: "Loan not found"
    };
  }

  if (loan.status !== LoanStatus.ACTIVE) {
    return {
      success: false,
      error: "Only active loans can be renewed"
    };
  }

  // Authorization check
  if (payload.requestingUserRole === UserRole.MEMBER) {
    if (!payload.requestingUserId || loan.userId !== payload.requestingUserId) {
      return {
        success: false,
        error: "Members can only renew their own loans"
      };
    }
  }

  // Check renewal limits (max 3 renewals)
  if (loan.renewalCount >= 3) {
    return {
      success: false,
      error: "Maximum number of renewals reached (3)"
    };
  }

  // Check if loan is overdue
  const currentDate = new Date();
  if (currentDate > loan.dueDate) {
    return {
      success: false,
      error: "Overdue loans cannot be renewed"
    };
  }

  try {
    // Calculate new due date
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + renewalDays);

    const renewedLoan = await deps.loanService.renewLoan(payload.loanId, newDueDate);
    
    if (!renewedLoan) {
      return {
        success: false,
        error: "Failed to renew loan"
      };
    }

    return {
      success: true,
      loan: renewedLoan,
      message: `Loan renewed successfully. New due date: ${newDueDate.toDateString()}`
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to renew loan"
    };
  }
}