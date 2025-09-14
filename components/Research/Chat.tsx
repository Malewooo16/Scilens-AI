"use client";

import { chatBot } from "@/actions/chat";
import { useActionState } from "react";
import { useState, useRef, useEffect } from "react";
import FormattedSummary from "./Formatted";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // `useActionState` to bind our action
  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      const query = formData.get("query") as string;
      if (!query) return prev;

      // Call your server action
      const response = await chatBot(query);

      return {
        answer: response.answer,
        sources: response.sources,
        query,
      };
    },
    null
  );

  // Update messages when state changes
  if (state && messages[messages.length - 1]?.content !== state.answer) {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: state.query },
      { role: "assistant", content: state.answer, sources: state.sources },
    ]);
  }

  // Filter sources by unique sourceUrl before displaying
const uniqueSources = (sources?: any[]) => {
  if (!sources) return [];
  const map = new Map<string, any>();
  sources.forEach((s) => {
    if (s.sourceUrl && !map.has(s.sourceUrl)) map.set(s.sourceUrl, s);
  });
  return Array.from(map.values());
};


  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  return (
    <div className="w-full mx-auto p-4 flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-150px)] lg:h-[calc(100vh-200px)] md:max-w-3xl lg:max-w-4xl">
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-emerald-50 shadow space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-xl break-words ${
              msg.role === "user"
                ? "bg-teal-200 text-teal-900 ml-auto"
                : "bg-emerald-100 text-emerald-900"
            }`}
          >
           <FormattedSummary text={msg.content} />
          {msg.sources && msg.sources.length > 0 && (
  <div className="mt-2 text-xs text-emerald-700">
    Sources:
    <ul className="list-disc ml-4">
      {uniqueSources(msg.sources).map((s, idx) => (
        <li key={idx}>
          <a
            href={s.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {s.metadata?.title || s.sourceUrl}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

          </div>
        ))}
        {isPending && (
          <p className="text-emerald-700 italic">Assistant is thinking...</p>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <form action={formAction} className="flex gap-2 mt-4">
        <input
          name="query"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-emerald-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
          placeholder="Type your question..."
          disabled={isPending}
        />
        <button
          type="submit"
          className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 disabled:opacity-50"
          disabled={isPending}
        >
          Send
        </button>
      </form>
    </div>
  );
}
