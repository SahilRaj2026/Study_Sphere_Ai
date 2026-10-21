import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

/**
 * Intelligent Rule-Based Academic Study Engine
 * Acts as high-fidelity fallback when GEMINI_API_KEY is missing or network/quota fails.
 */
function generateRuleBasedStudyResponse(
  prompt: string,
  actionType?: string,
  studentContext?: {
    pendingTasksCount?: number;
    overdueCount?: number;
    dailyGoalMinutes?: number;
    focusMinutesToday?: number;
    upcomingTasks?: Array<{ title: string; subject: string; deadline: string; priority: string }>;
  }
): string {
  const pLower = prompt.toLowerCase();
  const tasks = studentContext?.upcomingTasks || [];

  if (actionType === 'exam_plan' || pLower.includes('exam') || pLower.includes('test')) {
    return `### 5-Day High-Retention Exam Preparation Strategy

**Target Assessment**: Upcoming Examination
**Methodology**: Spaced Repetition + Active Recall (Feynman & Practice Testing)

---

#### Day 1: Syllabus Audit & High-Yield Blueprint
- **Focus Block 1 (45 mins)**: Map out all syllabus topics. Categorize into *Green* (mastered), *Yellow* (shaky), and *Red* (unlearned).
- **Focus Block 2 (45 mins)**: Create 1-page condensed equation/formula/concept sheets for *Red* topics.
- **Break (15 mins)**: Hydrate and step away from screens.

#### Day 2: Foundational Deep Dive (*Red Topics*)
- **Focus Block 1 (50 mins)**: Study core concepts using textbooks or lecture slides. Write notes from memory, not verbatim copying.
- **Focus Block 2 (40 mins)**: Solve 3 foundational problems per weak topic without looking at solutions.
- **Review (20 mins)**: Verify solutions and catalog errors in an "Error Log".

#### Day 3: Active Recall & Practice Questions (*Yellow Topics*)
- **Focus Block 1 (50 mins)**: Timed problem set under realistic conditions (no notes, strict clock).
- **Focus Block 2 (40 mins)**: Flashcard drill (Anki style) on definitions, vocabulary, and step-by-step proofs.
- **Review (15 mins)**: Teach each concept aloud to an empty room (Feynman technique).

#### Day 4: Full Simulation & Timed Mock Exam
- **Mock Exam (75 mins)**: Take an official past paper or comprehensive review set under exam conditions.
- **Break (20 mins)**: Rest.
- **Review & Fix (45 mins)**: Thoroughly dissect every mistake. Identify whether errors were conceptual or careless calculation slips.

#### Day 5: Low-Stress Synthesis & Buffer
- **Light Review (45 mins)**: Review your 1-page cheat sheet and error log only.
- **Logistics**: Organize pens, calculator, student ID, and exam materials.
- **Sleep Priority**: Get 7.5 to 8 hours of sleep; cognitive consolidation happens during slow-wave sleep.

*Note: Consistent daily execution produces much higher retention than last-night cramming.*`;
  }

  if (actionType === 'task_breakdown' || pLower.includes('break down') || pLower.includes('milestone') || pLower.includes('project')) {
    const matchedTask = tasks.length > 0 ? tasks[0].title : 'Major Assignment or Project';
    return `### Actionable Step-by-Step Task Breakdown

**Project Target**: ${matchedTask}
**Pacing Strategy**: Incremental Milestone Architecture (Prevents Last-Minute Panic)

---

#### Milestone 1: Scope & Research Foundation (Est: 45 mins)
1. Read the assignment rubric carefully. Underline grading criteria and point distribution.
2. Outline core questions or requirements in a single scratchpad document.
3. Collect 3 to 5 verified source papers, textbook chapters, or reference repos.
4. *Milestone Check*: You have a clear thesis/objective and approved reference list.

#### Milestone 2: Structural Architecture & Outline (Est: 40 mins)
1. Draft the document/code skeletal structure with all sub-headings.
2. Allocate target word counts or module deliverables per section.
3. Brainstorm key arguments or function signatures before drafting content.
4. *Milestone Check*: The entire skeleton is visible; you will never stare at a blank page.

#### Milestone 3: First Draft / Core Implementation (Est: 75 mins, Split into 2 Pomodoros)
1. Write the main body sections or implement core logic without self-editing.
2. Focus strictly on velocity and getting ideas onto the page.
3. Take a mandatory 10-minute break between the two 35-minute sessions.
4. *Milestone Check*: The core content is 80% drafted.

#### Milestone 4: Refinement, Verification & Polish (Est: 35 mins)
1. Verify against the initial grading rubric line-by-line.
2. Check citation formats (APA/IEEE/MLA) and code formatting/test cases.
3. Read the submission aloud once to catch clunky phrasing or grammar issues.
4. *Milestone Check*: Ready for final packaging and submission.`;
  }

  if (actionType === 'revision_timetable' || pLower.includes('timetable') || pLower.includes('schedule') || pLower.includes('revision')) {
    return `### High-Efficiency Weekly Revision Timetable

**Structure**: Interleaved Learning Model (Alternating Subjects to Prevent Mental Fatigue)

| Time Slot | Monday & Wednesday | Tuesday & Thursday | Friday & Saturday |
| :--- | :--- | :--- | :--- |
| **09:00 - 10:15** | Heavy STEM / Problem Solving | Reading & Essay Structuring | Timed Mock Assessment |
| **10:15 - 10:30** | *Hydration & Stretch Break* | *Movement Break* | *Coffee / Tea Break* |
| **10:30 - 11:45** | Practice Problems & Derivations | Case Studies & Theory Review | Dissect Mock Errors |
| **14:00 - 15:00** | Flashcard Active Recall (30m) + Summary Notes | Flashcard Active Recall (30m) + Synthesis | Weekly Review & Buffer Slot |
| **Evening** | Light Reading / Planning Next Day | Light Reading / Planning Next Day | Rest & Recovery |

---

#### 3 Essential Revision Rules:
1. **Never Study The Same Subject All Day**: Interleaving two different subjects (e.g. Math in morning, History in afternoon) improves long-term neural recall.
2. **Close the Book Before You Write**: Writing from memory forces synaptic retrieval pathways to strengthen.
3. **Respect the Buffer Slot**: Leave Saturday evening free to prevent burnout and absorb unexpected delays.`;
  }

  if (actionType === 'prioritize_day' || pLower.includes('priorit') || pLower.includes('busy')) {
    const pendingText = tasks.length > 0
      ? tasks.map((t, i) => `${i + 1}. **${t.title}** (${t.subject}, Priority: ${t.priority}, Due: ${t.deadline})`).join('\n')
      : '1. Urgent assignment due in next 48h\n2. Upcoming exam review\n3. Weekly lab or reading';

    return `### Eisenhower & Urgency Matrix: Daily Priority Strategy

Based on cognitive load theory and your current task workload:

${pendingText}

---

#### Strategy 1: The "Eat The Frog" Deep Focus Block (First 60 mins)
- Tackle the most cognitively demanding or urgent task first thing in your study session.
- Turn off notifications and close unrelated browser tabs.
- *Reasoning*: Willpower and cognitive working memory are highest at the beginning of your study session.

#### Strategy 2: Two 25-Minute Quick-Win Sprints (Mid-Session)
- Group smaller assignments, short problem sets, or submission uploads.
- Complete them in consecutive Pomodoro blocks to build psychological momentum.

#### Strategy 3: Low-Energy Administrative Review (Final 20 mins)
- Review completed work, verify submission portals, and draft tomorrow's 3 priority targets.

*Tip: If you have less than 2 hours available today, eliminate low-priority tasks completely and protect only the single highest-impact deadline.*`;
  }

  if (pLower.includes('explain') || pLower.includes('feynman') || pLower.includes('concept')) {
    return `### Feynman Technique Explanation Framework

To truly understand any complex academic concept, use this 4-step framework:

1. **Step 1: Simplify to a 12-Year-Old Level**
   - Strip away academic jargon and acronyms.
   - Use physical everyday analogies (e.g. explain computer RAM like a kitchen prep counter and hard drives like a storage pantry).

2. **Step 2: Identify Your Explanation Gaps**
   - Notice the exact sentence where you stumble, hesitate, or resort to complex terminology.
   - That hesitation marks the precise boundary of your true understanding versus superficial familiarity.

3. **Step 3: Return to Source Material**
   - Re-read only the specific paragraph addressing that gap.
   - Translate it into your own handwritten words.

4. **Step 4: Re-Synthesize with an Analogy**
   - Test yourself by teaching the idea to someone else or writing a 4-bullet summary without opening notes.`;
  }

  // General academic advice
  return `### StudySphere Strategic Academic Recommendation

**Focus Strategy**: Pomodoro Rhythm (25m Focus / 5m Recovery)

1. **Prioritize Proximity & Weight**:
   - Focus on tasks with deadlines within the next 48 hours first.
   - Keep study blocks bounded to 45-50 minutes max before taking a 10-minute break.

2. **Active Recall vs. Passive Reading**:
   - Re-reading notes gives a false sense of fluency.
   - Instead: look away from the page, write down everything you remember, then check against notes.

3. **Daily Habit Consistency**:
   - Studying 90 minutes every day outperforms an 8-hour marathon session before an exam.
   - Maintain your target daily focus goal in StudySphere to track real progress.`;
}

app.get('/api/ai/status', (_req, res) => {
  res.json({
    available: !!ai,
    engine: ai ? 'gemini-3.8-flash' : 'rule-based',
    message: ai
      ? 'Gemini 3.8 Flash active via server-side Google GenAI SDK'
      : 'StudySphere Academic Rule Engine active (running locally without external API requirements)',
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const { prompt, actionType, studentContext } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  // If Gemini client is available, call it server-side
  if (ai) {
    try {
      const pendingCount = studentContext?.pendingTasksCount ?? 0;
      const overdueCount = studentContext?.overdueCount ?? 0;
      const dailyGoal = studentContext?.dailyGoalMinutes ?? 120;
      const focusMinutes = studentContext?.focusMinutesToday ?? 0;
      const upcomingTasksStr = JSON.stringify(studentContext?.upcomingTasks || []);

      const systemInstruction = `You are StudySphere AI's Senior Academic Mentor & Study Strategist.
Your goal is to provide realistic, structured, compassionate, and actionable study guidance for college and high school students.
Tone: Encouraging, practical, clear, and well-structured. Use clean markdown with clear bullet points, milestones, and time blocks.
Context about the student:
- Active pending tasks: ${pendingCount}
- Overdue tasks: ${overdueCount}
- Daily study goal: ${dailyGoal} minutes
- Completed focus time today: ${focusMinutes} minutes
- Key upcoming deadlines: ${upcomingTasksStr}

Pedagogical Rules:
1. Always give realistic time estimates and incorporate 5-10 minute breaks (Pomodoro technique).
2. Avoid claiming that these steps guarantee specific exam marks or grades.
3. Keep instructions clear, structured, and easy to read.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout after 6 seconds')), 6000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text || '';
      return res.json({
        success: true,
        text,
        source: 'gemini-3.8-flash',
      });
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to rule-based academic engine:', error?.message);
      const fallbackText = generateRuleBasedStudyResponse(prompt, actionType, studentContext);
      return res.json({
        success: true,
        text: fallbackText,
        source: 'rule-based',
        note: `AI service unavailable (${error?.message || 'Network/quota'}). Using StudySphere built-in academic planning engine.`,
      });
    }
  }

  // No API key: gracefully provide realistic rule-based academic response
  const fallbackText = generateRuleBasedStudyResponse(prompt, actionType, studentContext);
  return res.json({
    success: true,
    text: fallbackText,
    source: 'rule-based',
    note: 'Running on built-in StudySphere Academic Rule Engine.',
  });
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudySphere AI server running on http://0.0.0.0:${PORT}`);
});
