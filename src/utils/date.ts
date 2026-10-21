/**
 * Date and Time utilities for StudySphere AI
 */

export function getGreeting(name: string = 'Student'): string {
  const hour = new Date().getHours();
  let timeOfDay = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeOfDay = 'Good afternoon';
  } else if (hour >= 17) {
    timeOfDay = 'Good evening';
  }
  return `${timeOfDay}, ${name}`;
}

export function isTaskOverdue(deadlineStr: string, completed: boolean): boolean {
  if (completed) return false;
  if (!deadlineStr) return false;
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return false;

  // If deadline has no time (YYYY-MM-DD), count end of day 23:59:59
  if (deadlineStr.length === 10) {
    deadline.setHours(23, 59, 59, 999);
  }
  return deadline.getTime() < Date.now();
}

export function isTaskDueToday(deadlineStr: string): boolean {
  if (!deadlineStr) return false;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  return (
    deadline.getFullYear() === now.getFullYear() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getDate() === now.getDate()
  );
}

export function getDaysRemaining(deadlineStr: string): {
  days: number;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!deadlineStr) {
    return { days: 0, label: 'No date', isOverdue: false, isToday: false };
  }
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) {
    return { days: 0, label: 'Invalid date', isOverdue: false, isToday: false };
  }

  // Adjust for date-only strings
  if (deadlineStr.length === 10) {
    deadline.setHours(23, 59, 59, 999);
  }

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return {
      days: -overdueDays,
      label: overdueDays <= 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`,
      isOverdue: true,
      isToday: false,
    };
  }

  if (isTaskDueToday(deadlineStr)) {
    return {
      days: 0,
      label: 'Due today',
      isOverdue: false,
      isToday: true,
    };
  }

  if (diffDays === 1) {
    return {
      days: 1,
      label: 'Due tomorrow',
      isOverdue: false,
      isToday: false,
    };
  }

  return {
    days: diffDays,
    label: `Due in ${diffDays} days`,
    isOverdue: false,
    isToday: false,
  };
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
