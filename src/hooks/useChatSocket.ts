// src/hooks/useChatSocket.ts
import { useEffect, useState } from "react";
import { socket } from "../socket";
import { SOCKET_EVENTS } from "../constants";

export interface ChatMessage {
  playerName: string;
  message: string;
  timestamp: string;
}

export const useChatSocket = (roomId: string, playerName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomId || !playerName) return;

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE);
    };
  }, [roomId, playerName]);

  const sendMessage = (message: string) => {
    if (message.trim()) {
      socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
        roomId,
        playerName,
        message,
      });
    }
  };

  return { messages, sendMessage };
};
