import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { auth } from "../config/firebase";

const AUTH_TYPE_KEY = "authType";
const PLAYER_ID_KEY = "playerId";
const PLAYER_NAME_KEY = "playerName";

// Create the Socket context
export const SocketContext = createContext<Socket | null>(null);

export const getAuthPayload = async (): Promise<Record<string, string>> => {
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

export const useSocket = () => {
  return useContext(SocketContext);
};
