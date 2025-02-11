"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Fetch response from Gemini API
const fetchGeminiResponse = async (message) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing. Please check your environment variables.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Error fetching response:", error);
    return "An error occurred. Please try again.";
  }
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput(""); // Clear input after sending

    setLoading(true); // Show "Quizzy is thinking..."
    const botResponse = await fetchGeminiResponse(input);
    setLoading(false); // Hide "Quizzy is thinking..."

    setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-gray-900 shadow-lg rounded-lg border border-gray-700 text-white">
          {/* Chat Header */}
          <div className="flex justify-between items-center bg-gray-800 p-3 rounded-t-lg">
            <span className="font-semibold">Quizzy</span>
            <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>

          {/* Chat Messages */}
          <div className="p-3 h-64 overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[75%] text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white self-end"
                    : "bg-gray-700 text-gray-200 self-start"
                }`}
              >
                {msg.role === "bot" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}

            {/* Show "Quizzy is thinking..." while fetching response */}
            {loading && (
              <div className="p-3 rounded-lg max-w-[75%] text-sm bg-gray-700 text-gray-200 self-start animate-pulse">
                Quizzy is thinking...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center p-3 border-t border-gray-700 bg-gray-800">
            <input
              type="text"
              className="flex-1 border border-gray-600 bg-gray-900 text-white rounded-l-md p-2 focus:outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
