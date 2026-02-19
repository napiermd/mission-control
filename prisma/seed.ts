import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Tasks
  const tasks = [
    { title: 'Review Q1 pipeline', description: 'Go through all leads and update status', assignee: 'ANDREW', status: 'TODO', priority: 'HIGH' },
    { title: 'Update HubSpot contacts', description: 'Sync latest contact changes', assignee: 'CLAW', status: 'IN_PROGRESS', priority: 'MEDIUM' },
    { title: 'Morning briefing prep', description: 'Prepare for daily standup', assignee: 'ANDREW', status: 'DONE', priority: 'HIGH' },
    { title: 'Review pilot expirations', description: 'Check pilots expiring in 14 days', assignee: 'CLAW', status: 'TODO', priority: 'URGENT' },
    { title: 'Email triage', description: 'Process VIP emails', assignee: 'ANDREW', status: 'TODO', priority: 'MEDIUM' },
    { title: 'Calendar sync', description: 'Ensure all calendars aligned', assignee: 'CLAW', status: 'DONE', priority: 'LOW' },
  ]
  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  // Seed Content Pipeline
  const content = [
    { title: 'IntuBlade Demo Video', stage: 'FILMING', notes: 'Need to schedule filming session' },
    { title: 'Product Update Announcement', stage: 'SCRIPT', script: 'Draft 1 complete' },
    { title: 'Customer Testimonial - Montgomery County', stage: 'PUBLISHED', notes: 'Published on website' },
    { title: 'New Feature Launch', stage: 'IDEA', notes: 'Planning stage' },
    { title: 'Tutorial Series', stage: 'THUMBNAIL', notes: 'Thumbnail designs ready' },
  ]
  for (const item of content) {
    await prisma.contentItem.create({ data: item })
  }

  // Seed Calendar Events
  const events = [
    { title: 'Daily Standup', time: '09:00', recurrence: 'weekday', source: 'google', color: 'blue' },
    { title: 'Team Sync', time: '14:00', recurrence: 'tuesday', source: 'google', color: 'green' },
    { title: 'Focus Block', time: '10:00', recurrence: 'daily', source: 'manual', color: 'purple' },
    { title: 'Review Meetings', time: '16:00', recurrence: 'friday', source: 'google', color: 'yellow' },
  ]
  for (const event of events) {
    await prisma.calendarEvent.create({ data: event })
  }

  // Seed Memories
  const memories = [
    { type: 'PREFERENCE', content: 'Prefers morning meetings before 11am', category: 'work', date: new Date(), source: 'learned' },
    { type: 'LEARNING', content: 'Vietnamese: Maximum 1-2 words per conversation for learning', category: 'language', date: new Date(), source: 'preference' },
    { type: 'DECISION', content: 'Use Supabase for KyberOS data storage', category: 'technical', date: new Date(), source: 'decision' },
    { type: 'PERSON', content: 'Zach Adams - Montgomery County EMS POC', category: 'contact', date: new Date(), source: 'crm' },
  ]
  for (const memory of memories) {
    await prisma.memory.create({ data: memory })
  }

  // Seed Team Members
  const team = [
    { name: 'Andrew Napier', role: 'CEO', department: 'Leadership', avatar: '👨‍💼', currentTask: 'Strategic Planning', status: 'WORKING', responsibilities: 'Company vision, partnerships, fundraising' },
    { name: 'Claw Agent', role: 'AI Assistant', department: 'Operations', avatar: '🤖', currentTask: 'Task Automation', status: 'WORKING', responsibilities: 'Automation, data processing, scheduling' },
    { name: 'Katarina Root', role: 'Sales Lead', department: 'Sales', avatar: '👩‍💼', currentTask: 'Pipeline Review', status: 'IDLE', responsibilities: 'Enterprise sales, demos' },
    { name: 'Matt M', role: 'Account Executive', department: 'Sales', avatar: '👨‍💻', currentTask: 'Client Calls', status: 'WORKING', responsibilities: 'SMB accounts, follow-ups' },
  ]
  for (const member of team) {
    await prisma.teamMember.create({ data: member })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
