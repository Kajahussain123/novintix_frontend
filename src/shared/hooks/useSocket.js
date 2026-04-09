import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useSocket(tenantId, onEvent, eventName = "issueUpdated") {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tenantId) return;
    
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("joinTenant", tenantId);

    if (onEvent) {
      socket.on(eventName, onEvent);
    }

    return () => {
      socket.disconnect();
    };
  }, [tenantId, eventName]);

  return socketRef.current;
}
