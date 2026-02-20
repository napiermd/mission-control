import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET() {
  const data = await readData<{ memories: any[] }>('memories.json');
  return NextResponse.json(data.memories || []);
}
