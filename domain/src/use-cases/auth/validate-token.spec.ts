import { describe, expect, test, beforeEach } from "vitest";
import { validateToken } from "./validate-token.js";
import { MockAuthService } from "../../services/mocks/mock-auth-service.js";
import { UserRole } from "../../entities/user.js";

describe("validateToken", () => {
  let authService: MockAuthService;
  let validToken: string;

  beforeEach(async () => {
    authService = new MockAuthService();
    
    // Register a user to get a valid token
    const registerResult = await authService.register({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: UserRole.MEMBER
    });
    
    validToken = registerResult.token!;
  });

  test("should validate successfully with valid token", async () => {
    const result = await validateToken(
      { authService },
      { token: validToken }
    );

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("test@example.com");
    expect(result.error).toBeUndefined();
  });

  test("should fail with invalid token", async () => {
    const result = await validateToken(
      { authService },
      { token: "invalid_token" }
    );

    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.error).toBe("Invalid or expired token");
  });

  test("should fail with empty token", async () => {
    const result = await validateToken(
      { authService },
      { token: "" }
    );

    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.error).toBe("Token is required");
  });

  test("should return correct user information", async () => {
    const result = await validateToken(
      { authService },
      { token: validToken }
    );

    expect(result.success).toBe(true);
    expect(result.user?.firstName).toBe("John");
    expect(result.user?.lastName).toBe("Doe");
    expect(result.user?.role).toBe(UserRole.MEMBER);
  });
});