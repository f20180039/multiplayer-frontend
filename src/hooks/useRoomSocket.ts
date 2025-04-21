// ✅ useRoomSocket.ts — Updated to handle clean socket connection
import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "../constants";
import { socket } from "../socket";

export const useRoomSocket = (
  roomId: string,
  gameId: string,
  playerName: string
) => {
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (!roomId || !playerName || !gameId) return;

    // Ensure the socket is properly disconnected before reconnecting
    socket.disconnect();
    socket.connect();
    // Emit join event after ensuring clean socket connection
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, playerName, gameId });

    socket.on(SOCKET_EVENTS.ROOM_JOINED, () => {
      setConnected(true);
      socket.emit(SOCKET_EVENTS.REGISTER_GAME_HANDLER, { gameId });
    });

    socket.on(SOCKET_EVENTS.ROOM_CLOSED, () => {
      console.log("🚪 The room has been closed.");
    });

    socket.on(SOCKET_EVENTS.ROOM_PLAYERS, (players) => {
      setPlayers(players);
    });

    socket.on(SOCKET_EVENTS.USER_JOINED, ({ playerName }) => {
      console.log(`👋 ${playerName} joined the room`);
    });

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED);
      socket.off(SOCKET_EVENTS.ROOM_CLOSED);
      socket.off(SOCKET_EVENTS.ROOM_PLAYERS);
      socket.off(SOCKET_EVENTS.USER_JOINED);
    };
  }, [roomId, playerName, gameId]);

  return { players, connected };
};
