export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

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

User hint about his day:
"${hint || "No hint"}"

User tasks:
${(tasks || [])
  .map(
    (t: any, i: number) =>
      `${i + 1}) ${t.title} - Due: ${t.dueAt} - Description: ${
        t.description || "no description"
      }`
  )
  .join("\n")}

Return a well-organized schedule with:
- time ranges
- priorities
- study / work blocks
- break times
- short explanation

Return the result in the same language as the user’s hint.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DailyTaskAI",
      },
      body: JSON.stringify({
model: "x-ai/grok-4.1-fast:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await response.json();

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
