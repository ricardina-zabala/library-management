import { describe, it, expect, beforeEach } from "vitest";
import { MockAuthService } from "../../services/mocks/mock-auth-service.js";
import { registerUser, type RegisterUserDeps } from "./register-user.js";
import { UserRole } from "../../entities/user.js";

describe("registerUser", () => {
  let deps: RegisterUserDeps;
  let mockAuthService: MockAuthService;

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    deps = {
      authService: mockAuthService
    };

    mockAuthService.clearUsers();
  });

  it("should successfully register a new user", async () => {
    const result = await registerUser(deps, {
      email: "newuser@example.com",
      password: "password123",
      firstName: "New",
      lastName: "User"
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user?.email).toBe("newuser@example.com");
    expect(result.user?.firstName).toBe("New");
    expect(result.user?.lastName).toBe("User");
    expect(result.user?.role).toBe(UserRole.MEMBER);
  });

  it("should register user with specified role", async () => {
    const result = await registerUser(deps, {
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.LIBRARIAN
    });

    expect(result.success).toBe(true);
    expect(result.user?.role).toBe(UserRole.LIBRARIAN);
  });

  it("should fail when email is missing", async () => {
    const result = await registerUser(deps, {
      email: "",
      password: "password123",
      firstName: "Test",
      lastName: "User"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  it("should fail when password is missing", async () => {
    const result = await registerUser(deps, {
      email: "test@example.com",
      password: "",
      firstName: "Test",
      lastName: "User"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  it("should fail when firstName is missing", async () => {
    const result = await registerUser(deps, {
      email: "test@example.com",
      password: "password123",
      firstName: "",
      lastName: "User"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  it("should fail when lastName is missing", async () => {
    const result = await registerUser(deps, {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: ""
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  it("should fail when password is too short", async () => {
    const result = await registerUser(deps, {
      email: "test@example.com",
      password: "123",
      firstName: "Test",
      lastName: "User"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Password must be at least 6 characters long");
  });

  it("should fail when user already exists", async () => {
    await registerUser(deps, {
      email: "existing@example.com",
      password: "password123",
      firstName: "Existing",
      lastName: "User"
    });

    const result = await registerUser(deps, {
      email: "existing@example.com",
      password: "password456",
      firstName: "Another",
      lastName: "User"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User already exists");
  });

  it("should trim and lowercase email", async () => {
    const result = await registerUser(deps, {
      email: "  TEST@EXAMPLE.COM  ",
      password: "password123",
      firstName: "  Test  ",
      lastName: "  User  "
    });

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("test@example.com");
    expect(result.user?.firstName).toBe("Test");
    expect(result.user?.lastName).toBe("User");
  });
});