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
 
    try {
      let aiResponseText = "";
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
 
      if (apiKey) {
        // Gọi API Gemini thật
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Bạn là Chuyên gia Nông nghiệp AI (AGRONOMIST ASSISTANT) trong hệ thống giám sát nông trại thông minh (Smart Farm Monitoring). Hãy tư vấn một cách ngắn gọn, chuyên nghiệp, dễ hiểu bằng tiếng Việt có dấu. Hãy dựa vào câu hỏi nông nghiệp của người dùng dưới đây để trả lời:\n\nCâu hỏi: "${text}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
              },
            }),
          }
        );
 
        if (response.ok) {
          const resData = await response.json();
          aiResponseText =
            resData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Tôi đã nhận được câu hỏi nhưng không thể trả lời lúc này. Bạn cần thêm hỗ trợ gì khác không?";
        } else {
          throw new Error("Gemini API error status: " + response.status);
        }
      } else {
        // Fallback Mock AI Agent thông minh dựa trên từ khóa câu hỏi
        const cleanText = text.toLowerCase();
        
        // Trì hoãn 1.2s để tạo cảm giác AI đang xử lý
        await new Promise((resolve) => setTimeout(resolve, 1200));
 
        if (cleanText.includes("phân") || cleanText.includes("bón") || cleanText.includes("npk")) {
          aiResponseText = "Để bón phân hiệu quả cho lúa nước và cây ngắn ngày, bạn nên áp dụng nguyên tắc '4 đúng' (Đúng loại, Đúng liều lượng, Đúng thời điểm, Đúng cách).\n\n- **Đối với lúa nước**: Bón lót (trước cấy), bón thúc lần 1 (10-15 ngày sau cấy để đẻ nhánh) và bón thúc lần 2 (40-45 ngày để đón đòng). Sử dụng phân hỗn hợp NPK chuyên dùng cho lúa.\n- **Đối với cà chua**: Cần chia làm nhiều đợt bón. Đợt 1 sau khi trồng 10 ngày (NPK giàu Đạm), đợt 2 khi cây ra hoa (tăng Lân), đợt 3 khi quả đang lớn (tăng Kali để quả ngọt và chắc trái).";
        } else if (cleanText.includes("nhiệt độ") || cleanText.includes("nóng") || cleanText.includes("lạnh")) {
          aiResponseText = "Trong hệ thống Smart Farm, nhiệt độ tối ưu cho hầu hết các loại cây rau màu là từ **22°C đến 30°C**.\n\n- **Khi nhiệt độ vượt quá 35°C**: Cây trồng có nguy cơ bị héo, cháy lá và rụng hoa. Bạn nên kích hoạt hệ thống lưới che nắng, mở quạt thông gió và phun sương để làm mát cục bộ.\n- **Khi nhiệt độ dưới 18°C**: Tốc độ sinh trưởng của cây giảm rõ rệt. Cần hạn chế tưới nước vào ban đêm để tránh lạnh rễ và kích hoạt đèn sưởi nếu trồng trong nhà kính.";
        } else if (cleanText.includes("độ ẩm") || cleanText.includes("đất") || cleanText.includes("nước") || cleanText.includes("tưới")) {
          aiResponseText = "Quản lý độ ẩm đất là yếu tố then chốt cho năng suất cây trồng:\n\n- **Độ ẩm đất lý tưởng**: Đối với đa số cây trồng là từ **60% - 80%**.\n- **Nếu độ ẩm đất dưới 40% (khô hạn)**: Hệ thống sẽ kích hoạt cảnh báo. Bạn cần bật bơm tưới nhỏ giọt ngay lập tức trong khoảng 15-20 phút để cung cấp đủ nước sâu đến rễ.\n- **Nếu độ ẩm đất trên 85% (ngập úng)**: Bạn phải tắt mọi chế độ tưới tự động và kiểm tra hệ thống thoát nước của vùng trồng để tránh thối rễ, nấm bệnh phát triển.";
        } else if (cleanText.includes("cà chua") || cleanText.includes("cherry")) {
          aiResponseText = "Quy trình chăm sóc cà chua Cherry trong mô hình công nghệ cao:\n\n1. **Giai đoạn cây con**: Giữ độ ẩm đất ổn định ở mức 65-70%. Tưới đạm loãng để thúc đẩy sinh trưởng.\n2. **Giai đoạn ra hoa**: Cần cung cấp nhiều ánh sáng (nắng trực tiếp từ 6-8 tiếng), bón thêm phân Kali-Bo để tăng tỷ lệ đậu trái.\n3. **Phòng bệnh**: Tránh tưới nước trực tiếp lên lá vào chiều tối để ngừa bệnh sương mai (mốc sương) và bệnh héo xanh vi khuẩn.";
        } else if (cleanText.includes("lúa") || cleanText.includes("rice")) {
          aiResponseText = "Lời khuyên kỹ thuật cho canh tác Lúa nước:\n\n- **Giai đoạn làm đòng**: Giữ mực nước ruộng ổn định từ 3-5 cm để bông lúa phát triển đồng đều.\n- **Giai đoạn chín**: Trước khi thu hoạch 10-12 ngày, nên tháo cạn nước ruộng để thúc đẩy lúa chín nhanh và giúp đất khô ráo dễ vận hành máy gặt.\n- **Phòng bệnh Đạo ôn**: Theo dõi sát sao cảm biến nhiệt độ & độ ẩm không khí. Nếu độ ẩm không khí duy trì trên 90% kèm thời tiết âm u, nguy cơ đạo ôn rất cao, hạn chế bón thừa đạm.";
        } else if (cleanText.includes("bệnh") || cleanText.includes("sâu") || cleanText.includes("héo xanh")) {
          aiResponseText = "Biện pháp quản lý dịch hại tích cực (IPM) trong nông trại thông minh:\n\n- **Bệnh héo xanh vi khuẩn**: Do vi khuẩn *Ralstonia solanacearum* gây ra. Cây bị héo đột ngột khi lá vẫn còn xanh. Cần nhổ bỏ cây bệnh, rắc vôi bột vào hố để khử trùng và tuyệt đối không tưới tràn tràn lan từ hố bệnh sang khu vực khác.\n- **Rầy nâu, sâu cuốn lá**: Sử dụng bẫy đèn thông minh để dự báo mật độ sâu hại. Khi phát hiện dấu hiệu, ưu tiên phun các chế phẩm sinh học (Bt, dầu neem) ở giai đoạn đầu để bảo vệ thiên địch.";
        } else {
          aiResponseText = `Cảm ơn bạn đã quan tâm. Về chủ đề "${text}": Trong nông nghiệp thông minh, bạn nên kết hợp số liệu cảm biến thực tế (Nhiệt độ, Độ ẩm đất, Ánh sáng) và kiến thức sinh học của từng giống cây để thiết lập các ngưỡng kích hoạt tưới tiêu và chiếu sáng tự động tối ưu nhất.\n\nNếu bạn gặp vấn đề cụ thể về một loại cây trồng hay dịch hại nào, hãy nhập rõ từ khóa (ví dụ: bón phân, cà chua, lúa nước, độ ẩm đất...) để tôi có thể hỗ trợ chi tiết hơn nhé!`;
        }
      }
 
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date(),
      };
 
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: `Đã xảy ra lỗi kết nối với máy chủ AI: ${err.message}. Lời khuyên nông nghiệp giả lập: Hãy đảm bảo các cảm biến trên cánh đồng hoạt động bình thường và nhiệt độ không vượt quá 32°C.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-800 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Trợ lý AI Nông Nghiệp
                  <Sparkles className="size-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                </h3>
                <p className="text-[10px] text-emerald-100 font-medium">Thành Phát An Smart Farm</p>
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
                      : "bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 text-foreground rounded-tl-none"
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
                <div className="max-w-[75%] bg-card border rounded-2xl rounded-tl-none px-4.5 py-3 text-sm shadow-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-500/80 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 rounded-full bg-teal-500/80 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 rounded-full bg-teal-500/80 animate-bounce"></span>
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
