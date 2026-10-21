import { Task, StudySession, UserSettings } from '../types';
import { addDaysToDate, getTodayDateString } from './date';

const TASKS_KEY = 'studysphere_tasks_v1';
const SESSIONS_KEY = 'studysphere_sessions_v1';
const SETTINGS_KEY = 'studysphere_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  studentName: 'Alex Mercer',
  dailyGoalMinutes: 120, // 2 hours
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  theme: 'light',
  soundEnabled: true,
  autoStartBreaks: false,
};

export function getSampleTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sample-task-1',
      title: 'Graph Algorithms & Dijkstra Shortest Path Lab',
      subject: 'Computer Science',
      description: 'Implement adjacency matrix, priority queue min-heap, and test on 1,000 vertex benchmark graphs. Include time complexity writeup.',
      deadline: addDaysToDate(1), // Tomorrow
      priority: 'high',
      category: 'assignment',
      estimatedDuration: 90,
      completed: false,
      completedAt: null,
      createdAt: now,
      isSample: true,
    },
    {
      id: 'sample-task-2',
      title: 'Multivariable Calculus: Vector Fields & Green’s Theorem',
      subject: 'Mathematics',
      description: 'Work through problem set 6 exercises 14–32. Practice line integrals and curl calculations before quiz.',
      deadline: addDaysToDate(2),
      priority: 'high',
      category: 'assignment',
      estimatedDuration: 75,
      completed: false,
      completedAt: null,
      createdAt: now,
      isSample: true,
    },
    {
      id: 'sample-task-3',
      title: 'Distributed Systems: Midterm Comprehensive Review',
      subject: 'Computer Science',
      description: 'Review consensus protocols (Raft vs Paxos), CAP theorem trade-offs, and clock synchronization notes.',
      deadline: addDaysToDate(4),
      priority: 'high',
      category: 'exam_prep',
      estimatedDuration: 120,
      completed: false,
      completedAt: null,
      createdAt: now,
      isSample: true,
    },
    {
      id: 'sample-task-4',
      title: 'Cognitive Neuroscience Research Paper Rough Draft',
      subject: 'Psychology',
      description: 'Synthesize 5 peer-reviewed fMRI working memory papers into literature review and methodology outline.',
      deadline: addDaysToDate(6),
      priority: 'medium',
      category: 'project',
      estimatedDuration: 60,
      completed: false,
      completedAt: null,
      createdAt: now,
      isSample: true,
    },
    {
      id: 'sample-task-5',
      title: 'Organic Chemistry: Aldehyde & Ketone Reaction Mechanisms',
      subject: 'Chemistry',
      description: 'Active recall drill on Grignard additions, nucleophilic attacks, and hydration pathways using Anki deck.',
      deadline: addDaysToDate(3),
      priority: 'medium',
      category: 'exam_prep',
      estimatedDuration: 45,
      completed: false,
      completedAt: null,
      createdAt: now,
      isSample: true,
    },
    {
      id: 'sample-task-6',
      title: 'Undergraduate Research Seminar Consent Forms',
      subject: 'Personal',
      description: 'Review IRB participant protection clauses and sign digital consent forms on lab portal.',
      deadline: addDaysToDate(-1), // Completed yesterday
      priority: 'low',
      category: 'personal',
      estimatedDuration: 20,
      completed: true,
      completedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      createdAt: now,
      isSample: true,
    },
    {
      id: 'sample-task-7',
      title: 'Discrete Structures: Graph Coloring Proofs',
      subject: 'Mathematics',
      description: 'Prove chromatic number bounds for planar graphs and complete four-color theorem exercises.',
      deadline: addDaysToDate(-2), // Completed 2 days ago
      priority: 'medium',
      category: 'assignment',
      estimatedDuration: 50,
      completed: true,
      completedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      createdAt: now,
      isSample: true,
    },
  ];
}

export function getSampleSessions(): StudySession[] {
  const today = new Date();
  
  // Helper to generate sessions on recent days
  const createPastSession = (daysAgo: number, duration: number, subject: string, taskTitle: string): StudySession => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(14, 30, 0, 0);
    return {
      id: `sample-session-${daysAgo}-${duration}`,
      taskId: null,
      taskTitle,
      subject,
      durationMinutes: duration,
      type: 'pomodoro',
      timestamp: d.toISOString(),
      isSample: true,
    };
  };

  return [
    createPastSession(0, 50, 'Computer Science', 'Dijkstra Implementation & Heap Setup'),
    createPastSession(0, 25, 'Mathematics', 'Vector Field Line Integrals Review'),
    createPastSession(1, 50, 'Computer Science', 'Graph Representation Debugging'),
    createPastSession(1, 45, 'Mathematics', 'Green Theorem Practice'),
    createPastSession(2, 60, 'Chemistry', 'Organic Reaction Mechanisms Active Recall'),
    createPastSession(3, 75, 'Computer Science', 'Distributed Consensus Notes'),
    createPastSession(4, 50, 'Psychology', 'Neuroscience Literature Review Search'),
    createPastSession(5, 50, 'Mathematics', 'Discrete Math Proofs Drafting'),
  ];
}

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      const sample = getSampleTasks();
      saveStoredTasks(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read tasks from localStorage', e);
    return [];
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function getStoredSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      const sample = getSampleSessions();
      saveStoredSessions(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read sessions from localStorage', e);
    return [];
  }
}

export function saveStoredSessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveStoredSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to read settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function resetAllToSample(): { tasks: Task[]; sessions: StudySession[]; settings: UserSettings } {
  const sampleTasks = getSampleTasks();
  const sampleSessions = getSampleSessions();
  saveStoredTasks(sampleTasks);
  saveStoredSessions(sampleSessions);
  saveStoredSettings(DEFAULT_SETTINGS);
  return {
    tasks: sampleTasks,
    sessions: sampleSessions,
    settings: DEFAULT_SETTINGS,
  };
}

export function clearAllLocalData(): void {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
