import type { AuthService, LoginCredentials } from "../../services/auth-service.js";

export interface LoginUserDeps {
  authService: AuthService;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export async function loginUser(
  deps: LoginUserDeps,
  payload: LoginUserPayload
) {
  if (!payload.email || !payload.password) {
    return {
      success: false,
      error: "Email and password are required"
    };
  }

  const credentials: LoginCredentials = {
    email: payload.email.toLowerCase().trim(),
    password: payload.password
  };

  return await deps.authService.login(credentials);
}