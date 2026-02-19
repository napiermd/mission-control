import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { CreateContentInput, UpdateContentInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stage = searchParams.get('stage');

    const where: Record<string, unknown> = {};
    if (stage) where.stage = stage;

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContentInput = await request.json();
    
    const item = await prisma.contentItem.create({
      data: {
        title: body.title,
        stage: 'IDEA',
        notes: body.notes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    const body: UpdateContentInput = await request.json();
    
    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.stage && { stage: body.stage }),
        ...(body.script !== undefined && { script: body.script }),
        ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.publishedAt && { publishedAt: new Date(body.publishedAt) }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    await prisma.contentItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}