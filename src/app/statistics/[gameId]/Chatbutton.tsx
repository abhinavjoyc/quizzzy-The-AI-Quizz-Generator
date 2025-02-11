"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const fetchGeminiResponse = async (message: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key is missing.");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't understand that."
    );
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred.";
  }
};

interface ChatBotProps {
  topic: string;
}

export default function ChatBot({ topic }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch topic introduction only when chatbot opens
  const fetchTopicIntro = useCallback(async () => {
    setLoading(true);
    const topicIntro = await fetchGeminiResponse(
      `Explain '${topic}' in a structured way with a short introduction, ending with 'Feel free to ask any doubts!'. Don't bold any part of the sentence.`
    );
    setMessages((prev) => [...prev, { role: "bot", text: topicIntro }]);
    setLoading(false);
  }, [topic]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: "bot", text: `Hi! I am Quizzy. I am here to teach about "${topic}".` },
      ]);
      fetchTopicIntro();
    }
  }, [isOpen, messages.length, fetchTopicIntro]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const botResponse = await fetchGeminiResponse(
      `You are a tutor teaching about '${topic}'. Stay within this topic and provide structured, educational responses. Here is the user's question: ${input}`
    );

    setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
    setLoading(false);
  };

  return (
    <div>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2 text-white bg-black rounded-md hover:bg-gray-800"
      >
        Chat with AI Tutor
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-gray-900 shadow-lg rounded-lg border border-gray-700 text-white">
          {/* Chat Header */}
          <div className="flex justify-between items-center bg-gray-800 p-3 rounded-t-lg">
            <div className="flex flex-col">
              <span className="font-semibold">Quizzy - AI Tutor</span>
              <span className="text-xs text-gray-400">
                Topic: <b>{topic}</b>
              </span>
            </div>
            <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>

          {/* Chat Messages */}
          <div className="p-3 h-64 overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[75%] text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 self-end"
                    : "bg-gray-700 self-start"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-lg max-w-[75%] text-sm bg-gray-700 self-start">
                Quizzy is thinking....
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center p-3 border-t border-gray-700 bg-gray-800">
            <input
              type="text"
              className="flex-1 border border-gray-600 bg-gray-900 text-white rounded-l-md p-2"
              placeholder={`Ask about ${topic}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white p-2 rounded-r-md"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
