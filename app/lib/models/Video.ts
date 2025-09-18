import pool from '../db';

export interface Video {
  id: number;
  youtube_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: Date;
  updated_at: Date;
}

export class VideoModel {
  static async findAll(): Promise<Video[]> {
    const result = await pool.query('SELECT * FROM video ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: number): Promise<Video | null> {
    const result = await pool.query('SELECT * FROM video WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByYouTubeId(youtube_id: string): Promise<Video | null> {
    const result = await pool.query('SELECT * FROM video WHERE youtube_id = $1', [youtube_id]);
    return result.rows[0] || null;
  }

  static async create(youtube_id: string, title: string, description: string, thumbnail_url: string): Promise<Video> {
    const result = await pool.query(
      'INSERT INTO video (youtube_id, title, description, thumbnail_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [youtube_id, title, description, thumbnail_url]
    );
    return result.rows[0];
  }

  static async update(id: number, youtube_id: string, title: string, description: string, thumbnail_url: string): Promise<Video | null> {
    const result = await pool.query(
      'UPDATE video SET youtube_id = $1, title = $2, description = $3, thumbnail_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [youtube_id, title, description, thumbnail_url, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM video WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}