import { describe, it, expect, beforeEach } from "vitest";
import { MockLoanService } from "../../services/mocks/mock-loan-service.js";
import { MockUserService } from "../../services/mocks/mock-user-service.js";
import { getUserLoans, type GetUserLoansDeps } from "./get-user-loans.js";
import { UserRole } from "../../entities/user.js";
import { LoanStatus } from "../../entities/loan.js";
import type { User } from "../../entities/user.js";
import type { Loan } from "../../entities/loan.js";

describe("getUserLoans", () => {
  let deps: GetUserLoansDeps;
  let mockLoanService: MockLoanService;
  let mockUserService: MockUserService;
  let mockUser: User;
  let mockLoans: Loan[];

  beforeEach(() => {
    mockLoanService = new MockLoanService();
    mockUserService = new MockUserService();
    deps = {
      loanService: mockLoanService,
      userService: mockUserService
    };

    mockUser = {
      id: "1",
      email: "user@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockLoans = [
      {
        id: "1",
        bookId: "book1",
        userId: "1",
        loanDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: LoanStatus.ACTIVE,
        renewalCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        bookId: "book2",
        userId: "1",
        loanDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: LoanStatus.RETURNED,
        renewalCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3",
        bookId: "book3",
        userId: "2",
        loanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: LoanStatus.ACTIVE,
        renewalCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockUser2 = {
      id: "2",
      email: "user2@example.com",
      password: "password123",
      firstName: "Test2",
      lastName: "User2",
      role: UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockUserService as any).users = [mockUser, mockUser2];
    (mockLoanService as any).loans = mockLoans;
  });

  it("should get user loans as librarian", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.LIBRARIAN,
      includeHistory: true
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.length).toBe(2);
    expect(result.loans?.every(loan => loan.userId === "1")).toBe(true);
  });

  it("should get user loans as admin", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.ADMIN,
      includeHistory: true
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.length).toBe(2);
  });

  it("should allow member to view their own loans", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.MEMBER,
      requestingUserId: "1",
      includeHistory: true
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.length).toBe(2);
  });

  it("should prevent member from viewing other users' loans", async () => {
    const result = await getUserLoans(deps, {
      userId: "2",
      requestingUserRole: UserRole.MEMBER,
      requestingUserId: "1"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Members can only view their own loans");
  });

  it("should fail when user ID is missing", async () => {
    const result = await getUserLoans(deps, {
      userId: "",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User ID is required");
  });

  it("should fail when user does not exist", async () => {
    const result = await getUserLoans(deps, {
      userId: "999",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User not found");
  });

  it("should filter loans by status", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.LIBRARIAN,
      status: LoanStatus.ACTIVE
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.length).toBe(1);
    expect(result.loans?.[0]?.status).toBe(LoanStatus.ACTIVE);
  });

  it("should get only active loans by default (not including history)", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.LIBRARIAN,
      includeHistory: false
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.every(loan => loan.status === LoanStatus.ACTIVE)).toBe(true);
  });

  it("should include history when requested", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.LIBRARIAN,
      includeHistory: true
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.length).toBe(2);
  });

  it("should return empty array when user has no loans", async () => {
    const userWithoutLoans = {
      id: "3",
      email: "noloans@example.com",
      password: "password123",
      firstName: "No",
      lastName: "Loans",
      role: UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (mockUserService as any).users.push(userWithoutLoans);

    const result = await getUserLoans(deps, {
      userId: "3",
      requestingUserRole: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.loans).toBeDefined();
    expect(result.loans?.length).toBe(0);
  });

  it("should fail when member tries to view loans without providing requesting user ID", async () => {
    const result = await getUserLoans(deps, {
      userId: "1",
      requestingUserRole: UserRole.MEMBER
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Members can only view their own loans");
  });
});