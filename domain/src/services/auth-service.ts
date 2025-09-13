import type { User, UserRole } from "../entities/user.js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  validateToken: (token: string) => Promise<User | null>;
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
}