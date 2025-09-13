import { describe, expect, test, beforeEach } from "vitest";
import { loginUser } from "./login-user.js";
import { MockAuthService } from "../../services/mocks/mock-auth-service.js";
import { UserRole } from "../../entities/user.js";

describe("loginUser", () => {
  let authService: MockAuthService;

  beforeEach(() => {
    authService = new MockAuthService([
      {
        id: "1",
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test("should login successfully with valid credentials", async () => {
    const result = await loginUser(
      { authService },
      { email: "test@example.com", password: "password123" }
    );

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("test@example.com");
    expect(result.token).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test("should fail with invalid email", async () => {
    const result = await loginUser(
      { authService },
      { email: "wrong@example.com", password: "password123" }
    );

    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.token).toBeUndefined();
    expect(result.error).toBe("User not found");
  });

  test("should fail with invalid password", async () => {
    const result = await loginUser(
      { authService },
      { email: "test@example.com", password: "wrongpassword" }
    );

    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.token).toBeUndefined();
    expect(result.error).toBe("Invalid password");
  });

  test("should fail with empty email", async () => {
    const result = await loginUser(
      { authService },
      { email: "", password: "password123" }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email and password are required");
  });

  test("should fail with empty password", async () => {
    const result = await loginUser(
      { authService },
      { email: "test@example.com", password: "" }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email and password are required");
  });

  test("should normalize email to lowercase", async () => {
    const result = await loginUser(
      { authService },
      { email: "TEST@EXAMPLE.COM", password: "password123" }
    );

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("test@example.com");
  });
});