import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { auth } from "../config/firebase";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const AUTH_TYPE_KEY = "authType";
const PLAYER_ID_KEY = "playerId";
const PLAYER_NAME_KEY = "playerName";

const SocketContext = createContext<Socket | null>(null);

const getAuthPayload = async (): Promise<Record<string, string>> => {
  const authType = localStorage.getItem(AUTH_TYPE_KEY);

  if (authType === "google" && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    return { token };
  }

  // Guest auth
  const guestId = localStorage.getItem(PLAYER_ID_KEY) || "";
  const playerName = localStorage.getItem(PLAYER_NAME_KEY) || "Guest";
  return { guestId, playerName };
};

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

export const useSocket = () => {
  return useContext(SocketContext);
};

export { getAuthPayload };
