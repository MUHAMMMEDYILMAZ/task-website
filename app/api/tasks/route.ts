import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("taskproject");

  const tasks = await db
    .collection("tasks")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  // تحويل `_id` → `id`
  const mapped = tasks.map((t: any) => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    dueAt: t.dueAt,
    isDone: t.isDone,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const body = await req.json();

  const client = await clientPromise;
  const db = client.db("taskproject");

  const task = {
    title: body.title,
    description: body.description || "",
    dueAt: new Date(body.dueAt),
    isDone: false,
    createdAt: new Date(),
    updatedAt: null,
  };

  const result = await db.collection("tasks").insertOne(task);

  return NextResponse.json({
    id: result.insertedId.toString(),
    ...task,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("taskproject");

  await db.collection("tasks").updateOne(
    { _id: new ObjectId(body.id) },
    {
      $set: {
        title: body.title,
        description: body.description,
        dueAt: new Date(body.dueAt),
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("taskproject");

  await db.collection("tasks").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isDone: true,
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("taskproject");

  await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ ok: true });
}
