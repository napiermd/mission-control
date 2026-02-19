import prisma from './db';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface FrontmatterResult {
  data: Record<string, string>;
  content: string;
}

function parseFrontmatter(fileContent: string): FrontmatterResult {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: fileContent };
  }

  const frontmatterBlock = match[1];
  const content = match[2];

  const data: Record<string, string> = {};
  frontmatterBlock.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      data[key] = value;
    }
  });

  return { data, content };
}

function getMemoryFiles(): string[] {
  const memoryDir = path.join(os.homedir(), '.openclaw', 'workspace', 'memory');
  const files: string[] = [];

  if (!fs.existsSync(memoryDir)) {
    console.log('⚠️ Memory directory does not exist:', memoryDir);
    return files;
  }

  const entries = fs.readdirSync(memoryDir);
  for (const entry of entries) {
    if (entry.endsWith('.md')) {
      files.push(path.join(memoryDir, entry));
    }
  }

  return files;
}

export async function syncMemoriesFromFilesystem() {
  const files = getMemoryFiles();
  console.log(`Found ${files.length} memory files`);

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, content: body } = parseFrontmatter(content);

      // Determine memory type from filename or frontmatter
      const fileName = path.basename(filePath, '.md');
      let type: 'DAILY' | 'PREFERENCE' | 'LEARNING' | 'DECISION' | 'PERSON' | 'PROJECT' = 'DAILY';

      if (fileName.includes('MEMORY')) {
        type = 'DECISION';
      } else if (data.type) {
        type = data.type.toUpperCase() as typeof type;
      }

      // Parse date from filename (YYYY-MM-DD) or use now
      let date = new Date();
      const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        date = new Date(dateMatch[1]);
      }

      // Check for duplicates by source
      const existing = await prisma.memory.findFirst({
        where: { source: filePath },
      });

      if (!existing) {
        await prisma.memory.create({
          data: {
            type,
            content: body.trim(),
            category: data.category || null,
            date,
            source: filePath,
            vector: null,
          },
        });
      }
    } catch (error) {
      console.error(`Error processing memory file ${filePath}:`, error);
    }
  }

  return { synced: files.length };
}

export default { syncMemoriesFromFilesystem };