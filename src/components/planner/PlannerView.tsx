import React, { useState, useEffect } from 'react';
import { Task, StudyPlanItem } from '../../types';
import { generateDailyPlan } from '../../utils/planner';
import { formatTime } from '../../utils/date';
import {
  CalendarRange,
  Clock,
  Sparkles,
  RefreshCw,
  Play,
  CheckCircle2,
  Coffee,
  Info,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface PlannerViewProps {
  tasks: Task[];
  onSelectTaskForTimer: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  onSelectTaskForTimer,
  onToggleTaskComplete,
}) => {
  const [availableMinutes, setAvailableMinutes] = useState<number>(150); // 2.5 hours default
  const [startHour, setStartHour] = useState<number>(9);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Generate initial plan when tasks or settings change
  const handleGenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const newPlan = generateDailyPlan(tasks, availableMinutes, startHour, startMinute);
      setPlan(newPlan);
      setIsRegenerating(false);
    }, 200);
  };

  useEffect(() => {
    handleGenerate();
  }, [tasks]);

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const totalPlannedMinutes = plan.reduce((sum, item) => sum + item.durationMinutes, 0);
  const studyBlocksCount = plan.filter((i) => !i.isBreak).length;
  const breakBlocksCount = plan.filter((i) => i.isBreak).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algorithmic Schedule Optimizer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Daily Study Planner
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Generates a realistic, fatigue-aware study schedule structured around your available time,
            approaching deadlines, and necessary recovery breaks.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-all shadow-sm whitespace-nowrap self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Regenerate Schedule</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Plan Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Available Study Time Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Available Study Time
              </label>
              <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(availableMinutes)}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="360"
              step="15"
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>30m</span>
              <span>2h</span>
              <span>4h</span>
              <span>6h</span>
            </div>
          </div>

          {/* Start Time Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Schedule Start Time
            </label>
            <div className="flex items-center gap-2">
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((h) => {
                  const displayH = h % 12 === 0 ? 12 : h % 12;
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  return (
                    <option key={h} value={h}>
                      {displayH}:00 {ampm}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-around text-center text-xs">
            <div>
              <span className="block text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                {studyBlocksCount}
              </span>
              <span className="text-[11px] text-slate-500">Study Blocks</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {breakBlocksCount}
              </span>
              <span className="text-[11px] text-slate-500">Breaks</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatTime(totalPlannedMinutes)}
              </span>
              <span className="text-[11px] text-slate-500">Total Span</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Daily Timeline & Task Sequencing
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {pendingTasksCount} pending tasks eligible for scheduling
          </span>
        </div>

        {plan.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No tasks require scheduling!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              All tasks are completed, or your available study time is zero. Create more tasks in "My Tasks" to generate a plan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {plan.map((item, index) => {
              const originalTask = tasks.find((t) => t.id === item.taskId);

              if (item.isBreak) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.taskTitle}
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          ({item.durationMinutes} mins)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        {item.priorityReason}
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-slate-500 text-[11px] shrink-0">
                      {item.suggestedStartTime} – {item.suggestedEndTime}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          Step {index + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.taskTitle}
                        </h4>
                      </div>

                      {/* Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.category.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                          {item.suggestedStartTime} – {item.suggestedEndTime} ({item.durationMinutes}m block)
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {originalTask && (
                        <button
                          onClick={() => onSelectTaskForTimer(originalTask)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                          title="Open in Focus Timer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Session</span>
                        </button>
                      )}
                      <button
                        onClick={() => onToggleTaskComplete(item.taskId)}
                        className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          originalTask?.completed ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prioritization Explanation Callout */}
                  <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2 text-xs text-indigo-950 dark:text-indigo-200">
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Why this was scheduled: </span>
                      <span className="text-slate-600 dark:text-slate-300">{item.priorityReason}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Academic Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700 dark:text-slate-300">Academic Pacing Disclaimer: </strong>
          StudySphere AI provides algorithmic time-budgeting and cognitive load distribution suggestions based on your
          inputs. Academic outcomes depend on individual student effort, comprehension, and consistent practice.
        </p>
      </div>
    </div>
  );
};
