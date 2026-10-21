import React from 'react';
import { Task, StudySession, UserSettings } from '../../types';
import { formatTime } from '../../utils/date';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  sessions: StudySession[];
  settings: UserSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  sessions,
  settings,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total logged focus time across all time
  const totalFocusMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Weekly study time (last 7 days)
  const now = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyBreakdown = [6, 5, 4, 3, 2, 1, 0].map((daysBack) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysBack);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayName = daysOfWeek[d.getDay()];
    const dateFormatted = `${d.getMonth() + 1}/${d.getDate()}`;

    const minutes = sessions
      .filter((s) => {
        const t = new Date(s.timestamp).getTime();
        return t >= dayStart && t < dayEnd;
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return { dayName, dateFormatted, minutes, isToday: daysBack === 0 };
  });

  const maxDailyMinutes = Math.max(1, ...dailyBreakdown.map((d) => d.minutes));
  const weeklyFocusMinutes = dailyBreakdown.reduce((sum, d) => sum + d.minutes, 0);
  const averageDailyMinutes = Math.round(weeklyFocusMinutes / 7);

  // Subject-wise workload breakdown
  const subjectMap = new Map<string, { minutes: number; tasksCount: number }>();

  // Count from tasks
  tasks.forEach((t) => {
    const s = t.subject || 'General';
    const entry = subjectMap.get(s) || { minutes: 0, tasksCount: 0 };
    entry.tasksCount += 1;
    subjectMap.set(s, entry);
  });

  // Add logged study minutes per subject
  sessions.forEach((s) => {
    const sub = s.subject || 'General';
    const entry = subjectMap.get(sub) || { minutes: 0, tasksCount: 0 };
    entry.minutes += s.durationMinutes;
    subjectMap.set(sub, entry);
  });

  const subjectStats = Array.from(subjectMap.entries())
    .map(([subject, data]) => ({ subject, ...data }))
    .sort((a, b) => b.minutes - a.minutes);

  const topSubject = subjectStats.length > 0 ? subjectStats[0] : null;

  // Has demo sample data
  const hasSampleData = tasks.some((t) => t.isSample) || sessions.some((s) => s.isSample);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Academic Performance Metrics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Progress Analytics
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Empirical tracking of your study hours, deliverable completion rates, and subject distribution.
          </p>
        </div>

        {hasSampleData && (
          <div className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs self-start sm:self-auto font-mono">
            Demo Sample Data Active
          </div>
        )}
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Focus */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">7-Day Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatTime(weeklyFocusMinutes)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Avg <span className="font-mono tabular-nums font-semibold">{averageDailyMinutes}m</span>/day
          </div>
        </div>

        {/* Deliverable Completion Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {completionPercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {completedTasks} of {totalTasks} tasks done
          </div>
        </div>

        {/* Top Focused Subject */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Primary Focus</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {topSubject ? topSubject.subject : 'None yet'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {topSubject ? `${formatTime(topSubject.minutes)} logged` : 'Start studying to log'}
          </div>
        </div>

        {/* All-Time Study Sessions */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Logged Sessions</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {sessions.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatTime(totalFocusMinutes)} all-time focus
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Distribution Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Study Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Focus minutes recorded per day across the past week.
              </p>
            </div>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="pt-4">
            <div className="flex items-end justify-between gap-3 h-48">
              {dailyBreakdown.map((item, idx) => {
                const heightPercent = Math.max(6, Math.round((item.minutes / maxDailyMinutes) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono tabular-nums text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.minutes}m
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-end h-full">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${
                          item.isToday
                            ? 'bg-linear-to-t from-indigo-600 to-violet-500 shadow-xs'
                            : 'bg-slate-300 dark:bg-slate-700 hover:bg-indigo-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className={`block text-xs font-semibold ${item.isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.dayName}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {item.dateFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Status & Completion Ratio Gauge */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Task Completion Ratio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completed versus outstanding academic deliverables.
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            {/* SVG Circular Progress Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="58"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="58"
                  className="stroke-emerald-500 transition-all duration-500"
                  strokeWidth="12"
                  strokeDasharray="364.42"
                  strokeDashoffset={364.42 * (1 - completionPercentage / 100)}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                  {completionPercentage}%
                </span>
                <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Complete
                </span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-3 w-full sm:w-48 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Completed Tasks</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                  {completedTasks}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span className="text-slate-700 dark:text-slate-300">Pending Tasks</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                  {pendingTasks}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500">
                <span>Total Workload</span>
                <span className="font-mono tabular-nums font-semibold">{totalTasks} tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Workload Table & Breakdown */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subject-Wise Workload & Focus Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hours committed and deliverables cataloged per course.
            </p>
          </div>
          <BookOpen className="w-4 h-4 text-indigo-500" />
        </div>

        {subjectStats.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No subject data available. Add assignments to see course breakdowns.
          </div>
        ) : (
          <div className="space-y-3">
            {subjectStats.map((item) => {
              const maxSubjectMinutes = Math.max(1, ...subjectStats.map((s) => s.minutes));
              const percent = Math.min(100, Math.round((item.minutes / maxSubjectMinutes) * 100));

              return (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.subject}
                    </span>
                    <div className="flex items-center gap-4 text-slate-500 font-mono tabular-nums">
                      <span>{item.tasksCount} {item.tasksCount === 1 ? 'task' : 'tasks'}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formatTime(item.minutes)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
