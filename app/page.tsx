"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueAt: string;
  isDone: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Add Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");

  // Edit Form
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDue, setEditDue] = useState("");

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // AI panel
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiHint, setAiHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"schedule" | "suggest" | null>(null);
  const [aiError, setAiError] = useState("");

  // Completion sound
  const completionAudio =
    typeof Audio !== "undefined" ? new Audio("/complete.mp3") : null;

  /* Load Tasks */
  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  /* Add Task */
  async function addTask() {
    if (!title || !dueAt) return;

    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description, dueAt }),
    });

    setTitle("");
    setDescription("");
    setDueAt("");

    fetchTasks();
  }

  /* Delete Task */
  async function deleteTask(id: string) {
    await fetch("/api/tasks", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    fetchTasks();
  }

  /* Complete Task */
  async function completeTask(id: string) {
    await fetch("/api/tasks", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });

    if (completionAudio) {
      completionAudio.volume = 0.5;
      completionAudio.play();
    }
    fetchTasks();
  }

  /* Edit Task */
  async function updateTask() {
    if (!editId) return;

    await fetch("/api/tasks", {
      method: "PUT",
      body: JSON.stringify({
        id: editId,
        title: editTitle,
        description: editDesc,
        dueAt: editDue,
      }),
    });

    fetchTasks();
  }

  /* Filtering */
  const activeTasks = tasks.filter((t) => !t.isDone);
  const completedTasks = tasks.filter((t) => t.isDone);

  const filtered =
    filter === "all"
      ? activeTasks
      : filter === "active"
      ? activeTasks
      : completedTasks;

  /* AI: Generate smart schedule */
  async function generateSchedule() {
    try {
      setAiLoading(true);
      setAiError("");
      setAiMode("schedule");
      setAiText("");

      const prompt = `
The user may speak Arabic, English, or Turkish.
Respond in the SAME language the user typed their hint.

User daily description:
"${aiHint || "No description"}"

User tasks:
${tasks
  .map(
    (t, i) =>
      `${i + 1}) ${t.title} - Due: ${t.dueAt} - Description: ${
        t.description || "none"
      }`
  )
  .join("\n")}

Provide:
- Timeline
- Priorities
- Time blocks
- Breaks
- Explanations
`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "DailyTaskAI",
        },
       body: JSON.stringify({
  model: "moonshotai/kimi-k2:free",
  messages: [{ role: "user", content: prompt }],
}),

      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "AI error";
        setAiError(msg);
        return;
      }

      setAiText(data.choices?.[0]?.message?.content || "No schedule generated.");
    } catch (err) {
      setAiError("AI connection failed.");
    } finally {
      setAiLoading(false);
    }
  }

  /* AI: Suggestions */
  async function getSuggestions() {
    try {
      setAiLoading(true);
      setAiError("");
      setAiMode("suggest");
      setAiText("");

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "DailyTaskAI",
        },
        body: JSON.stringify({
  model: "moonshotai/kimi-k2:free",
          messages: [
            {
              role: "user",
              content: "Give me 6 useful daily tasks to improve life.",
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "AI error";
        setAiError(msg);
        return;
      }

      setAiText(data.choices?.[0]?.message?.content || "No suggestions.");
    } catch (err) {
      setAiError("AI connection failed.");
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-14 px-4">

      {/* MAIN CONTENT */}
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl mb-2 font-bold">
            My Daily Tasks
          </h1>
          <p className="text-lg text-gray-600">Stay organized and productive</p>
        </div>

        {/* ADD TASK FORM */}
        <Card className="p-6 shadow-lg mb-6 bg-white/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }}
            className="space-y-3"
          >
            <Input
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />

            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button className="w-full gap-2" size="lg">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </form>
        </Card>

        {/* FILTERS */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setFilter("all")}
          >
            Tasks ({activeTasks.length})
          </Button>

          <Button
            variant={filter === "active" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setFilter("active")}
          >
            Active ({activeTasks.length})
          </Button>

          <Button
            variant={filter === "completed" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setFilter("completed")}
          >
            Completed ({completedTasks.length})
          </Button>
        </div>

        {/* TASK LIST */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="p-12 text-center bg-white/50">
              <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks here.</p>
            </Card>
          ) : (
            filtered.map((t) => (
              <Card
                key={t.id}
                className={`p-4 flex items-center justify-between bg-white shadow-sm rounded-lg ${
                  t.isDone ? "opacity-60" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-lg">{t.title}</p>
                  {t.description && (
                    <p className="text-sm text-gray-600">{t.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {format(new Date(t.dueAt), "PPpp")}
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* COMPLETE */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={t.isDone}
                        className={`flex gap-1 ${
                          t.isDone
                            ? "opacity-40"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete
                      </Button>
                    </DialogTrigger>

                    {!t.isDone && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mark as completed?</DialogTitle>
                        </DialogHeader>
                        <p>
                          Confirm completing <b>{t.title}</b>?
                        </p>
                        <DialogFooter>
                          <Button
                            onClick={() => completeTask(t.id)}
                            className="bg-green-600"
                          >
                            Yes, complete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>

                  {/* EDIT */}
                  <Dialog
                    onOpenChange={(open) => {
                      if (open && !t.isDone) {
                        setEditId(t.id);
                        setEditTitle(t.title);
                        setEditDesc(t.description || "");
                        setEditDue(t.dueAt.slice(0, 16));
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={t.isDone}
                        className={t.isDone ? "opacity-40" : ""}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>

                    {!t.isDone && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                          <Input
                            type="datetime-local"
                            value={editDue}
                            onChange={(e) => setEditDue(e.target.value)}
                          />
                          <Textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                          />
                        </div>

                        <DialogFooter>
                          <Button onClick={updateTask}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>

                  {/* DELETE */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={t.isDone}
                        className={t.isDone ? "opacity-40" : ""}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </DialogTrigger>

                    {!t.isDone && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Task?</DialogTitle>
                        </DialogHeader>
                        <p>
                          Are you sure you want to delete <b>{t.title}</b>?
                        </p>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => deleteTask(t.id)}
                          >
                            Yes, delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* FLOATING AI BUTTON */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl"
      >
        🤖
      </button>

      {/* AI PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l transform transition-transform duration-300 z-50 ${
          aiOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setAiOpen(false)}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✖
        </button>

        <div className="p-5 mt-10 flex flex-col gap-3">
          <h2 className="text-lg font-semibold">AI Planner</h2>
          <p className="text-xs text-gray-500">
            اكتب وصف يومك بسرعة (جامعة، دوام، جيم، مذاكرة…) والذكاء ينظم لك يومك.
          </p>

          <Textarea
            rows={4}
            value={aiHint}
            onChange={(e) => setAiHint(e.target.value)}
            placeholder="مثال: عندي جامعة من 9 للـ1، بعد العصر شغل، مساءً مذاكرة."
            className="text-xs"
          />

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={generateSchedule}
              disabled={aiLoading}
            >
              🔥 Organize My Day
            </Button>

            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={getSuggestions}
              disabled={aiLoading}
            >
              🤖 Generic Suggestions
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            {aiLoading
              ? "AI is thinking..."
              : aiMode === "schedule"
              ? "Schedule generated based on tasks + your hint"
              : aiMode === "suggest"
              ? "General AI suggestions"
              : ""}
          </div>

          {aiError && (
            <div className="text-xs text-red-500">{aiError}</div>
          )}

          <div className="mt-2 max-h-[60vh] overflow-y-auto text-sm whitespace-pre-line border rounded-lg p-2 bg-gray-50">
            {aiText || "No AI output yet."}
          </div>
        </div>
      </div>
    </div>
  );
}
