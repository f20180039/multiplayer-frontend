import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { auth } from "../config/firebase";
import { AuthType, LocalStorageKey, PLAYER_DEFAULTS } from "../constants";

// Create the Socket context
export const SocketContext = createContext<Socket | null>(null);

export const getAuthPayload = async (): Promise<Record<string, string>> => {
  const authType = localStorage.getItem(LocalStorageKey.AUTH_TYPE);

  if (authType === AuthType.GOOGLE && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    return { token };
  }

  // Guest auth
  const guestId = localStorage.getItem(LocalStorageKey.PLAYER_ID) || "";
  const playerName =
    localStorage.getItem(LocalStorageKey.PLAYER_NAME) ||
    PLAYER_DEFAULTS.GUEST_NAME;
  return { guestId, playerName };
};

export const useSocket = () => {
  return useContext(SocketContext);
};
