"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CheckSquare, Square, Plus, Clock, User, AlertCircle,
  Check, Trash2, Filter, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueAt?: string;
  priority: number;
  status: string;
  assigneeId?: string;
  leadId?: string;
  lead?: { name?: string; firstName: string };
}

const PRIORITY_COLOR: Record<number, string> = {
  1: "text-text-muted border-border",
  2: "text-yellow-400 border-yellow-500/20",
  3: "text-red-400 border-red-500/20",
};

export default function TasksPage() {
  const { data: tasks, isLoading } = useSWR<Task[]>("/tasks", fetcher);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueAt: "", priority: 1 });
  const [creating, setCreating] = useState(false);

  const filtered = (tasks || []).filter(t => {
    if (filter === "pending") return t.status !== "COMPLETED";
    if (filter === "completed") return t.status === "COMPLETED";
    return true;
  });

  async function createTask() {
    if (!form.title) return;
    setCreating(true);
    try {
      await api.post("/tasks", form);
      mutate("/tasks");
      setForm({ title: "", description: "", dueAt: "", priority: 1 });
      setShowCreate(false);
    } finally { setCreating(false); }
  }

  async function toggleTask(task: Task) {
    await api.patch(`/tasks/${task.id}`, {
      status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED",
      completedAt: task.status === "COMPLETED" ? null : new Date().toISOString(),
    });
    mutate("/tasks");
  }

  async function deleteTask(id: string) {
    await api.delete(`/tasks/${id}`);
    mutate("/tasks");
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Task <span className="text-primary not-italic">Manager</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {(tasks || []).filter(t => t.status !== "COMPLETED").length} pending tasks
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-9 px-5"
        >
          <Plus size={12} className="mr-1.5" /> New Task
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="bg-surface border-border">
          <CardContent className="p-5 space-y-3">
            <Input
              placeholder="Task title*"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-surface-2 border-border"
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-surface-2 border-border"
            />
            <div className="flex gap-3">
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
                className="bg-surface-2 border-border flex-1"
              />
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                className="bg-surface-2 border border-border rounded-lg px-3 text-sm"
              >
                <option value={1}>Low priority</option>
                <option value={2}>Medium priority</option>
                <option value={3}>High priority</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createTask} disabled={creating || !form.title} size="sm" className="bg-primary text-white">
                {creating ? "Creating…" : "Create Task"}
              </Button>
              <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-2/50 p-1 rounded-lg border border-border w-fit">
        {(["all", "pending", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
              filter === f ? "bg-primary text-white" : "text-text-muted hover:text-foreground"
            )}
          >
            {f} ({(tasks || []).filter(t => f === "all" ? true : f === "pending" ? t.status !== "COMPLETED" : t.status === "COMPLETED").length})
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <CheckSquare size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {filter} tasks</p>
          </div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-4 px-4 py-3 rounded-xl border transition-all bg-surface",
                task.status === "COMPLETED" ? "border-border/30 opacity-50" : "border-border hover:border-primary/20"
              )}
            >
              <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0 text-text-muted hover:text-primary transition">
                {task.status === "COMPLETED" ? <CheckSquare size={18} className="text-green-400" /> : <Square size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.status === "COMPLETED" && "line-through")}>{task.title}</p>
                {task.description && <p className="text-[11px] text-text-muted mt-0.5 truncate">{task.description}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  {task.dueAt && (
                    <span className={cn("flex items-center gap-1 text-[10px]", new Date(task.dueAt) < new Date() && task.status !== "COMPLETED" ? "text-red-400" : "text-text-muted")}>
                      <Clock size={10} /> {format(new Date(task.dueAt), "dd MMM, HH:mm")}
                    </span>
                  )}
                  {task.lead && (
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <User size={10} /> {task.lead.name || task.lead.firstName}
                    </span>
                  )}
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest", PRIORITY_COLOR[task.priority] || PRIORITY_COLOR[1])}>
                    {task.priority === 3 ? "High" : task.priority === 2 ? "Med" : "Low"}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="p-1.5 text-text-muted hover:text-red-400 transition shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
