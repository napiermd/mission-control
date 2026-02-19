// Types matching Prisma schema

export type Assignee = 'ANDREW' | 'CLAW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: Assignee;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | string;
  source?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type ContentStage = 'IDEA' | 'SCRIPT' | 'THUMBNAIL' | 'FILMING' | 'PUBLISHED';

export interface ContentItem {
  id: string;
  title: string;
  stage: ContentStage;
  script?: string;
  thumbnailUrl?: string;
  notes?: string;
  publishedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  recurrence?: string;
  status: string;
  source: string;
  color: string;
  lastRun?: Date | string;
  nextRun?: Date | string;
}

export type MemoryType = 'DAILY' | 'PREFERENCE' | 'LEARNING' | 'DECISION' | 'PERSON' | 'PROJECT';

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  category?: string;
  date: Date | string;
  source: string;
  vector?: string;
  createdAt: Date | string;
}

export type AgentStatus = 'WORKING' | 'IDLE' | 'OFFLINE';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  currentTask: string;
  status: AgentStatus;
  responsibilities: string;
}

// API Request/Response types
export interface CreateTaskInput {
  title: string;
  description?: string;
  assignee?: Assignee;
  priority?: Priority;
  dueDate?: string;
  source?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignee?: Assignee;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
}

export interface CreateContentInput {
  title: string;
  notes?: string;
}

export interface UpdateContentInput {
  title?: string;
  stage?: ContentStage;
  script?: string;
  thumbnailUrl?: string;
  notes?: string;
  publishedAt?: string;
}

export interface CreateEventInput {
  title: string;
  time: string;
  recurrence?: string;
  source?: string;
  color?: string;
}

export interface UpdateEventInput {
  title?: string;
  time?: string;
  recurrence?: string;
  status?: string;
  lastRun?: string;
  nextRun?: string;
}

export interface CreateMemoryInput {
  type: MemoryType;
  content: string;
  category?: string;
  date: string;
  source?: string;
}

export interface UpdateTeamMemberInput {
  currentTask?: string;
  status?: AgentStatus;
}