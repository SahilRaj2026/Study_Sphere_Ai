import { Task, StudySession } from '../types';

function escapeCSV(field: string | number | boolean | null | undefined): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function downloadTasksCSV(tasks: Task[]): void {
  const headers = [
    'ID',
    'Title',
    'Subject',
    'Category',
    'Priority',
    'Deadline',
    'Estimated Minutes',
    'Status',
    'Completed At',
    'Description',
  ];

  const rows = tasks.map((t) => [
    t.id,
    t.title,
    t.subject,
    t.category,
    t.priority,
    t.deadline,
    t.estimatedDuration,
    t.completed ? 'Completed' : 'Pending',
    t.completedAt || 'N/A',
    t.description,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  triggerDownload(csvContent, `studysphere_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function downloadSessionsCSV(sessions: StudySession[]): void {
  const headers = [
    'Session ID',
    'Date & Time',
    'Subject',
    'Task Title',
    'Duration (Minutes)',
    'Session Type',
  ];

  const rows = sessions.map((s) => [
    s.id,
    new Date(s.timestamp).toLocaleString(),
    s.subject,
    s.taskTitle,
    s.durationMinutes,
    s.type,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  triggerDownload(csvContent, `studysphere_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
