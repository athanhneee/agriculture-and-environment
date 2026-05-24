"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export const socketBaseUrl = SOCKET_URL;

let socket: Socket | null = null;

export function getSocket(accessToken?: string | null) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: accessToken ? { token: accessToken } : undefined,
    });
  }

  socket.auth = accessToken ? { token: accessToken } : {};
  return socket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
