import React, { useState, useMemo } from 'react';
import { Task, Priority, TaskCategory, TaskStatusFilter } from '../../types';
import { isTaskOverdue, getDaysRemaining, formatFriendlyDate, formatTime } from '../../utils/date';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Play,
  Edit3,
  Trash2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface TasksViewProps {
  tasks: Task[];
  onOpenTaskModal: (task?: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectForTimer: (task: Task) => void;
}

type SortField = 'deadline' | 'priority' | 'duration' | 'title';
type SortOrder = 'asc' | 'desc';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onOpenTaskModal,
  onToggleComplete,
  onDeleteTask,
  onSelectForTimer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Deletion modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject) subs.add(t.subject);
    });
    return Array.from(subs).sort();
  }, [tasks]);

  // Counts for tabs
  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter((t) => isTaskOverdue(t.deadline, t.completed)).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter === 'pending' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
        if (statusFilter === 'overdue' && (!isTaskOverdue(task.deadline, task.completed) || task.completed)) {
          return false;
        }

        // Subject filter
        if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchSubject = task.subject.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'deadline') {
          const dateA = new Date(a.deadline).getTime() || 0;
          const dateB = new Date(b.deadline).getTime() || 0;
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortField === 'priority') {
          const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          const pA = priorityWeight[a.priority];
          const pB = priorityWeight[b.priority];
          return sortOrder === 'asc' ? pB - pA : pA - pB;
        }
        if (sortField === 'duration') {
          return sortOrder === 'asc'
            ? (a.estimatedDuration || 0) - (b.estimatedDuration || 0)
            : (b.estimatedDuration || 0) - (a.estimatedDuration || 0);
        }
        if (sortField === 'title') {
          return sortOrder === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        return 0;
      });
  }, [tasks, statusFilter, subjectFilter, priorityFilter, categoryFilter, searchQuery, sortField, sortOrder]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Tasks & Assignments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course deliverables, exams, problem sets, and milestones.
          </p>
        </div>

        <button
          onClick={() => onOpenTaskModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Segmented Control (Complies with Zero-Pill: interactive filter tabs with clean rounded-md buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Tasks', count: counts.total },
                { id: 'pending', label: 'Pending', count: counts.pending },
                { id: 'overdue', label: 'Overdue', count: counts.overdue },
                { id: 'completed', label: 'Completed', count: counts.completed },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] font-mono tabular-nums opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, or notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Secondary Filter Dropdowns & Sorting */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="assignment">Assignments</option>
            <option value="exam_prep">Exam Prep</option>
            <option value="project">Projects</option>
            <option value="personal">Personal</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="deadline">Due Date</option>
              <option value="priority">Priority</option>
              <option value="duration">Duration</option>
              <option value="title">Alphabetical</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task List Table / Cards */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No matching tasks found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || subjectFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters or search keywords.'
              : 'You have no tasks created yet. Click "+ New Task" to schedule your first academic deliverable.'}
          </p>
          <button
            onClick={() => onOpenTaskModal()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue = isTaskOverdue(task.deadline, task.completed);
            const daysInfo = getDaysRemaining(task.deadline);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  task.completed
                    ? 'opacity-70 border-slate-200 dark:border-slate-800'
                    : isOverdue
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Left: Checkbox + Title + Metadata */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`mt-1 p-0.5 rounded transition-colors ${
                      task.completed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-300 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400'
                    }`}
                    title={task.completed ? 'Mark pending' : 'Mark completed'}
                    aria-label={`Mark ${task.title} as ${task.completed ? 'pending' : 'completed'}`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${task.completed ? 'fill-emerald-100 dark:fill-emerald-950' : ''}`}
                    />
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-bold ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.isSample && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Demo Sample)
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    {/* Zero-Pill metadata: Clean unboxed text with typographic dot separators */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{task.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{task.category.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold capitalize ${
                          task.priority === 'high'
                            ? 'text-rose-600 dark:text-rose-400'
                            : task.priority === 'medium'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatTime(task.estimatedDuration)}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-mono tabular-nums ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : daysInfo.isToday
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {formatFriendlyDate(task.deadline)} ({daysInfo.label})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => onSelectForTimer(task)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                      title="Attach to Pomodoro Timer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Focus</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenTaskModal(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Task"
                    aria-label="Edit Task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Task"
                    aria-label="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Task Deletion */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        title="Delete Academic Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isDestructive={true}
        onConfirm={() => {
          if (taskToDelete) {
            onDeleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
