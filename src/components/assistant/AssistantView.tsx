import React, { useState, useEffect } from 'react';
import { Task, UserSettings } from '../../types';
import {
  Sparkles,
  Send,
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  Flame,
  BrainCircuit,
  RotateCcw,
} from 'lucide-react';

interface AssistantViewProps {
  tasks: Task[];
  settings: UserSettings;
  todayFocusMinutes: number;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  note?: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  {
    id: 'exam_plan',
    title: '5-Day Exam Plan',
    desc: 'Spaced repetition schedule for upcoming assessment',
    prompt: 'Create a structured 5-day active recall study plan for an upcoming college exam.',
    actionType: 'exam_plan',
  },
  {
    id: 'task_breakdown',
    title: 'Break Down Project',
    desc: 'Milestones & subtasks for heavy assignments',
    prompt: 'Break down my most urgent assignment into 4 concrete, actionable milestones with time estimates.',
    actionType: 'task_breakdown',
  },
  {
    id: 'revision_timetable',
    title: 'Revision Timetable',
    desc: 'Interleaved weekly study blocks and rest periods',
    prompt: 'Generate an efficient revision timetable for finals week balancing STEM and writing courses.',
    actionType: 'revision_timetable',
  },
  {
    id: 'prioritize_day',
    title: 'Prioritize My Day',
    desc: 'Eisenhower matrix analysis of current workload',
    prompt: 'Analyze my current deadlines and give me a clear prioritization strategy for today.',
    actionType: 'prioritize_day',
  },
  {
    id: 'explain_concept',
    title: 'Feynman Technique',
    desc: 'Framework to understand difficult academic concepts',
    prompt: 'Explain the Feynman study method to quickly master complex topics without memorization.',
    actionType: 'concept_explanation',
  },
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  tasks,
  settings,
  todayFocusMinutes,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${settings.studentName}! I am your **StudySphere Academic Strategist**.

I can help you build spaced-repetition exam schedules, decompose overwhelming assignments into bite-sized milestones, optimize your daily focus hours, and apply evidence-based study methods like the Feynman technique.

Choose one of the quick starters below, or enter your specific study question or course challenge.`,
      source: 'studysphere-core',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ available: boolean; engine: string; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check server AI status on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => {
        console.warn('Could not reach /api/ai/status:', err);
        setServerStatus({
          available: false,
          engine: 'rule-based',
          message: 'Running local StudySphere Rule Engine',
        });
      });
  }, []);

  const handleSendMessage = async (promptText: string, actionType?: string) => {
    const textToSend = promptText.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Gather relevant student context
      const studentContext = includeContext
        ? {
            pendingTasksCount: tasks.filter((t) => !t.completed).length,
            overdueCount: tasks.filter((t) => !t.completed && new Date(t.deadline).getTime() < Date.now()).length,
            dailyGoalMinutes: settings.dailyGoalMinutes,
            focusMinutesToday: todayFocusMinutes,
            upcomingTasks: tasks
              .filter((t) => !t.completed)
              .slice(0, 5)
              .map((t) => ({
                title: t.title,
                subject: t.subject,
                deadline: t.deadline,
                priority: t.priority,
              })),
          }
        : undefined;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          actionType,
          studentContext,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          source: data.source,
          note: data.note,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Unable to complete recommendation**: ${data.error || 'Server error occurred'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (e: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Connection Error**: Could not connect to the academic strategist server (${e?.message || 'Network issue'}). Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server-Grounded Pedagogical Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Study Strategist
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Get structured revision timetables, cognitive milestone breakdowns, and priority matrices.
          </p>
        </div>

        {/* Engine Status indicator */}
        <div className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              serverStatus?.engine === 'gemini-3.8-flash' ? 'bg-emerald-400' : 'bg-indigo-400'
            }`}
          />
          <span className="font-mono">
            {serverStatus?.engine === 'gemini-3.8-flash'
              ? 'Gemini 3.8 Flash SDK'
              : 'StudySphere Rule Engine'}
          </span>
        </div>
      </div>

      {/* Quick Prompt Starters Carousel */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Suggested Academic Starters:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {STARTER_PROMPTS.map((starter) => (
            <button
              key={starter.id}
              onClick={() => handleSendMessage(starter.prompt, starter.actionType)}
              disabled={loading}
              className="p-3 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <span>{starter.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {starter.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[380px] flex flex-col justify-between space-y-4">
        {/* Messages List */}
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
          {messages.map((m) => {
            const isAI = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isAI
                      ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {/* Markdown-style content renderer */}
                  <div className="whitespace-pre-wrap font-sans space-y-1.5">
                    {m.text}
                  </div>

                  {/* Metadata footnote */}
                  {isAI && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {m.source === 'gemini-3.8-flash'
                            ? 'Powered by Gemini 3.8 Flash'
                            : 'StudySphere Rule Engine'}
                        </span>
                        {m.note && <span className="italic text-slate-400">({m.note})</span>}
                      </div>

                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        title="Copy to clipboard"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 italic">
                Synthesizing academic strategy and time allocations...
              </div>
            </div>
          )}
        </div>

        {/* Context Attachment Bar & Input Form */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Include my active tasks and deadlines as prompt context</span>
            </label>

            <span className="text-[11px] font-mono tabular-nums">
              {tasks.filter((t) => !t.completed).length} pending tasks available
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputPrompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask for an exam study plan, breakdown for an assignment, or advice on today's schedule..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 active:scale-98 transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
