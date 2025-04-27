// src/socket.ts
import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(URL, { autoConnect: false });
  }
  return socket;
};
