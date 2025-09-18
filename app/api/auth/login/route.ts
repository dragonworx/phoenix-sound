import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await UserModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createSession({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}