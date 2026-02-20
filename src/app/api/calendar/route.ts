import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET() {
  const data = await readData<{ events: any[] }>('calendar.json');
  return NextResponse.json(data.events || []);
}
