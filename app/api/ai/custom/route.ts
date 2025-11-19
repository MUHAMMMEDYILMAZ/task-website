import { NextResponse } from "next/server";

const HF_API_KEY = process.env.HF_API_KEY;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const prompt = `
User daily input:
"${text}"

Create a realistic time schedule for the day.
Output must be bullet points with hours:

Example format:
08:00 - Task A
09:30 - Task B
11:00 - Task C
`;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      plan: data[0]?.generated_text || "",
    });
  } catch (err) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
