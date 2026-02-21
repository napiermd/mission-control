-- Seed initial data
insert into mc_tasks (title, assignee, status, priority) values
  ('Review morning briefing', 'ANDREW', 'TODO', 'HIGH'),
  ('Check calendar for meetings', 'CLAW', 'IN_PROGRESS', 'MEDIUM'),
  ('Process pending emails', 'ANDREW', 'TODO', 'MEDIUM')
on conflict do nothing;

insert into mc_content (title, stage, notes) values
  ('IntuBlade Demo Video', 'IDEA', 'Create demo for Montgomery County EMS'),
  ('Product Update Announcement', 'SCRIPT', 'New features coming in Q1'),
  ('Customer Testimonial - Fairfax', 'THUMBNAIL', 'Interview with fire chief')
on conflict do nothing;

insert into mc_team (id, name, role, department, avatar, current_task, status) values
  ('claw', 'Claw', 'Executive AI Assistant', 'Executive', '🦅', 'Managing all systems', 'WORKING'),
  ('crm-agent', 'CRM Agent', 'Lead Developer', 'Engineering', '👨‍💻', 'Syncing contacts', 'WORKING'),
  ('business-council', 'Business Council', 'Chief Analyst', 'Intelligence', '📊', 'Preparing nightly analysis', 'WORKING')
on conflict do nothing;

insert into mc_memories (type, content, date, category) values
  ('PREFERENCE', 'Andrew prefers direct, concise communication. Military-adjacent style.', '2026-02-10', 'Communication'),
  ('LEARNING', 'KyberOS requires KYBER_SERVICE_KEY environment variable. Use keychain.', '2026-02-11', 'Technical'),
  ('DECISION', 'Use Kimi K2.5 as default model, MiniMax for coding subagents.', '2026-02-09', 'AI Configuration')
on conflict do nothing;

insert into mc_calendar (title, time, recurrence, status) values
  ('Business Council', '2:00 AM', 'daily', 'active'),
  ('Security Council', '3:30 AM', 'daily', 'active'),
  ('Daily Briefing', '7:00 AM', 'daily', 'active')
on conflict do nothing;
