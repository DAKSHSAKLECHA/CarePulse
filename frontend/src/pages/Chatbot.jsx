import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm CarePulse AI. How can I help you today? 🌿", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // ✅ API Key Load
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing! Check .env file.");

      const systemContext = `
        You are a helpful and empathetic medical assistant named CarePulse.
        - Answer health-related queries briefly.
        - If symptoms are serious, advise seeing a doctor.
        - Be polite and positive.
        User Query: ${input}
      `;

      // 🔄 FIX: Model changed to 'gemini-1.5-flash-latest' which is more stable
      // If this still fails, try 'gemini-pro'
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: systemContext }] }]
        }
      );

      const botText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't understand that.";

      setMessages((prev) => [...prev, { text: botText, sender: "bot" }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      let errorMsg = "Sorry, I'm having trouble connecting.";
      
      // Error handling to show exact issue
      if (error.response) {
        // If 1.5 Flash fails, suggest switching to Pro
        if (error.response.status === 404) {
           errorMsg = "Model Error: Please switch model to 'gemini-pro' in Chatbot.jsx code.";
        } else {
           errorMsg += ` (${error.response.data.error.message})`;
        }
      } else if (error.message.includes("API Key missing")) {
        errorMsg = "System Error: API Key not found.";
      }

      setMessages((prev) => [...prev, { text: errorMsg, sender: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 pt-24 pb-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-teal-100 flex flex-col h-[70vh]">
        
        {/* Header */}
        <div className="bg-teal-600 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">
            🤖
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">CarePulse Assistant</h2>
            <p className="text-teal-100 text-xs">AI Powered Health Support</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
             <div className="text-xs text-gray-400 ml-4 animate-pulse">CarePulse is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about symptoms, wellness..."
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}