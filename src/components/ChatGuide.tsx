import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, HelpCircle, Sparkles } from "lucide-react";
import { ChatMessage } from "../types";

export default function ChatGuide() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Namaste! I am Devalaya Mitra, your spiritual helper. How may I guide you on your holy pilgrimage today? You can ask me about temple dress codes, timings, prasadam, or booking guides.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    "What is the dress code?",
    "Temple timings & free meals?",
    "Locker rules for phones?",
    "How to book Kalyanotsavam?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput("");

    // Add user message
    const userMsg: ChatMessage = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      const botMsg: ChatMessage = {
        sender: "bot",
        text: data.text || "I am currently meditating. Please try again soon.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        sender: "bot",
        text: "Apologies, pilgrim. I am unable to connect to the divine server right now. Please check your internet connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-saffron-600 hover:bg-saffron-700 text-amber-50 rounded-full p-4 shadow-xl z-50 flex items-center gap-2 hover:scale-105 transition-all group border-2 border-amber-300"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-32 transition-all duration-300 text-xs font-semibold whitespace-nowrap font-cinzel">
          Devalaya Mitra
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl border border-amber-100 shadow-2xl z-50 flex flex-col overflow-hidden traditional-glow-strong">
          {/* Header */}
          <div className="bg-gradient-to-r from-saffron-700 to-saffron-800 text-amber-50 p-4 flex items-center justify-between border-b border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-300 shadow-sm shrink-0 bg-white">
                <img src="/gallery/logo.png" alt="Devalaya Mitra Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-cinzel text-xs font-bold tracking-wider">DEVALAYA MITRA</h3>
                <span className="text-[10px] text-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online Temple Guide
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-amber-100 hover:text-amber-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/20">
            {messages.map((msg, index) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={index} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${isBot ? "" : "flex-row-reverse"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isBot ? "bg-saffron-100 text-saffron-700" : "bg-amber-100 text-amber-900"
                    }`}>
                      {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot 
                          ? "bg-white border border-amber-100/50 text-amber-950 rounded-tl-sm shadow-sm" 
                          : "bg-saffron-600 text-amber-50 rounded-tr-sm shadow-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-amber-700/60 mt-1 block px-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-amber-100/50 p-3 rounded-2xl text-xs rounded-tl-sm shadow-sm flex items-center gap-2 text-amber-700/70 italic">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-saffron-500" />
                    Consulting temple archives...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="p-2 border-t border-amber-100 bg-amber-50/50 flex flex-wrap gap-1.5 justify-center">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[10px] bg-white border border-amber-200/50 hover:bg-amber-50 text-amber-900 rounded-full px-2.5 py-1 flex items-center gap-1 font-medium transition-all disabled:opacity-50"
              >
                <HelpCircle className="w-3 h-3 text-amber-600" />
                {q}
              </button>
            ))}
          </div>

          {/* Input form */}
          <div className="p-3 border-t border-amber-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about dress codes, pujas, laddus..."
              disabled={loading}
              className="flex-1 bg-amber-50/50 text-xs border border-amber-100 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-saffron-500 text-amber-950 placeholder-amber-700/40"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-saffron-600 hover:bg-saffron-700 text-amber-50 p-2.5 rounded-xl disabled:opacity-40 transition-all shadow shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
