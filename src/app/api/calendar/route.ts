import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { CreateEventInput, UpdateEventInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (source) where.source = source;

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { time: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEventInput = await request.json();
    
    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        time: body.time,
        recurrence: body.recurrence || null,
        status: 'active',
        source: body.source || 'manual',
        color: body.color || 'blue',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const body: UpdateEventInput = await request.json();
    
    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.time && { time: body.time }),
        ...(body.recurrence !== undefined && { recurrence: body.recurrence }),
        ...(body.status && { status: body.status }),
        ...(body.lastRun && { lastRun: new Date(body.lastRun) }),
        ...(body.nextRun && { nextRun: new Date(body.nextRun) }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}