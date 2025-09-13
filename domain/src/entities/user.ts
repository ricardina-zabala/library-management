export enum UserRole {
  MEMBER = 'member',
  LIBRARIAN = 'librarian',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}