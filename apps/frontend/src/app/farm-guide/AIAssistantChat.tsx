"use client";
 
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles, HelpCircle } from "lucide-react";
 
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}
 
const SUGGESTIONS = [
  "Cách bón phân NPK cho lúa nước hiệu quả?",
  "Nhiệt độ và độ ẩm tốt nhất cho cây cà chua là bao nhiêu?",
  "Đất bị khô (độ ẩm < 40%) thì nên tưới lượng nước thế nào?",
  "Làm sao phòng ngừa bệnh héo xanh ở cây trồng?",
];
 
export function AIAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Tôi là Trợ lý AI Nông nghiệp. Tôi có thể giúp bạn giải đáp các thắc mắc về kỹ thuật canh tác, quản lý vùng trồng, và cách xử lý khi cảm biến cảnh báo bất thường. Hãy đặt câu hỏi cho tôi nhé!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
 
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
 
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
 
    // Thêm tin nhắn của người dùng
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
 
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
 
    // Hiển thị trạng thái AI đang gõ
    setIsTyping(true);
 
    // Giả lập phản hồi (sẽ được thay bằng API Gemini thật ở commit sau)
    setTimeout(() => {
      const aiResponseText = `Cảm ơn bạn đã hỏi: "${text}". Đây là phản hồi giả lập từ Trợ lý AI. Ở commit tiếp theo, tôi sẽ được kết nối trực tiếp với mô hình Google Gemini AI để đưa ra tư vấn nông nghiệp chính xác nhất cho bạn!`;
      
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };
 
  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút bong bóng chat bay */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 duration-300 relative group cursor-pointer"
        >
          <MessageSquare className="size-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="absolute right-16 bg-card border text-foreground text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Hỏi trợ lý AI Nông Nghiệp ✨
          </span>
        </button>
      )}
 
      {/* Hộp thoại Chat */}
      {isOpen && (
        <div className="flex h-[550px] w-[380px] sm:w-[400px] flex-col rounded-2xl border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in-50 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Chuyên gia Nông nghiệp AI
                  <Sparkles className="size-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                </h3>
                <p className="text-[10px] text-emerald-100 font-medium">Tự động hóa & Tư vấn sinh học</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 hover:bg-white/10 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
 
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 dark:bg-muted/5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex size-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold ${
                    msg.sender === "user"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                  }`}
                >
                  {msg.sender === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
 
                {/* Bong bóng text */}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-card border text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      msg.sender === "user" ? "text-emerald-200" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
 
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Bot className="size-4" />
                </div>
                <div className="max-w-[75%] bg-card border rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
 
          {/* Quick Suggestions */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 py-2 bg-muted/10 border-t space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <HelpCircle className="size-3" /> Gợi ý câu hỏi nhanh:
              </p>
              <div className="flex flex-col gap-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline truncate cursor-pointer font-medium"
                  >
                    • {s}
                  </button>
                ))}
              </div>
            </div>
          )}
 
          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2 border-t p-3 bg-card"
          >
            <input
              type="text"
              placeholder="Hỏi về canh tác, sâu bệnh..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
