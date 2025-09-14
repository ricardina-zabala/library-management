import type { AuthService, LoginCredentials, RegisterData, AuthResult } from "../auth-service.js";
import type { User, UserRole } from "../../entities/user.js";

export class MockAuthService implements AuthService {
  public users: User[] = [];
  private currentId = 1;

  constructor() {
    this.users = [];
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const user = this.users.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase() && 
      u.password === credentials.password
    );

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials"
      };
    }

    return {
      success: true,
      user,
      token: `mock-token-${user.id}`
    };
  }

  async register(data: RegisterData): Promise<AuthResult> {
    const existingUser = this.users.find(u => 
      u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existingUser) {
      return {
        success: false,
        error: "User already exists"
      };
    }

    const newUser: User = {
      id: this.currentId.toString(),
      email: data.email.toLowerCase(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || "MEMBER" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    this.currentId++;

    return {
      success: true,
      user: newUser,
      token: `mock-token-${newUser.id}`
    };
  }

  async validateToken(token: string): Promise<User | null> {
    const match = token.match(/mock-token-(\d+)/);
    if (!match) return null;

    const userId = match[1];
    return this.users.find(u => u.id === userId) || null;
  }

  async hashPassword(password: string): Promise<string> {
    return `hashed-${password}`;
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return hashedPassword === `hashed-${password}`;
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  clearUsers(): void {
    this.users = [];
    this.currentId = 1;
  }

  getUsers(): User[] {
    return [...this.users];
  }
}