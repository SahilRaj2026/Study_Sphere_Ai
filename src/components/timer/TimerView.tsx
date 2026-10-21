import React, { useState, useEffect, useRef } from 'react';
import { Task, StudySession, UserSettings, SessionType } from '../../types';
import { playSessionCompleteChime, playStartClick } from '../../utils/audio';
import { formatTime } from '../../utils/date';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  Flame,
  Clock,
  History,
} from 'lucide-react';

interface TimerViewProps {
  tasks: Task[];
  sessions: StudySession[];
  settings: UserSettings;
  selectedTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onSaveSession: (session: Omit<StudySession, 'id'>) => void;
  // Shared timer state across app
  timerActive: boolean;
  setTimerActive: (active: boolean) => void;
  secondsRemaining: number;
  setSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  currentMode: SessionType;
  setCurrentMode: (mode: SessionType) => void;
  completedPomodorosCount: number;
  setCompletedPomodorosCount: React.Dispatch<React.SetStateAction<number>>;
}

export const TimerView: React.FC<TimerViewProps> = ({
  tasks,
  sessions,
  settings,
  selectedTask,
  onSelectTask,
  onSaveSession,
  timerActive,
  setTimerActive,
  secondsRemaining,
  setSecondsRemaining,
  currentMode,
  setCurrentMode,
  completedPomodorosCount,
  setCompletedPomodorosCount,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  // Get mode target seconds
  const getModeDurationSeconds = (mode: SessionType) => {
    switch (mode) {
      case 'pomodoro':
        return (settings.pomodoroLength || 25) * 60;
      case 'short_break':
        return (settings.shortBreakLength || 5) * 60;
      case 'long_break':
        return (settings.longBreakLength || 15) * 60;
      default:
        return 25 * 60;
    }
  };

  const totalModeSeconds = getModeDurationSeconds(currentMode);

  // Switch timer mode
  const handleSwitchMode = (mode: SessionType) => {
    setTimerActive(false);
    setCurrentMode(mode);
    setSecondsRemaining(getModeDurationSeconds(mode));
  };

  // Start / Pause
  const handleToggleTimer = () => {
    if (!timerActive) {
      playStartClick(soundEnabled);
    }
    setTimerActive(!timerActive);
  };

  // Reset
  const handleReset = () => {
    setTimerActive(false);
    setSecondsRemaining(getModeDurationSeconds(currentMode));
  };

  // Complete session explicitly or on timer finish
  const handleCompleteCurrentSession = () => {
    setTimerActive(false);
    playSessionCompleteChime(soundEnabled);

    const actualDurationMinutes = Math.max(
      1,
      Math.round((totalModeSeconds - secondsRemaining) / 60) || Math.round(totalModeSeconds / 60)
    );

    // Save session record if it was a focus pomodoro
    if (currentMode === 'pomodoro') {
      onSaveSession({
        taskId: selectedTask ? selectedTask.id : null,
        taskTitle: selectedTask ? selectedTask.title : 'General Academic Focus',
        subject: selectedTask ? selectedTask.subject : 'Independent Study',
        durationMinutes: actualDurationMinutes,
        type: 'pomodoro',
        timestamp: new Date().toISOString(),
      });

      const nextCount = completedPomodorosCount + 1;
      setCompletedPomodorosCount(nextCount);

      // Pomodoro cycle check: 4 pomodoros -> Long Break
      if (nextCount % 4 === 0) {
        handleSwitchMode('long_break');
      } else {
        handleSwitchMode('short_break');
      }
    } else {
      // Break completed -> back to Pomodoro
      handleSwitchMode('pomodoro');
    }
  };

  // Skip to next phase
  const handleSkip = () => {
    setTimerActive(false);
    if (currentMode === 'pomodoro') {
      handleSwitchMode('short_break');
    } else {
      handleSwitchMode('pomodoro');
    }
  };

  // Calculation for circular SVG progress
  const progressRatio = totalModeSeconds > 0 ? (totalModeSeconds - secondsRemaining) / totalModeSeconds : 0;
  const strokeDashoffset = 565.48 * (1 - progressRatio);

  const displayMinutes = Math.floor(secondsRemaining / 60);
  const displaySeconds = secondsRemaining % 60;
  const formattedTime = `${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

  // Filter pending tasks for selector
  const activeTasks = tasks.filter((t) => !t.completed);

  // Today's focus sessions
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todaySessions = sessions.filter((s) => new Date(s.timestamp).getTime() >= todayStart);
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Deep Work Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pomodoro Focus Timer
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Structured intervals calibrated to human attention limits. Background-accurate timing with restorative micro-breaks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Dial Card (2 columns on desktop) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center space-y-6">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => handleSwitchMode('pomodoro')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentMode === 'pomodoro'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => handleSwitchMode('short_break')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentMode === 'short_break'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleSwitchMode('long_break')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentMode === 'long_break'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Task Attachment Selector */}
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Attached Academic Deliverable</span>
              {selectedTask && (
                <button
                  onClick={() => onSelectTask(null)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                >
                  Detach Task
                </button>
              )}
            </div>
            <select
              value={selectedTask?.id || ''}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                onSelectTask(found || null);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">General Academic Session (No specific task)</option>
              {activeTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject}: {t.title} ({t.priority} priority)
                </option>
              ))}
            </select>
          </div>

          {/* Circular Countdown Gauge */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
              {/* Background Track */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className={`transition-all duration-300 ${
                  currentMode === 'pomodoro'
                    ? 'stroke-indigo-600 dark:stroke-indigo-500'
                    : currentMode === 'short_break'
                    ? 'stroke-emerald-500'
                    : 'stroke-violet-500'
                }`}
                strokeWidth="8"
                strokeDasharray="565.48"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Clockface */}
            <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-5xl sm:text-6xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tighter">
                {formattedTime}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentMode === 'pomodoro'
                  ? 'Deep Focus Block'
                  : currentMode === 'short_break'
                  ? 'Short Recovery'
                  : 'Extended Rest'}
              </span>
              {selectedTask && (
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 max-w-[180px] truncate">
                  {selectedTask.title}
                </span>
              )}
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleTimer}
              className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              {timerActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Skip to next phase"
              aria-label="Skip to next phase"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Mark Complete Button */}
          <button
            onClick={handleCompleteCurrentSession}
            className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Finish and log session now</span>
          </button>
        </div>

        {/* Right Column: Cycle Stats & Recent Session Logs */}
        <div className="space-y-6">
          {/* Daily Pomodoro Stats */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Focus Metrics
              </h3>
              <Target className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  {completedPomodorosCount}
                </span>
                <span className="text-[11px] text-slate-500">Pomodoros Done</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="block text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {todayFocusMinutes}m
                </span>
                <span className="text-[11px] text-slate-500">Today's Focus</span>
              </div>
            </div>

            {/* Cycle visual indicator (4 pomodoro dots) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Current Cycle</span>
                <span className="font-mono tabular-nums font-semibold">
                  {(completedPomodorosCount % 4) || (completedPomodorosCount > 0 ? 4 : 0)} of 4 to Long Break
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => {
                  const currentInCycle = completedPomodorosCount % 4 || (completedPomodorosCount > 0 ? 4 : 0);
                  const isDone = completedPomodorosCount > 0 && step <= currentInCycle;
                  return (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-colors ${
                        isDone ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Session History Log */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>Recent Focus Logs</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {sessions.length} sessions
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No focus sessions logged yet. Complete your first 25-minute Pomodoro!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sessions.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {s.taskTitle}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.subject} · {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                      +{s.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
