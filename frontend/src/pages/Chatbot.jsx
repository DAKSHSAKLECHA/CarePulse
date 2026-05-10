import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "../../services/aiService";

const FF   = "'DM Sans', 'Segoe UI', sans-serif";
const TEAL = "#0a7e6e";
const NAVY = "#0d1b2a";

const SUGGESTED = [
  "I have a fever and headache",
  "What are diabetes symptoms?",
  "My chest hurts when I breathe",
  "How to reduce blood pressure naturally?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "14px 18px", background: "white", borderRadius: "18px 18px 18px 4px", border: "1px solid #e8edf2", width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, index }) {
  const isUser = msg.sender === "user";

  // Simple markdown-like formatting for bot messages
  const formatText = (text) => {
    if (!text) return text;
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} style={{ fontWeight: 800, margin: "6px 0 2px", color: NAVY }}>{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("• ") || line.startsWith("- ")) {
          return <p key={i} style={{ margin: "3px 0", paddingLeft: 8, display: "flex", gap: 6 }}><span style={{ color: TEAL, flexShrink: 0 }}>•</span>{line.slice(2)}</p>;
        }
        if (line.trim() === "") return <br key={i} />;
        return <p key={i} style={{ margin: "3px 0" }}>{line}</p>;
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0, marginRight: 8, alignSelf: "flex-end", boxShadow: `0 4px 10px ${TEAL}30` }}>
          🤖
        </div>
      )}

      <div style={{
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? `linear-gradient(135deg, ${TEAL}, #0d9488)` : "white",
        color: isUser ? "white" : NAVY,
        fontSize: "0.875rem",
        lineHeight: 1.6,
        border: isUser ? "none" : "1px solid #e8edf2",
        boxShadow: isUser ? `0 4px 14px ${TEAL}30` : "0 2px 8px rgba(0,0,0,0.04)",
        fontFamily: FF,
      }}>
        {isUser ? msg.text : formatText(msg.text)}

        {/* Timestamp */}
        <p style={{ fontSize: "0.62rem", margin: "6px 0 0", opacity: 0.55, textAlign: "right" }}>
          {msg.time}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, #4f46e5, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0, marginLeft: 8, alignSelf: "flex-end", fontWeight: 800, color: "white" }}>
          {(JSON.parse(localStorage.getItem("user") || "{}").name || "U").charAt(0).toUpperCase()}
        </div>
      )}
    </motion.div>
  );
}

export default function Chatbot() {
  const [messages,  setMessages]  = useState([{
    text: "Hello! I'm **CareAI**, your intelligent clinical health assistant.\n\nI can help you understand symptoms, explain medical terms, and guide you on when to see a doctor.\n\n⚠️ CareAI provides health guidance — always consult a real doctor for medical decisions.",
    sender: "bot",
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [history,   setHistory]   = useState([]); // conversation history for Claude
  const messagesEndRef = useRef(null);
  const inputRef        = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Add user message to UI
    setMessages(prev => [...prev, { text: userText, sender: "user", time: now }]);
    setInput("");
    setIsTyping(true);

    // Build conversation history for Claude (maintains context)
    const newHistory = [...history, { role: "user", content: userText }];

    try {
      const data = await sendChatMessage(newHistory);

      const botText = data.reply || "Sorry, I couldn't process that. Please try again.";
      const botTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

      // Update history with assistant reply (for multi-turn context)
      setHistory([...newHistory, { role: "assistant", content: botText }]);

      setMessages(prev => [...prev, { text: botText, sender: "bot", time: botTime }]);

    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMsg = err.message?.includes("API key") || err.message?.includes("401")
        ? "⚠️ Invalid API key. Check ANTHROPIC_API_KEY in your backend .env file."
        : err.message?.includes("fetch") || err.message?.includes("network")
        ? "⚠️ Cannot reach backend. Make sure your Express server is running."
        : `⚠️ Error: ${err.message}`;

      setMessages(prev => [...prev, { text: errorMsg, sender: "bot", time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      text: "Chat cleared! How can I help you today? 🌿",
      sender: "bot",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setHistory([]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f9f7 0%, #ffffff 60%, #eef4fb 100%)", fontFamily: FF, paddingTop: "5.5rem", paddingBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 720, padding: "0 1rem", display: "flex", flexDirection: "column", height: "calc(100vh - 7.5rem)" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: `linear-gradient(135deg, ${NAVY}, #0a3d35)`, borderRadius: "20px 20px 0 0", padding: "1.2rem 1.6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(10,126,110,0.3)", border: "1px solid rgba(10,126,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              🤖
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 800, margin: 0, fontSize: "1rem", letterSpacing: "-0.01em" }}>CareAI</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s ease-in-out infinite" }} />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", margin: 0, fontWeight: 500 }}>✦ AI-Assisted Analysis · Online</p>
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            style={{ padding: "6px 14px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", fontFamily: FF }}>
            Clear Chat
          </button>
        </motion.div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.4rem", background: "#f8fafc", borderLeft: "1px solid #e8edf2", borderRight: "1px solid #e8edf2", scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} />
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, #0d9488)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>🤖</div>
              <TypingDots />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions — only show when few messages */}
        {messages.length <= 2 && !isTyping && (
          <div style={{ background: "#f8fafc", padding: "10px 14px", borderLeft: "1px solid #e8edf2", borderRight: "1px solid #e8edf2", display: "flex", gap: 7, flexWrap: "wrap" }}>
            {SUGGESTED.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{ padding: "6px 13px", borderRadius: 99, background: `${TEAL}0d`, border: `1px solid ${TEAL}20`, color: TEAL, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", fontFamily: FF, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{ background: "white", borderRadius: "0 0 20px 20px", padding: "1rem 1.2rem", border: "1px solid #e8edf2", borderTop: "none", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about symptoms, conditions, medications… (Enter to send)"
            style={{
              flex: 1, padding: "11px 14px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", background: "#f8fafc",
              fontSize: "0.875rem", color: NAVY, outline: "none",
              fontFamily: FF, resize: "none", lineHeight: 1.5,
              overflow: "hidden", transition: "border-color 0.2s",
              minHeight: 44,
            }}
            onFocus={e => e.target.style.borderColor = TEAL}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isTyping || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: isTyping || !input.trim() ? "#f1f5f9" : `linear-gradient(135deg, ${TEAL}, #0d9488)`,
              border: "none", cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", boxShadow: input.trim() && !isTyping ? `0 4px 14px ${TEAL}30` : "none",
              transition: "all 0.2s",
            }}
          >
            {isTyping ? "⏳" : "🚀"}
          </button>
        </div>

        {/* Disclaimer */}
        <p style={{ textAlign: "center", fontSize: "0.65rem", color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.5 }}>
          ⚠️ ⚕️ CareAI provides clinically-informed guidance only. Always consult a qualified doctor for medical advice.
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>
    </div>
  );
}