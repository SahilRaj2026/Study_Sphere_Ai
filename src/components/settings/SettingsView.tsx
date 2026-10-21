import React, { useState } from 'react';
import { UserSettings, Task, StudySession } from '../../types';
import { downloadTasksCSV, downloadSessionsCSV } from '../../utils/csv';
import { formatTime } from '../../utils/date';
import {
  Settings,
  Sun,
  Moon,
  Target,
  Download,
  RotateCcw,
  Trash2,
  ShieldCheck,
  User,
  Clock,
  Volume2,
  VolumeX,
  FileSpreadsheet,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  tasks: Task[];
  sessions: StudySession[];
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  tasks,
  sessions,
  onResetSampleData,
  onClearAllData,
}) => {
  const [studentName, setStudentName] = useState(settings.studentName);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(settings.dailyGoalMinutes);
  const [pomodoroLength, setPomodoroLength] = useState(settings.pomodoroLength);
  const [shortBreakLength, setShortBreakLength] = useState(settings.shortBreakLength);
  const [longBreakLength, setLongBreakLength] = useState(settings.longBreakLength);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      studentName: studentName.trim() || 'Student',
      dailyGoalMinutes: Number(dailyGoalMinutes) || 120,
      pomodoroLength: Number(pomodoroLength) || 25,
      shortBreakLength: Number(shortBreakLength) || 5,
      longBreakLength: Number(longBreakLength) || 15,
      soundEnabled,
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800">
        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span>User Preferences & Data Sovereignty</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Settings & Data Management
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Customize your study rhythms, adjust target goals, export CSV records, or reset sample data.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Profile & Appearance Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Profile & Visual Theme</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name / Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Visual Theme Interface
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    settings.theme === 'light'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    settings.theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Study Goals & Pomodoro Durations Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Study Goals & Timer Intervals</span>
          </h3>

          <div className="space-y-4">
            {/* Daily Goal Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Daily Study Goal
                </label>
                <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                  {formatTime(dailyGoalMinutes)} ({dailyGoalMinutes} mins)
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="360"
                step="15"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>30m</span>
                <span>1h 30m</span>
                <span>3h</span>
                <span>6h</span>
              </div>
            </div>

            {/* Pomodoro Rhythms */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Focus Session (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={pomodoroLength}
                  onChange={(e) => setPomodoroLength(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Break (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakLength}
                  onChange={(e) => setShortBreakLength(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Long Break (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={longBreakLength}
                  onChange={(e) => setLongBreakLength(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audio Completion Chime
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  soundEnabled
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {saveSuccessMsg && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                Preferences saved! ✓
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </form>

      {/* CSV Export & Data Sovereignty Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Export Data & Backups</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Download your complete assignment inventory and time-stamped focus logs in standard CSV format for spreadsheet analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={() => downloadTasksCSV(tasks)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Tasks CSV ({tasks.length} items)</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSessionsCSV(sessions)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Export Focus History CSV ({sessions.length} logs)</span>
          </button>
        </div>
      </div>

      {/* Reset & Danger Zone Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Data Reset & Maintenance</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Reset to realistic sample demonstration records or purge all personal local data.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demo Sample Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Application Data</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Privacy & Client Storage Notice
          </div>
          <p className="leading-relaxed">
            StudySphere AI stores all your assignments, task notes, focus sessions, and settings directly within your browser's
            persistent <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">localStorage</code>.
            Your academic notes remain on your device and are never sold or synced to third-party databases.
          </p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset to Sample Demo Data?"
        message="This will overwrite current tasks and study sessions with the realistic demonstration coursework package (Computer Science, Math, Chemistry, Psychology)."
        confirmLabel="Reset Sample Data"
        onConfirm={() => {
          onResetSampleData();
          setIsResetModalOpen(false);
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Purge All Application Data?"
        message="This will permanently delete all tasks, study logs, and custom settings from this browser's localStorage. This action cannot be undone."
        confirmLabel="Clear Everything"
        isDestructive={true}
        onConfirm={() => {
          onClearAllData();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
