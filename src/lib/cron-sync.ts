import prisma from './db';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Simple cron expression parser for common patterns
function parseCronExpression(cronExpr: string): { time: string; recurrence: string } {
  const parts = cronExpr.split(' ');
  
  if (parts.length < 5) {
    return { time: cronExpr, recurrence: 'once' };
  }

  const [minute, hour, , , dayOfWeek] = parts;
  
  // Daily at specific time
  if (minute !== '*' && hour !== '*' && dayOfWeek === '*') {
    const h = hour.padStart(2, '0');
    const m = minute.padStart(2, '0');
    return { time: `${h}:${m}`, recurrence: 'daily' };
  }

  // Weekly
  if (dayOfWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[parseInt(dayOfWeek)] || dayOfWeek;
    const h = hour.padStart(2, '0');
    const m = minute.padStart(2, '0');
    return { time: `${h}:${m}`, recurrence: `weekly on ${day}` };
  }

  return { time: cronExpr, recurrence: 'custom' };
}

function getCronJobsFromKyberOS(): { title: string; schedule: string; source: string }[] {
  const cronJobs: { title: string; schedule: string; source: string }[] = [];
  
  // Check for crontab
  try {
    const crontabPath = path.join(os.homedir(), '.kyberos', 'crontab');
    if (fs.existsSync(crontabPath)) {
      const content = fs.readFileSync(crontabPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\s+(.+?)\s+(.+?)\s+\S+\s+(.+)$/);
        if (match) {
          const [, schedule, , , command] = match;
          const jobName = path.basename(command.replace(/[&\;].*$/, '')).replace(/_/g, ' ');
          cronJobs.push({
            title: jobName || 'Cron Job',
            schedule,
            source: 'kyberos crontab'
          });
        }
      }
    }
  } catch (error) {
    // Ignore errors reading crontab
  }

  // Add some default mission control cron jobs
  const defaultCrons = [
    { title: 'Morning Briefing', schedule: '0 7 * * *', source: 'mission-control' },
    { title: 'Health Check', schedule: '0 * * * *', source: 'mission-control' },
    { title: 'Memory Backup', schedule: '0 0 * * *', source: 'mission-control' },
    { title: 'Email Sync', schedule: '*/15 * * * *', source: 'mission-control' },
    { title: 'Calendar Sync', schedule: '*/30 * * * *', source: 'mission-control' },
  ];

  return [...cronJobs, ...defaultCrons];
}

export async function syncCronJobsToCalendar() {
  const cronJobs = getCronJobsFromKyberOS();
  console.log(`Found ${cronJobs.length} cron jobs`);

  for (const job of cronJobs) {
    const { time, recurrence } = parseCronExpression(job.schedule);
    
    // Check for duplicates by title + source
    const existing = await prisma.calendarEvent.findFirst({
      where: { 
        title: job.title,
        source: job.source
      },
    });

    if (!existing) {
      await prisma.calendarEvent.create({
        data: {
          title: job.title,
          time,
          recurrence,
          status: 'active',
          source: job.source,
          color: getColorForJob(job.title),
        },
      });
    }
  }

  return { synced: cronJobs.length };
}

function getColorForJob(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('email')) return 'green';
  if (titleLower.includes('calendar')) return 'blue';
  if (titleLower.includes('health')) return 'red';
  if (titleLower.includes('memory') || titleLower.includes('backup')) return 'purple';
  if (titleLower.includes('briefing') || titleLower.includes('morning')) return 'orange';
  return 'blue';
}

export default { syncCronJobsToCalendar };