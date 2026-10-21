import React from 'react';
import { NavTab, UserSettings } from '../../types';
import { Plus, Sun, Moon, Play, Pause, Menu, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewTaskModal: () => void;
  settings: UserSettings;
  onToggleTheme: () => void;
  timerActive: boolean;
  timerSecondsRemaining: number;
  onToggleTimer: () => void;
  onOpenMobileMenu: () => void;
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Academic Overview',
  tasks: 'Assignments & Tasks',
  planner: 'Smart Study Planner',
  timer: 'Focus Pomodoro Timer',
  analytics: 'Progress Analytics',
  assistant: 'AI Study Strategist',
  settings: 'System & Data Settings',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenNewTaskModal,
  settings,
  onToggleTheme,
  timerActive,
  timerSecondsRemaining,
  onToggleTimer,
  onOpenMobileMenu,
}) => {
  const timerMinutes = Math.floor(timerSecondsRemaining / 60);
  const timerSeconds = timerSecondsRemaining % 60;
  const formattedTimer = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Zone 1: Mobile Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white capitalize tracking-tight whitespace-nowrap">
            {TAB_TITLES[currentTab]}
          </h1>
        </div>
      </div>

      {/* Zone 2: Timer quick toggle (if timer is running or paused) */}
      <div className="flex items-center gap-2 sm:gap-4">
        {timerSecondsRemaining > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs">
            <span className="font-mono tabular-nums font-semibold text-indigo-700 dark:text-indigo-300">
              {formattedTimer}
            </span>
            <button
              onClick={onToggleTimer}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 p-0.5"
              title={timerActive ? 'Pause Timer' : 'Resume Timer'}
            >
              {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={`Switch to ${settings.theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {settings.theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Zone 3: Primary Action Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
