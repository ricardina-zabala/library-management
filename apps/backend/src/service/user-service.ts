import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { User, AuthService, UserService, LoginCredentials, RegisterData, AuthResult, CreateUserData, UpdateUserData } from 'app-domain';
import { UserRole } from 'app-domain';

export class DatabaseUserService implements AuthService, UserService {
  constructor(private db: Database.Database) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const user = await this.findByEmail(credentials.email);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isValid = await this.comparePassword(credentials.password, user.password);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      const token = this.generateToken(user);
      const userWithoutPassword = { 
        ...user, 
        password: '',
        name: `${user.firstName} ${user.lastName}`
      };

      return { success: true, user: userWithoutPassword, token };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      const hashedPassword = await this.hashPassword(data.password);
      const user: User = {
        id: crypto.randomUUID(),
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const stmt = this.db.prepare(`
        INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        user.id,
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        user.role,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      );

      const userWithoutPassword = { ...user, password: '' };
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = this.verifyToken(token) as any;
      if (!decoded || !decoded.id) return null;

      const user = await this.findById(decoded.id);
      return user ? { ...user, password: '' } : null;
    } catch {
      return null;
    }
  }

  async create(userData: RegisterData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user: User = {
      id: crypto.randomUUID(),
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.role,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    );

    return { ...user, password: '' };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;
    
    if (!row) return undefined;

    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return undefined;

    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return { ...user, password: '' };
  }

  generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY firstName ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      email: row.email,
      password: '', // Don't return passwords
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role as UserRole,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async update(id: string, userData: UpdateUserData): Promise<User | undefined> {
    const existingUser = await this.findById(id);
    if (!existingUser) return undefined;

    const updateFields: string[] = [];
    const values: any[] = [];

    if (userData.firstName !== undefined) {
      updateFields.push('firstName = ?');
      values.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      updateFields.push('lastName = ?');
      values.push(userData.lastName);
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.role !== undefined) {
      updateFields.push('role = ?');
      values.push(userData.role);
    }

    if (updateFields.length === 0) return existingUser;

    updateFields.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE role = ? ORDER BY firstName ASC');
    const rows = stmt.all(role) as any[];
    
    return rows.map(row => ({
      id: row.id,
      email: row.email,
      password: '', // Don't return passwords
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role as UserRole,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }
}