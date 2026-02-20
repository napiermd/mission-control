import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET() {
  const data = await readData<{ members: any[] }>('team.json');
  return NextResponse.json(data.members || []);
}
