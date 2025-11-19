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
Return the list in one language only:
- If input is empty, return in English.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
model: "mistralai/mistral-small-24b-instruct:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      suggestions:
        data.choices?.[0]?.message?.content || "No suggestions generated.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error while generating suggestions." },
      { status: 500 }
    );
  }
}
