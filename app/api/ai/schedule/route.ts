export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// ⚠️ لا تضع runtime=nodejs — يخرب خارج Vercel
// export const runtime = "nodejs";

import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY in environment." },
        { status: 500 }
      );
    }

    const { tasks, hint } = await req.json();

    const prompt = `
You are an AI that creates a smart daily plan.
User language may be: Arabic, English, or Turkish.

User hint:
"${hint || "No hint"}"

User tasks:
${(tasks || [])
  .map(
    (t: any, i: number) =>
      `${i + 1}) ${t.title} - Due: ${t.dueAt} - Description: ${
        t.description || "none"
      }`
  )
  .join("\n")}

Return:
- timeline
- priorities
- work/study blocks
- breaks
- explanation
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://daily-tasks-ai.vercel.app",
        "X-Title": "DailyTasksAI",
      },
      body: JSON.stringify({
model: "x-ai/grok-4.1-fast:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: raw }, { status: 500 });
    }

    const data = JSON.parse(raw);

    return NextResponse.json({
      schedule: data.choices?.[0]?.message?.content || "No schedule generated.",
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error: ${err}` },
      { status: 500 }
    );
  }
}
