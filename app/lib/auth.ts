import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export async function createSession(user: AuthUser) {
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  (await cookies()).set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

export async function getSession(): Promise<AuthUser | null> {
  const token = (await cookies()).get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    return payload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete('auth-token');
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    redirect('/admin/login');
  }
  return user;
}

export function requireAuthAPI() {
  return new Promise<AuthUser>((resolve, reject) => {
    getSession().then(user => {
      if (!user) {
        reject(new Error('Unauthorized'));
      } else {
        resolve(user);
      }
    }).catch(reject);
  });
}