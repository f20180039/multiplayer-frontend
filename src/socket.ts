// src/socket.ts
import { io, Socket } from "socket.io-client";
import { clientEnv } from "./config/env";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(clientEnv.backendUrl, { autoConnect: false });
  }
  return socket;
};
