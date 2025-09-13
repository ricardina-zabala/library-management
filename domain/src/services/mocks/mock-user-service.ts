import type { UserService, CreateUserData, UpdateUserData } from "../user-service.js";
import type { User, UserRole } from "../../entities/user.js";

export class MockUserService implements UserService {
  public users: User[] = [];

  async create(userData: CreateUserData): Promise<User> {
    const user: User = {
      id: (this.users.length + 1).toString(),
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
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

  async update(id: string, userData: UpdateUserData): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (!user) return undefined;

    if (userData.email !== undefined) user.email = userData.email;
    if (userData.firstName !== undefined) user.firstName = userData.firstName;
    if (userData.lastName !== undefined) user.lastName = userData.lastName;
    if (userData.role !== undefined) user.role = userData.role;
    user.updatedAt = new Date();

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.users.filter(user => user.role === role);
  }
}