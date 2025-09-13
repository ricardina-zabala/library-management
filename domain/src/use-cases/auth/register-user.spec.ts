import { describe, expect, test, beforeEach } from "vitest";
import { registerUser } from "./register-user.js";
import { MockAuthService } from "../../services/mocks/mock-auth-service.js";
import { UserRole } from "../../entities/user.js";

describe("registerUser", () => {
  let authService: MockAuthService;

  beforeEach(() => {
    authService = new MockAuthService([
      {
        id: "1",
        email: "existing@example.com",
        password: "password123",
        firstName: "Existing",
        lastName: "User",
        role: UserRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test("should register successfully with valid data", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "new@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe"
      }
    );

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("new@example.com");
    expect(result.user?.firstName).toBe("John");
    expect(result.user?.lastName).toBe("Doe");
    expect(result.user?.role).toBe(UserRole.MEMBER);
    expect(result.token).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test("should register with specified role", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "librarian@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Smith",
        role: UserRole.LIBRARIAN
      }
    );

    expect(result.success).toBe(true);
    expect(result.user?.role).toBe(UserRole.LIBRARIAN);
  });

  test("should fail with existing email", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "existing@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe"
      }
    );

    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.token).toBeUndefined();
    expect(result.error).toBe("User already exists");
  });

  test("should fail with empty email", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "",
        password: "password123",
        firstName: "John",
        lastName: "Doe"
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  test("should fail with empty password", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "test@example.com",
        password: "",
        firstName: "John",
        lastName: "Doe"
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  test("should fail with short password", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "test@example.com",
        password: "123",
        firstName: "John",
        lastName: "Doe"
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Password must be at least 6 characters long");
  });

  test("should fail with empty firstName", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "test@example.com",
        password: "password123",
        firstName: "",
        lastName: "Doe"
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  test("should fail with empty lastName", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: ""
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  test("should normalize email and trim names", async () => {
    const result = await registerUser(
      { authService },
      {
        email: "  TEST@EXAMPLE.COM  ",
        password: "password123",
        firstName: "  John  ",
        lastName: "  Doe  "
      }
    );

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("test@example.com");
    expect(result.user?.firstName).toBe("John");
    expect(result.user?.lastName).toBe("Doe");
  });
});