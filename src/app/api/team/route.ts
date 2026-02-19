import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { UpdateTeamMemberInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (department) where.department = department;

    const members = await prisma.teamMember.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Team member ID required' }, { status: 400 });
    }

    const body: UpdateTeamMemberInput = await request.json();
    
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(body.currentTask && { currentTask: body.currentTask }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}