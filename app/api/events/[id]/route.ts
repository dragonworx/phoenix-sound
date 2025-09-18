import { NextRequest, NextResponse } from 'next/server';
import { EventModel } from '@/lib/models/Event';
import { requireAuthAPI } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await EventModel.findById(parseInt(params.id));
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthAPI();

    const { title, description, date } = await request.json();

    if (!title || !date) {
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      );
    }

    const event = await EventModel.update(
      parseInt(params.id),
      title,
      description || '',
      new Date(date)
    );

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Update event error:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthAPI();

    const success = await EventModel.delete(parseInt(params.id));
    if (!success) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
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