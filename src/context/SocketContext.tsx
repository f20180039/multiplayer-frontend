import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(URL, { autoConnect: false }); // Delay connection
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
