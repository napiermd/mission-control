import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';

export async function GET() {
  const data = await readData<{ tasks: any[] }>('tasks.json');
  return NextResponse.json(data.tasks || []);
}

export async function POST(request: Request) {
  const task = await request.json();
  const data = await readData<{ tasks: any[] }>('tasks.json');
  data.tasks = data.tasks || [];
  data.tasks.push({ ...task, id: Date.now().toString() });
  await writeData('tasks.json', data);
  return NextResponse.json({ success: true });
}
