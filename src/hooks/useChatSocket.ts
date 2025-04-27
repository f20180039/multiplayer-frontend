// src/hooks/useChatSocket.ts
import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "../constants";
import { useSocket } from "../context/SocketContext";

export interface ChatMessage {
  playerName: string;
  message: string;
  timestamp: string;
}

export const useChatSocket = (roomId: string, playerName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!roomId || !playerName || !socket) {
      console.error("Missing required parameters for chat.");
      return;
    }

    // Clear messages when roomId changes
    setMessages([]);

    const handleChatMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleChatHistory = (history: ChatMessage[]) => {
      setMessages(() => history);
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
    socket.on(SOCKET_EVENTS.CHAT_HISTORY, handleChatHistory);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
      socket.off(SOCKET_EVENTS.CHAT_HISTORY, handleChatHistory);
    };
  }, [roomId, playerName, socket]);

  const sendMessage = (message: string) => {
    if (message.trim() && socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
        roomId,
        playerName,
        message,
      });
    }
  };

  return { messages, sendMessage };
};
