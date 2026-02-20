import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET() {
  const data = await readData<{ items: any[] }>('content.json');
  return NextResponse.json(data.items || []);
}
