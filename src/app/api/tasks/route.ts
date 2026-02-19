import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { CreateTaskInput, UpdateTaskInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');
    const priority = searchParams.get('priority');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (assignee) where.assignee = assignee;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskInput = await request.json();
    
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        assignee: body.assignee || 'ANDREW',
        status: 'TODO',
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        source: body.source || null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const body: UpdateTaskInput = await request.json();
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.assignee && { assignee: body.assignee }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}