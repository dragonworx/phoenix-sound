import pool from '../db';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

export class EventModel {
  static async findAll(): Promise<Event[]> {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    return result.rows;
  }

  static async findById(id: number): Promise<Event | null> {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(title: string, description: string, date: Date): Promise<Event> {
    const result = await pool.query(
      'INSERT INTO events (title, description, date) VALUES ($1, $2, $3) RETURNING *',
      [title, description, date]
    );
    return result.rows[0];
  }

  static async update(id: number, title: string, description: string, date: Date): Promise<Event | null> {
    const result = await pool.query(
      'UPDATE events SET title = $1, description = $2, date = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, description, date, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}