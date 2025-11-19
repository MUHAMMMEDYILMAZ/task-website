"use client";

import { useState } from "react";

export default function AiPanel({ tasks }: any) {
  const [open, setOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function schedule() {
    setLoading(true);
    setError("");
    setAiText("");

    const res = await fetch("/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setAiText(data.schedule);
    setLoading(false);
  }

  async function suggest() {
    setLoading(true);
    setError("");
    setAiText("");

    const res = await fetch("/api/ai/suggest");
    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setAiText(data.suggestions);
    setLoading(false);
  }

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 text-white shadow-xl hover:scale-110 transition"
      >
        🤖
      </button>

      {/* PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          ✖
        </button>

        <div className="p-5 mt-10">
          <h2 className="text-lg font-bold">AI Assistant</h2>

          <button onClick={schedule} className="w-full py-2 bg-purple-600 text-white rounded mt-3">
            ⚡ Smart Schedule
          </button>

          <button onClick={suggest} className="w-full py-2 bg-blue-600 text-white rounded mt-2">
            🤖 AI Suggestions
          </button>

          {loading && <p className="text-xs text-gray-500 mt-3">AI is thinking...</p>}
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

          <div className="mt-4 max-h-[60vh] overflow-y-auto bg-gray-50 border p-3 text-sm whitespace-pre-line rounded">
            {aiText || "No AI output yet."}
          </div>
        </div>
      </div>
    </>
  );
}
