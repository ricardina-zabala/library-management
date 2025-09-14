import { describe, it, expect, beforeEach } from "vitest";
import { MockAuthService } from "../../services/mocks/mock-auth-service.js";
import { validateToken, type ValidateTokenDeps } from "./validate-token.js";
import { UserRole } from "../../entities/user.js";
import type { User } from "../../entities/user.js";

describe("validateToken", () => {
  let deps: ValidateTokenDeps;
  let mockAuthService: MockAuthService;
  let mockUser: User;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    deps = {
      authService: mockAuthService
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

    mockAuthService.addUser(mockUser);
  });

  it("should successfully validate a valid token", async () => {
    const result = await validateToken(deps, {
      token: "mock-token-1"
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe("1");
    expect(result.user?.email).toBe("user@example.com");
    expect(result.user?.name).toBe("Test User");
  });

  it("should fail when token is missing", async () => {
    const result = await validateToken(deps, {
      token: ""
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Token is required");
  });

  it("should fail with invalid token format", async () => {
    const result = await validateToken(deps, {
      token: "invalid-token"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid or expired token");
  });

  it("should fail with non-existent user token", async () => {
    const result = await validateToken(deps, {
      token: "mock-token-999"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid or expired token");
  });

  it("should include formatted name in user object", async () => {
    const userWithLongNames = {
      id: "2",
      email: "longname@example.com",
      password: "password123",
      firstName: "Very Long First Name",
      lastName: "Very Long Last Name",
      role: UserRole.LIBRARIAN,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockAuthService.addUser(userWithLongNames);

    const result = await validateToken(deps, {
      token: "mock-token-2"
    });

    expect(result.success).toBe(true);
    expect(result.user?.name).toBe("Very Long First Name Very Long Last Name");
    expect(result.user?.firstName).toBe("Very Long First Name");
    expect(result.user?.lastName).toBe("Very Long Last Name");
  });
});