import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { syncMemoriesFromFilesystem } from '@/lib/memory-sync';
import type { CreateMemoryInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (category) where.category = category;

    let memories = await prisma.memory.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Simple search filter
    if (search) {
      const searchLower = search.toLowerCase();
      memories = memories.filter(m => 
        m.content.toLowerCase().includes(searchLower) ||
        m.category?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action');
    
    if (action === 'sync') {
      // Sync from filesystem
      const result = await syncMemoriesFromFilesystem();
      return NextResponse.json(result);
    }

    const body: CreateMemoryInput = await request.json();
    
    const memory = await prisma.memory.create({
      data: {
        type: body.type,
        content: body.content,
        category: body.category || null,
        date: new Date(body.date),
        source: body.source || 'manual',
        vector: null,
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error('Error creating/syncing memory:', error);
    return NextResponse.json({ error: 'Failed to process memory' }, { status: 500 });
  }
}