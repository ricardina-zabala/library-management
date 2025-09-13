import type { AuthService, RegisterData } from "../../services/auth-service.js";
import { UserRole } from "../../entities/user.js";

export interface RegisterUserDeps {
  authService: AuthService;
}

export interface RegisterUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export async function registerUser(
  deps: RegisterUserDeps,
  payload: RegisterUserPayload
) {
  if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
    return {
      success: false,
      error: "All fields are required"
    };
  }

  if (payload.password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long"
    };
  }

  const registerData: RegisterData = {
    email: payload.email.toLowerCase().trim(),
    password: payload.password,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    role: payload.role || UserRole.MEMBER
  };

  return await deps.authService.register(registerData);
}