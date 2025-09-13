import type { UserService, CreateUserData, UpdateUserData } from "../user-service.js";
import type { User, UserRole } from "../../entities/user.js";

export class MockUserService implements UserService {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = [...initialUsers];
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async create(userData: CreateUserData): Promise<User> {
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random()}`,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, userData: UpdateUserData): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return undefined;
    }

    const updatedUser: User = {
      ...this.users[userIndex]!,
      ...userData,
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length < initialLength;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.users.filter(user => user.role === role);
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
  }
}