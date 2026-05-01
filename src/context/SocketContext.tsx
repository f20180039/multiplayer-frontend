import { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthPayload } from "./socketUtils";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = io(URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Set auth payload before each connection attempt
    s.on("reconnect_attempt", async () => {
      s.auth = await getAuthPayload();
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
