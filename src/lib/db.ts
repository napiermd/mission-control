import { PrismaClient } from '@prisma/client';
import { syncMemoriesFromFilesystem } from './memory-sync';
import { syncCronJobsToCalendar } from './cron-sync';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function seedInitialData() {
  console.log('🌱 Seeding initial data...');

  // Seed Team Members (from 12 agent systems)
  const teamMembers = [
    { id: 'main-agent', name: 'Main Agent', role: 'Orchestrator', department: 'Core', avatar: '🤖', currentTask: 'Managing operations', status: 'WORKING', responsibilities: 'Overall coordination and task management' },
    { id: 'claw-agent', name: 'Claw', role: 'Terminal Agent', department: 'Execution', avatar: '🦀', currentTask: 'Running commands', status: 'IDLE', responsibilities: 'Shell commands and file operations' },
    { id: 'browser-agent', name: 'Browser Agent', role: 'Web Automation', department: 'Execution', avatar: '🌐', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Browser control and web automation' },
    { id: 'research-agent', name: 'Research Agent', role: 'Information Retrieval', department: 'Intelligence', avatar: '🔍', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Web search and knowledge gathering' },
    { id: 'email-agent', name: 'Email Agent', role: 'Communication', department: 'Operations', avatar: '📧', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Email management and notifications' },
    { id: 'calendar-agent', name: 'Calendar Agent', role: 'Scheduling', department: 'Operations', avatar: '📅', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Calendar management and scheduling' },
    { id: 'crm-agent', name: 'CRM Agent', role: 'Sales Operations', department: 'Business', avatar: '💼', currentTask: 'Idle', status: 'IDLE', responsibilities: 'HubSpot and pipeline management' },
    { id: 'finance-agent', name: 'Finance Agent', role: 'Financial Tracking', department: 'Business', avatar: '💰', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Brex and expense tracking' },
    { id: 'meeting-agent', name: 'Meeting Prep Agent', role: 'Meeting Support', department: 'Operations', avatar: '🤝', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Meeting preparation and notes' },
    { id: 'knowledge-agent', name: 'Knowledge Agent', role: 'Knowledge Base', department: 'Intelligence', avatar: '📚', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Knowledge management and search' },
    { id: 'voice-agent', name: 'Voice Agent', role: 'Audio Production', department: 'Content', avatar: '🎙️', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Voice synthesis and audio content' },
    { id: 'canvas-agent', name: 'Canvas Agent', role: 'UI Presentation', department: 'Content', avatar: '🎨', currentTask: 'Idle', status: 'IDLE', responsibilities: 'Canvas presentation and UI rendering' },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: member.id },
      update: member,
      create: member,
    });
  }
  console.log('✅ Team members seeded');

  // Seed sample tasks
  const sampleTasks = [
    { title: 'Review morning briefing', assignee: 'ANDREW' as const, status: 'TODO' as const, priority: 'HIGH' as const, source: 'system' },
    { title: 'Check calendar for meetings', assignee: 'CLAW' as const, status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, source: 'system' },
    { title: 'Process pending emails', assignee: 'ANDREW' as const, status: 'TODO' as const, priority: 'MEDIUM' as const, source: 'system' },
    { title: 'Update CRM pipeline', assignee: 'CLAW' as const, status: 'TODO' as const, priority: 'LOW' as const, source: 'system' },
  ];

  for (const task of sampleTasks) {
    await prisma.task.upsert({
      where: { id: `task-${task.title.toLowerCase().replace(/\s/g, '-')}` },
      update: task,
      create: { id: `task-${task.title.toLowerCase().replace(/\s/g, '-')}`, ...task },
    });
  }
  console.log('✅ Sample tasks seeded');

  // Seed sample content items
  const sampleContent = [
    { title: 'IntuBlade Demo Video', stage: 'IDEA' as const, notes: 'Create demo for Montgomery County EMS pilot' },
    { title: 'Product Update Announcement', stage: 'SCRIPT' as const, notes: 'New features coming in Q1' },
    { title: 'Customer Testimonial - Fairfax', stage: 'THUMBNAIL' as const, notes: 'Interview with fire chief' },
    { title: 'How-To: API Integration', stage: 'FILMING' as const, notes: 'Technical tutorial series' },
  ];

  for (const content of sampleContent) {
    await prisma.contentItem.upsert({
      where: { id: `content-${content.title.toLowerCase().replace(/\s/g, '-')}` },
      update: content,
      create: { id: `content-${content.title.toLowerCase().replace(/\s/g, '-')}`, ...content },
    });
  }
  console.log('✅ Sample content items seeded');

  // Sync memories from filesystem
  try {
    await syncMemoriesFromFilesystem();
    console.log('✅ Memories synced from filesystem');
  } catch (error) {
    console.log('⚠️ Memory sync skipped:', error);
  }

  // Sync cron jobs to calendar
  try {
    await syncCronJobsToCalendar();
    console.log('✅ Cron jobs synced to calendar');
  } catch (error) {
    console.log('⚠️ Cron sync skipped:', error);
  }

  console.log('🌱 Seeding complete!');
}

export default prisma;