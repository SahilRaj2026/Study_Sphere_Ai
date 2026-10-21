import React from 'react';
import { Task, StudySession, UserSettings, NavTab } from '../../types';
import { getGreeting, getDaysRemaining, formatFriendlyDate, isTaskOverdue, formatTime } from '../../utils/date';
import { generateDailyPlan } from '../../utils/planner';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Play,
  Plus,
  BookOpen,
  TrendingUp,
  Target,
} from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  sessions: StudySession[];
  settings: UserSettings;
  onNavigate: (tab: NavTab) => void;
  onOpenTaskModal: () => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSelectTaskForTimer: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  sessions,
  settings,
  onNavigate,
  onOpenTaskModal,
  onToggleTaskComplete,
  onSelectTaskForTimer,
}) => {
  const greeting = getGreeting(settings.studentName);

  // Statistics calculation from actual data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.deadline, t.completed)).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Weekly study time calculation (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklySessions = sessions.filter((s) => new Date(s.timestamp) >= sevenDaysAgo);
  const weeklyFocusMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Today's study time
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todaySessions = sessions.filter((s) => new Date(s.timestamp).getTime() >= todayStart);
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Upcoming deadlines (next 7 days, not completed)
  const upcomingDeadlines = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // Today's suggested study plan (using planner algorithm for available time)
  const todayPlan = generateDailyPlan(tasks, 120, 10, 0).slice(0, 4);

  // Last 7 days distribution for mini visual chart
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyStudyStats = [6, 5, 4, 3, 2, 1, 0].map((daysBack) => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    const dayName = daysOfWeek[d.getDay()];
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const minutes = sessions
      .filter((s) => {
        const t = new Date(s.timestamp).getTime();
        return t >= dayStart && t < dayEnd;
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return { dayName, minutes };
  });

  const maxDailyMinutes = Math.max(1, ...dailyStudyStats.map((d) => d.minutes));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
            StudySphere AI Productivity Core
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            You have <span className="font-semibold text-white">{pendingTasks} pending tasks</span> and{' '}
            <span className="font-semibold text-white">{formatTime(weeklyFocusMinutes)}</span> focused this week.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('planner')}
            className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Open Planner
          </button>
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Workload</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {totalTasks}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across active courses
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Tasks</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {pendingTasks}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Requires active study time
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {completedTasks}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">{completionRate}%</span> completion rate
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${overdueTasks > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${overdueTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {overdueTasks}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {overdueTasks > 0 ? 'Urgent attention required' : 'All deadlines on track'}
          </div>
        </div>
      </div>

      {/* Two Column Section: Today's Plan & Weekly Focus Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Study Plan (2 columns wide on desktop) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Recommended Study Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prioritized by upcoming deadline proximity, difficulty, and cognitive energy.
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1"
            >
              Full Schedule <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayPlan.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              No pending tasks scheduled for today. You're all caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {todayPlan.map((item) => {
                const originalTask = tasks.find((t) => t.id === item.taskId);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border transition-all ${
                      item.isBreak
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!item.isBreak ? (
                        <button
                          onClick={() => onToggleTaskComplete(item.taskId)}
                          className={`mt-0.5 p-1 rounded-md transition-colors ${
                            originalTask?.completed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 hover:text-indigo-600'
                          }`}
                          aria-label="Toggle task completion"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${originalTask?.completed ? 'fill-emerald-100 dark:fill-emerald-950' : ''}`} />
                        </button>
                      ) : (
                        <div className="mt-0.5 p-1 text-slate-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              originalTask?.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.taskTitle}
                          </span>
                        </div>

                        {/* Unboxed Metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span>{item.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{item.suggestedStartTime} - {item.suggestedEndTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{item.durationMinutes}m duration</span>
                        </div>

                        {item.priorityReason && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                            Reason: {item.priorityReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {!item.isBreak && originalTask && (
                      <button
                        onClick={() => onSelectTaskForTimer(originalTask)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors flex items-center gap-1 shrink-0"
                        title="Start Pomodoro focus block on this task"
                      >
                        <Play className="w-3 h-3" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Weekly Study Hours & Mini Bar Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Study Time
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily focus distribution (Past 7 days)
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>

          {/* Metric Highlight */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatTime(weeklyFocusMinutes)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">Total logged</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                {formatTime(todayFocusMinutes)}
              </span>
              <span className="block text-[11px] text-slate-400">Today</span>
            </div>
          </div>

          {/* Daily 7-day Bar Chart */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 h-28 pt-4">
              {dailyStudyStats.map((item, idx) => {
                const heightPercent = Math.max(8, Math.round((item.minutes / maxDailyMinutes) * 100));
                const isToday = idx === dailyStudyStats.length - 1;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {item.minutes}m
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex items-end h-full">
                      <div
                        className={`w-full rounded-md transition-all duration-300 ${
                          isToday
                            ? 'bg-linear-to-t from-indigo-600 to-violet-500'
                            : 'bg-slate-300 dark:bg-slate-700 hover:bg-indigo-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
                      {item.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Productivity insight */}
          <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">Study Insight: </span>
            {weeklyFocusMinutes >= 300
              ? 'Great momentum! You’ve surpassed 5 hours of deep study this week.'
              : 'Consistent 25-minute Pomodoro sessions help prevent last-minute cramming.'}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming Deadlines (Next 7 Days)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deliverables requiring active preparation and submission.
            </p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1"
          >
            All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            No upcoming deadlines in the next 7 days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                  <th className="py-2.5 px-3">Assignment / Target</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingDeadlines.map((task) => {
                  const daysInfo = getDaysRemaining(task.deadline);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {task.subject}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono tabular-nums ${
                            daysInfo.isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : daysInfo.isToday
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {formatFriendlyDate(task.deadline)} ({daysInfo.label})
                        </span>
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <span
                          className={`font-semibold ${
                            task.priority === 'high'
                              ? 'text-rose-600 dark:text-rose-400'
                              : task.priority === 'medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectTaskForTimer(task)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors"
                        >
                          Start Timer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
