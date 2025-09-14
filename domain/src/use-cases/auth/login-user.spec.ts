import { describe, it, expect, beforeEach } from "vitest";
import { loginUser, type LoginUserDeps } from "./login-user.js";
import { UserRole } from "../../entities/user.js";
import { MockAuthService } from "../../services/mocks/mock-auth-service.js";

describe("loginUser", () => {
  let deps: LoginUserDeps;
  let mockAuthService: MockAuthService;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    deps = {
      authService: mockAuthService
    };

    (mockAuthService).users = [{
      id: "1",
      email: "user@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date()
    }];
  });

  it("should successfully login with valid credentials", async () => {
    const result = await loginUser(deps, {
      email: "user@example.com",
      password: "password123"
    });

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("user@example.com");
  });

  it("should fail when email is missing", async () => {
    const result = await loginUser(deps, {
      email: "",
      password: "password123"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email and password are required");
  });

  it("should fail when password is missing", async () => {
    const result = await loginUser(deps, {
      email: "user@example.com",
      password: ""
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email and password are required");
  });

  it("should fail with invalid credentials", async () => {
    const result = await loginUser(deps, {
      email: "user@example.com",
      password: "wrongpassword"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid credentials");
  });

  it("should fail with non-existent user", async () => {
    const result = await loginUser(deps, {
      email: "nonexistent@example.com",
      password: "password123"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid credentials");
  });

  it("should trim and lowercase email", async () => {
    const result = await loginUser(deps, {
      email: "  USER@EXAMPLE.COM  ",
      password: "password123"
    });

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("user@example.com");
  });
});