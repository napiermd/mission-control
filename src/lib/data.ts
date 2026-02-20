import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function readData<T>(file: string): Promise<T> {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(content);
  } catch {
    return {} as T;
  }
}

export async function writeData<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}
