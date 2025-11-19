"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "./ui/dialog";
import { Trash2, Pencil, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";

export default function TaskList({ tasks, refresh }: any) {
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDue, setEditDue] = useState("");

  async function completeTask(id: string) {
    await fetch("/api/tasks", { method: "PATCH", body: JSON.stringify({ id }) });
    refresh();
  }

  async function deleteTask(id: string) {
    await fetch("/api/tasks", { method: "DELETE", body: JSON.stringify({ id }) });
    refresh();
  }

  async function updateTask() {
    await fetch("/api/tasks", {
      method: "PUT",
      body: JSON.stringify({ id: editId, title: editTitle, description: editDesc, dueAt: editDue }),
    });
    refresh();
  }

  if (tasks.length === 0)
    return (
      <Card className="p-12 text-center bg-white/50 backdrop-blur animate-fadeIn">
        <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No tasks here.</p>
      </Card>
    );

  return tasks.map((t: any) => (
    <Card key={t.id} className={`p-4 flex items-center justify-between rounded-lg shadow-sm bg-white animate-taskAppear ${t.isDone ? "opacity-60" : ""}`}>
      <div>
        <p className="font-medium text-lg">{t.title}</p>
        {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
        <p className="text-xs text-gray-500 mt-1">Due: {format(new Date(t.dueAt), "PPpp")}</p>
      </div>

      <div className="flex gap-3">

        {/* COMPLETE */}
        <Button
          size="sm"
          onClick={() => completeTask(t.id)}
          disabled={t.isDone}
          className={`${t.isDone ? "opacity-40" : "bg-green-600 hover:bg-green-700"}`}
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>

        {/* EDIT */}
        <Dialog
          onOpenChange={(open) => {
            if (open) {
              setEditId(t.id);
              setEditTitle(t.title);
              setEditDesc(t.description || "");
              setEditDue(t.dueAt.slice(0, 16));
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" disabled={t.isDone}>
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>

            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Input type="datetime-local" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />

            <DialogFooter>
              <Button onClick={updateTask}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={t.isDone}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task?</DialogTitle>
            </DialogHeader>

            <p>Delete <b>{t.title}</b>?</p>

            <DialogFooter>
              <Button variant="destructive" onClick={() => deleteTask(t.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Card>
  ));
}
