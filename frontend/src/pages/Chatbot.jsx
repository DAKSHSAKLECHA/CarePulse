import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm CarePulse AI. How can I help you today? 🌿", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("API Key missing in .env");
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      // ✅ THIS MODEL WORKS FOR ALL NEW KEYS
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(`
        You are CarePulse, a helpful medical assistant.
        Answer briefly and politely.
        If serious symptoms, advise doctor visit.

        User Query: ${input}
      `);

      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { text, sender: "bot" }]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { text: "AI Error: Please check API key permissions.", sender: "bot" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 pt-24 pb-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-teal-100 flex flex-col h-[70vh]">

        <div className="bg-teal-600 p-4 text-white font-bold">
          CarePulse Assistant 🤖
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-white border"
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="text-xs text-gray-400 animate-pulse">
              CarePulse is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-100 rounded-xl outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about symptoms..."
          />
          <button
            onClick={handleSend}
            className="bg-teal-600 text-white px-4 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}