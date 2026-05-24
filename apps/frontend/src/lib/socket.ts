import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Tạo một instance socket dùng chung cho toàn bộ ứng dụng
export const socket: Socket = io(API_URL, {
  autoConnect: false, // Sẽ chủ động kết nối khi vào Dashboard thông qua hook
  withCredentials: true,
  transports: ["websocket", "polling"], // Hỗ trợ fallback sang polling nếu websocket bị chặn
});
