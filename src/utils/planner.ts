import { Task, StudyPlanItem } from '../types';
import { isTaskOverdue, isTaskDueToday, getDaysRemaining } from './date';

/**
 * Calculates a numerical priority score for study planning.
 * Considers urgency (days remaining), explicit priority weight, and estimated duration.
 */
function calculateTaskScore(task: Task): { score: number; reason: string } {
  if (task.completed) {
    return { score: -1, reason: 'Task already completed' };
  }

  let score = 0;
  const daysInfo = getDaysRemaining(task.deadline);
  let urgencyReason = '';

  // 1. Urgency scoring
  if (daysInfo.isOverdue) {
    score += 150;
    urgencyReason = `Overdue task (${daysInfo.label}) requiring immediate recovery`;
  } else if (daysInfo.isToday) {
    score += 120;
    urgencyReason = 'Deadline is today; urgent delivery required';
  } else if (daysInfo.days === 1) {
    score += 90;
    urgencyReason = 'Due tomorrow; prime candidate for immediate focus';
  } else if (daysInfo.days <= 3) {
    score += 60;
    urgencyReason = `Approaching deadline (${daysInfo.label})`;
  } else if (daysInfo.days <= 7) {
    score += 30;
    urgencyReason = `Upcoming this week (${daysInfo.label})`;
  } else {
    score += 10;
    urgencyReason = `Longer horizon (${daysInfo.label})`;
  }

  // 2. Priority scoring
  let priorityReason = '';
  if (task.priority === 'high') {
    score += 60;
    priorityReason = 'High priority academic assignment';
  } else if (task.priority === 'medium') {
    score += 35;
    priorityReason = 'Moderate priority';
  } else {
    score += 15;
    priorityReason = 'Standard priority';
  }

  // 3. Category weighting
  if (task.category === 'exam_prep') {
    score += 25;
    priorityReason += ' · Active revision phase';
  } else if (task.category === 'assignment' || task.category === 'project') {
    score += 20;
  }

  const combinedReason = `${urgencyReason} · ${priorityReason}`;
  return { score, reason: combinedReason };
}

/**
 * Generates an optimal daily study schedule fitting within user's available minutes.
 * Starts from a given time (e.g. 09:00 AM) and inserts restorative breaks.
 */
export function generateDailyPlan(
  tasks: Task[],
  availableMinutes: number = 120,
  startHour: number = 9,
  startMinute: number = 0
): StudyPlanItem[] {
  // Filter out completed tasks
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Score and rank tasks
  const scoredTasks = pendingTasks
    .map((task) => {
      const { score, reason } = calculateTaskScore(task);
      return { task, score, reason };
    })
    .sort((a, b) => b.score - a.score);

  const plan: StudyPlanItem[] = [];
  let currentMinutes = startHour * 60 + startMinute;
  let remainingBudget = availableMinutes;

  for (let i = 0; i < scoredTasks.length; i++) {
    const { task, reason } = scoredTasks[i];
    if (remainingBudget <= 15) break;

    // Allocate session block (between 25 and 60 minutes per block to avoid cognitive fatigue)
    const sessionDuration = Math.min(task.estimatedDuration || 45, remainingBudget, 60);

    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const endMinutes = currentMinutes + sessionDuration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const formatClock = (h: number, m: number) => {
      const period = h >= 12 && h < 24 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      return `${displayH}:${displayM} ${period}`;
    };

    plan.push({
      id: `plan-${task.id}-${i}`,
      taskId: task.id,
      taskTitle: task.title,
      subject: task.subject,
      durationMinutes: sessionDuration,
      suggestedStartTime: formatClock(startH, startM),
      suggestedEndTime: formatClock(endH, endM),
      priorityReason: reason,
      category: task.category,
      isBreak: false,
      completed: false,
    });

    currentMinutes += sessionDuration;
    remainingBudget -= sessionDuration;

    // Insert a restorative break if time remains and more tasks are pending
    if (remainingBudget >= 15 && i < scoredTasks.length - 1) {
      const breakDuration = sessionDuration >= 50 ? 10 : 5;
      const breakEndMinutes = currentMinutes + breakDuration;
      const bStartH = Math.floor(currentMinutes / 60);
      const bStartM = currentMinutes % 60;
      const bEndH = Math.floor(breakEndMinutes / 60);
      const bEndM = breakEndMinutes % 60;

      plan.push({
        id: `break-${i}`,
        taskId: `break-${i}`,
        taskTitle: breakDuration >= 10 ? 'Restorative Movement & Hydration Break' : 'Short Mindful Break',
        subject: 'Rest & Recovery',
        durationMinutes: breakDuration,
        suggestedStartTime: formatClock(bStartH, bStartM),
        suggestedEndTime: formatClock(bEndH, bEndM),
        priorityReason: 'Cognitive reset to restore working memory capacity and prevent burnout',
        category: 'personal',
        isBreak: true,
        breakType: breakDuration >= 10 ? 'walk' : 'short',
        completed: false,
      });

      currentMinutes += breakDuration;
      remainingBudget -= breakDuration;
    }
  }

  return plan;
}
