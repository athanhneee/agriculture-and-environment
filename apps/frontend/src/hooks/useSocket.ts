"use client";

import { useEffect, useRef, useState } from "react";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth.store";
import { useRealtimeStore } from "@/stores/realtime.store";

export function useSocket(onAlertCreated?: (alert: import("@/stores/realtime.store").Alert) => void) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isConnected, setIsConnected] = useState(false);

  const addReading = useRealtimeStore((state) => state.addReading);
  const addAlert = useRealtimeStore((state) => state.addAlert);

  const onAlertRef = useRef(onAlertCreated);

  useEffect(() => {
    onAlertRef.current = onAlertCreated;
  }, [onAlertCreated]);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      
      return;
    }

    const socket = getSocket(accessToken);

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Connected to Socket.io server");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Disconnected from Socket.io server");
    };

    const handleSensorReading = (payload: { reading: import("@/stores/realtime.store").SensorReading; farmZoneId: string; timestamp: string }) => {
      addReading(payload);
    };

    const handleAlertCreated = (alert: import("@/stores/realtime.store").Alert) => {
      addAlert(alert);
      onAlertRef.current?.(alert);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sensor:global-reading", handleSensorReading);
    socket.on("alert:global", handleAlertCreated);

    if (!socket.connected) {
      socket.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor:global-reading", handleSensorReading);
      socket.off("alert:global", handleAlertCreated);
    };
  }, [accessToken, addReading, addAlert]);

  return { isConnected };
}
