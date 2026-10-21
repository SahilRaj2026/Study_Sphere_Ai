/**
 * StudySphere AI - Core Type Definitions
 */

export type Priority = 'high' | 'medium' | 'low';

export type TaskCategory = 'assignment' | 'exam_prep' | 'project' | 'personal';

export type TaskStatusFilter = 'all' | 'pending' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string; // ISO date string 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm'
  priority: Priority;
  category: TaskCategory;
  estimatedDuration: number; // in minutes (e.g. 25, 45, 60, 90)
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  isSample?: boolean;
}

export type SessionType = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface StudySession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  subject: string;
  durationMinutes: number;
  type: SessionType;
  timestamp: string; // ISO string
  isSample?: boolean;
}

export interface StudyPlanItem {
  id: string;
  taskId: string;
  taskTitle: string;
  subject: string;
  durationMinutes: number;
  suggestedStartTime: string;
  suggestedEndTime: string;
  priorityReason: string;
  category: TaskCategory;
  isBreak?: boolean;
  breakType?: 'short' | 'lunch' | 'walk';
  completed: boolean;
}

export interface UserSettings {
  studentName: string;
  dailyGoalMinutes: number;
  pomodoroLength: number; // default 25
  shortBreakLength: number; // default 5
  longBreakLength: number; // default 15
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export type NavTab =
  | 'dashboard'
  | 'tasks'
  | 'planner'
  | 'timer'
  | 'analytics'
  | 'assistant'
  | 'settings';
