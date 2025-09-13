import type { AuthService, LoginCredentials, RegisterData, AuthResult } from "../auth-service.js";
import type { User, UserRole } from "../../entities/user.js";

export class MockAuthService implements AuthService {
  private users: User[] = [];
  private tokens: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    this.users = [...initialUsers];
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const user = this.users.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        success: false,
        error: "User not found"
      };
    }

    // Simple password check (in real implementation, use bcrypt)
    if (user.password !== credentials.password) {
      return {
        success: false,
        error: "Invalid password"
      };
    }

    const token = `token_${user.id}_${Date.now()}`;
    this.tokens.set(token, user);

    return {
      success: true,
      user,
      token
    };
  }

  async register(data: RegisterData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === data.email);
    if (existingUser) {
      return {
        success: false,
        error: "User already exists"
      };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      password: data.password, // In real implementation, hash this
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'member' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);

    const token = `token_${newUser.id}_${Date.now()}`;
    this.tokens.set(token, newUser);

    return {
      success: true,
      user: newUser,
      token
    };
  }

  async validateToken(token: string): Promise<User | null> {
    return this.tokens.get(token) || null;
  }

  async hashPassword(password: string): Promise<string> {
    // Mock implementation - in real app use bcrypt
    return `hashed_${password}`;
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    // Mock implementation
    return `hashed_${password}` === hashedPassword;
  }

  // Helper methods for testing
  addUser(user: User): void {
    this.users.push(user);
  }

  getUsers(): User[] {
    return [...this.users];
  }

  clearUsers(): void {
    this.users = [];
    this.tokens.clear();
  }
}