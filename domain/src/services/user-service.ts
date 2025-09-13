import type { User, UserRole } from "../entities/user.js";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

export interface UserService {
  findById: (id: string) => Promise<User | undefined>;
  findByEmail: (email: string) => Promise<User | undefined>;
  findAll: () => Promise<User[]>;
  create: (userData: CreateUserData) => Promise<User>;
  update: (id: string, userData: UpdateUserData) => Promise<User | undefined>;
  delete: (id: string) => Promise<boolean>;
  findByRole: (role: UserRole) => Promise<User[]>;
}