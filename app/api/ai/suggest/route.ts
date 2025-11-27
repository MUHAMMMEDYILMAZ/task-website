// Fix Next.js 16 caching behavior
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function GET() {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY." },
        { status: 500 }
      );
    }

    const prompt = `
Give 6 useful daily tasks.
The user may speak Arabic, English, or Turkish.
Return in English if no language detected.
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
      suggestions:
        data.choices?.[0]?.message?.content || "No suggestions generated.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "AI connection failed." },
      { status: 500 }
    );
  }
}
