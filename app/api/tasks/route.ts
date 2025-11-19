export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================
    GET — Get all tasks
========================= */
export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

/* =========================
    POST — Create task
========================= */
export async function POST(req: Request) {
  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      dueAt: new Date(body.dueAt),
      isDone: false,
      updatedAt: null,
    },
  });

  return NextResponse.json(task);
}

/* =========================
    PUT — Edit task
========================= */
export async function PUT(req: Request) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description,
      dueAt: new Date(body.dueAt),
      updatedAt: new Date(), // ⬅ تحديث تاريخ التعديل
    },
  });

  return NextResponse.json(updated);
}

/* =========================
    PATCH — Complete task
========================= */
export async function PATCH(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      isDone: true,
      updatedAt: new Date(), // ⬅ نعتبرها لحظة اكتمال المهمة
    },
  });

  return NextResponse.json(updated);
}

/* =========================
    DELETE — Delete task
========================= */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
  }

  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Task deleted" });
}
