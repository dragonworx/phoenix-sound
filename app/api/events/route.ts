import { NextRequest, NextResponse } from 'next/server';
import { EventModel } from '@/lib/models/Event';
import { requireAuthAPI } from '@/lib/auth';

export async function GET() {
  try {
    const events = await EventModel.findAll();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuthAPI();

    const { title, description, date } = await request.json();

    if (!title || !date) {
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      );
    }

    const event = await EventModel.create(title, description || '', new Date(date));
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}