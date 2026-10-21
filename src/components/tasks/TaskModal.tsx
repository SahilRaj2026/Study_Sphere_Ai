import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskCategory } from '../../types';
import { X, Calendar, Clock, BookOpen, Tag, AlertCircle } from 'lucide-react';
import { getTodayDateString, addDaysToDate } from '../../utils/date';

interface TaskModalProps {
  isOpen: boolean;
  initialTask?: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'isSample'> & { id?: string }) => void;
  onClose: () => void;
}

const COMMON_SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Psychology',
  'Literature',
  'Economics',
  'History',
  'Philosophy',
  'Personal',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  initialTask,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(addDaysToDate(2));
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('assignment');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(45);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      if (COMMON_SUBJECTS.includes(initialTask.subject)) {
        setSubject(initialTask.subject);
        setIsCustomSubject(false);
        setCustomSubject('');
      } else {
        setSubject('Other');
        setIsCustomSubject(true);
        setCustomSubject(initialTask.subject);
      }
      setDescription(initialTask.description || '');
      setDeadline(initialTask.deadline.slice(0, 10));
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setEstimatedDuration(initialTask.estimatedDuration || 45);
    } else {
      setTitle('');
      setSubject('Computer Science');
      setIsCustomSubject(false);
      setCustomSubject('');
      setDescription('');
      setDeadline(addDaysToDate(2));
      setPriority('medium');
      setCategory('assignment');
      setEstimatedDuration(45);
    }
    setErrors({});
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    const finalSubject = isCustomSubject ? customSubject.trim() : subject;
    if (!finalSubject) {
      newErrors.subject = 'Subject is required';
    }

    if (!deadline) {
      newErrors.deadline = 'Due date is required';
    }

    if (estimatedDuration <= 0 || isNaN(estimatedDuration)) {
      newErrors.duration = 'Estimated duration must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      subject: finalSubject,
      description: description.trim(),
      deadline,
      priority,
      category,
      estimatedDuration: Number(estimatedDuration),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 my-8"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialTask ? 'Edit Academic Task' : 'Create New Academic Task'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add assignments, revision blocks, and milestone tasks to your schedule.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Distributed Systems Lab 3 or Calculus Problem Set"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-400 dark:border-rose-700'
                  : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500 dark:border-slate-700'
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Subject <span className="text-rose-500">*</span>
              </label>
              {!isCustomSubject ? (
                <div className="space-y-1.5">
                  <select
                    value={subject}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setIsCustomSubject(true);
                      } else {
                        setSubject(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {COMMON_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Other">+ Custom Subject...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter subject name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSubject(false);
                      setSubject('Computer Science');
                    }}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 underline"
                  >
                    Preset
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="assignment">Assignment / Problem Set</option>
                <option value="exam_prep">Exam Preparation / Revision</option>
                <option value="project">Project / Paper</option>
                <option value="personal">Personal / Seminar Admin</option>
              </select>
            </div>
          </div>

          {/* Priority & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['low', 'medium', 'high'] as Priority[]).map((lvl) => {
                  const isActive = priority === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPriority(lvl)}
                      className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-colors whitespace-nowrap ${
                        isActive
                          ? lvl === 'high'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : lvl === 'medium'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Duration (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">mins</span>
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Due Date / Deadline <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Notes & Guidelines <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Include test cases, minimum 3 references, or rubric requirements..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
