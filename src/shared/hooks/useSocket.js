import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket(tenantId, onIssueUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tenantId) return;
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("joinTenant", tenantId);

    socketRef.current.on("issueUpdated", (data) => {
      if (onIssueUpdate) onIssueUpdate(data);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [tenantId]);

  return socketRef.current;
}
