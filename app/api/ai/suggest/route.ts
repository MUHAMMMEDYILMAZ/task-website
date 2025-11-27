// Fix for Next.js 16 API Runtime issues
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const preferredRegion = "auto";
export const maxDuration = 60;

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

    // Internet test
    const test = await fetch("https://httpbin.org/get").catch(() => null);

    if (!test || !test.ok) {
      return NextResponse.json(
        { error: "Server has no internet access." },
        { status: 500 }
      );
    }

    const prompt = `
Give 6 useful daily tasks.
The user may speak Arabic, English, or Turkish.
Return the list in one language only.
If input is empty, return in English.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // Raw logging for debugging
    const raw = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: raw }, { status: 500 });
    }

    const data = JSON.parse(raw);

    return NextResponse.json({
      suggestions: data.choices?.[0]?.message?.content || "No suggestions generated.",
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error while generating suggestions: ${err}` },
      { status: 500 }
    );
  }
}
