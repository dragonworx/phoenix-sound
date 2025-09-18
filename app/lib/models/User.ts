import pool from '../db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async create(username: string, password: string, email: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, email]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}