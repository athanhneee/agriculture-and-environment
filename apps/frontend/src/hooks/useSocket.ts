"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { useRealtimeStore } from "@/stores/realtime.store";

export function useSocket(onAlertCreated?: (alert: any) => void) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const addReading = useRealtimeStore((state) => state.addReading);
  const addAlert = useRealtimeStore((state) => state.addAlert);
  
  // Dùng ref để giữ callback tránh re-trigger useEffect khi callback thay đổi
  const onAlertRef = useRef(onAlertCreated);
  useEffect(() => {
    onAlertRef.current = onAlertCreated;
  }, [onAlertCreated]);

  useEffect(() => {
    // Bắt đầu kết nối
    socket.connect();

    const handleConnect = () => {
      setIsConnected(true);
      console.log("🔌 Connected to Socket.io server");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("🔌 Disconnected from Socket.io server");
    };

    const handleSensorReading = (payload: any) => {
      addReading(payload);
    };

    const handleAlertCreated = (alert: any) => {
      addAlert(alert);
      if (onAlertRef.current) {
        onAlertRef.current(alert);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sensor:global-reading", handleSensorReading);
    socket.on("alert:global", handleAlertCreated);

    // Hủy đăng ký khi Component unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor:global-reading", handleSensorReading);
      socket.off("alert:global", handleAlertCreated);
      socket.disconnect();
    };
  }, [addReading, addAlert]);

  return { isConnected };
}
