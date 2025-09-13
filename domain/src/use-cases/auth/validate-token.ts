import type { AuthService } from "../../services/auth-service.js";

export interface ValidateTokenDeps {
  authService: AuthService;
}

export interface ValidateTokenPayload {
  token: string;
}

export async function validateToken(
  deps: ValidateTokenDeps,
  payload: ValidateTokenPayload
) {
  if (!payload.token) {
    return {
      success: false,
      error: "Token is required"
    };
  }

  const user = await deps.authService.validateToken(payload.token);
  
  if (!user) {
    return {
      success: false,
      error: "Invalid or expired token"
    };
  }

  return {
    success: true,
    user
  };
}