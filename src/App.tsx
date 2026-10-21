import React, { useState, useEffect, useRef } from 'react';
import {
  Task,
  StudySession,
  UserSettings,
  NavTab,
  SessionType,
} from './types';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredSessions,
  saveStoredSessions,
  getStoredSettings,
  saveStoredSettings,
  resetAllToSample,
  clearAllLocalData,
} from './utils/storage';
import { playSessionCompleteChime } from './utils/audio';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { TaskModal } from './components/tasks/TaskModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { PlannerView } from './components/planner/PlannerView';
import { TimerView } from './components/timer/TimerView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AssistantView } from './components/assistant/AssistantView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Application Data States
  const [tasks, setTasks] = useState<Task[]>(() => getStoredTasks());
  const [sessions, setSessions] = useState<StudySession[]>(() => getStoredSessions());
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Selected task attached to timer
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<Task | null>(null);

  // Pomodoro Focus Timer Shared State
  const [currentTimerMode, setCurrentTimerMode] = useState<SessionType>('pomodoro');
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => (settings.pomodoroLength || 25) * 60);
  const [completedPomodorosCount, setCompletedPomodorosCount] = useState<number>(0);

  // Reference for accurate background timing
  const timerEndTimeRef = useRef<number | null>(null);

  // Synchronize theme with document.documentElement
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist tasks when changed
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  };

  // Persist sessions when changed
  const updateSessions = (newSessions: StudySession[]) => {
    setSessions(newSessions);
    saveStoredSessions(newSessions);
  };

  // Persist settings when changed
  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Toggle Theme helper
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ ...settings, theme: nextTheme });
  };

  // Background-accurate timer effect using Date.now() timestamp diffing
  useEffect(() => {
    let intervalId: any = null;

    if (timerActive) {
      // Set target end timestamp if not already set
      if (!timerEndTimeRef.current) {
        timerEndTimeRef.current = Date.now() + secondsRemaining * 1000;
      }

      intervalId = setInterval(() => {
        if (!timerEndTimeRef.current) return;
        const now = Date.now();
        const diffMs = timerEndTimeRef.current - now;
        const remaining = Math.max(0, Math.round(diffMs / 1000));

        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(intervalId);
          timerEndTimeRef.current = null;
          setTimerActive(false);
          playSessionCompleteChime(settings.soundEnabled);

          // Auto-log focus session
          if (currentTimerMode === 'pomodoro') {
            const duration = settings.pomodoroLength || 25;
            const newSession: StudySession = {
              id: `session-${Date.now()}`,
              taskId: selectedTaskForTimer ? selectedTaskForTimer.id : null,
              taskTitle: selectedTaskForTimer ? selectedTaskForTimer.title : 'General Academic Focus',
              subject: selectedTaskForTimer ? selectedTaskForTimer.subject : 'Independent Study',
              durationMinutes: duration,
              type: 'pomodoro',
              timestamp: new Date().toISOString(),
            };
            const updated = [newSession, ...sessions];
            updateSessions(updated);

            const nextCount = completedPomodorosCount + 1;
            setCompletedPomodorosCount(nextCount);

            // Auto-advance mode
            if (nextCount % 4 === 0) {
              setCurrentTimerMode('long_break');
              setSecondsRemaining((settings.longBreakLength || 15) * 60);
            } else {
              setCurrentTimerMode('short_break');
              setSecondsRemaining((settings.shortBreakLength || 5) * 60);
            }
          } else {
            // Break ended -> switch back to pomodoro
            setCurrentTimerMode('pomodoro');
            setSecondsRemaining((settings.pomodoroLength || 25) * 60);
          }
        }
      }, 300);
    } else {
      // Paused: clear end time ref so next resume recalculates from remaining seconds
      timerEndTimeRef.current = null;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerActive, secondsRemaining, currentTimerMode, selectedTaskForTimer, completedPomodorosCount, sessions, settings]);

  // Window visibility change listener to immediately sync accurate countdown
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerActive && timerEndTimeRef.current) {
        const remaining = Math.max(0, Math.round((timerEndTimeRef.current - Date.now()) / 1000));
        setSecondsRemaining(remaining);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerActive]);

  // Task creation and editing
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'isSample'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing
      const updated = tasks.map((t) =>
        t.id === taskData.id
          ? {
              ...t,
              ...taskData,
            }
          : t
      );
      updateTasks(updated);
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        subject: taskData.subject,
        description: taskData.description,
        deadline: taskData.deadline,
        priority: taskData.priority,
        category: taskData.category,
        estimatedDuration: taskData.estimatedDuration,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        isSample: false,
      };
      updateTasks([newTask, ...tasks]);
    }
    setEditingTask(null);
  };

  // Toggle complete / reopen
  const handleToggleTaskComplete = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const willBeComplete = !t.completed;
        return {
          ...t,
          completed: willBeComplete,
          completedAt: willBeComplete ? new Date().toISOString() : null,
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
    if (selectedTaskForTimer?.id === taskId) {
      setSelectedTaskForTimer(null);
    }
  };

  // Start timer on specific task
  const handleSelectTaskForTimer = (task: Task) => {
    setSelectedTaskForTimer(task);
    setCurrentTimerMode('pomodoro');
    setSecondsRemaining((settings.pomodoroLength || 25) * 60);
    setCurrentTab('timer');
  };

  // Explicit session save from Timer view
  const handleSaveSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `session-${Date.now()}`,
    };
    const updated = [newSession, ...sessions];
    updateSessions(updated);
  };

  // Reset to Demo Sample Data
  const handleResetSampleData = () => {
    const { tasks: t, sessions: s, settings: st } = resetAllToSample();
    setTasks(t);
    setSessions(s);
    setSettings(st);
    setSelectedTaskForTimer(null);
    setTimerActive(false);
    setSecondsRemaining(st.pomodoroLength * 60);
  };

  // Clear All Data
  const handleClearAllData = () => {
    clearAllLocalData();
    setTasks([]);
    setSessions([]);
    setSelectedTaskForTimer(null);
    setTimerActive(false);
  };

  // Today's focus minutes for sidebar
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayFocusMinutes = sessions
    .filter((s) => new Date(s.timestamp).getTime() >= todayStart.getTime())
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingTasksCount={pendingTasksCount}
        todayFocusMinutes={todayFocusMinutes}
        settings={settings}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenNewTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          settings={settings}
          onToggleTheme={handleToggleTheme}
          timerActive={timerActive}
          timerSecondsRemaining={secondsRemaining}
          onToggleTimer={() => setTimerActive(!timerActive)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              sessions={sessions}
              settings={settings}
              onNavigate={setCurrentTab}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onToggleTaskComplete={handleToggleTaskComplete}
              onSelectTaskForTimer={handleSelectTaskForTimer}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onOpenTaskModal={(task) => {
                setEditingTask(task || null);
                setIsTaskModalOpen(true);
              }}
              onToggleComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              onSelectForTimer={handleSelectTaskForTimer}
            />
          )}

          {currentTab === 'planner' && (
            <PlannerView
              tasks={tasks}
              onSelectTaskForTimer={handleSelectTaskForTimer}
              onToggleTaskComplete={handleToggleTaskComplete}
            />
          )}

          {currentTab === 'timer' && (
            <TimerView
              tasks={tasks}
              sessions={sessions}
              settings={settings}
              selectedTask={selectedTaskForTimer}
              onSelectTask={setSelectedTaskForTimer}
              onSaveSession={handleSaveSession}
              timerActive={timerActive}
              setTimerActive={setTimerActive}
              secondsRemaining={secondsRemaining}
              setSecondsRemaining={setSecondsRemaining}
              currentMode={currentTimerMode}
              setCurrentMode={setCurrentTimerMode}
              completedPomodorosCount={completedPomodorosCount}
              setCompletedPomodorosCount={setCompletedPomodorosCount}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              tasks={tasks}
              sessions={sessions}
              settings={settings}
            />
          )}

          {currentTab === 'assistant' && (
            <AssistantView
              tasks={tasks}
              settings={settings}
              todayFocusMinutes={todayFocusMinutes}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              tasks={tasks}
              sessions={sessions}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">StudySphere AI</span>
            <span>—</span>
            <span>Plan smarter. Focus better. Learn consistently.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Local Storage Active</span>
            <span>·</span>
            <span>Zero Remote Telemetry</span>
          </div>
        </footer>
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        initialTask={editingTask}
        onSave={handleSaveTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}
