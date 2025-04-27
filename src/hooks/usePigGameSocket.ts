// src/hooks/usePigGameSocket.ts
import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "../constants";
import { useSocket } from "../context/SocketContext";
import { PigRoomState } from "../types/pigTypes";

export const usePigGameSocket = (roomId: string, playerName: string) => {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<PigRoomState | null>(null);
  const [connected, setConnected] = useState(false);

  const isMyTurn =
    roomState?.players[roomState.activePlayerIndex]?.id === socket?.id;

  useEffect(() => {
    if (!roomId || !playerName || !socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      gameId: "pig-game",
      roomId,
      playerName,
    });

    socket.on(SOCKET_EVENTS.PIG.UPDATE, (room: PigRoomState) => {
      console.log("Room State Updated:", room);
      setRoomState(room);
    });

    socket.on(SOCKET_EVENTS.PIG.ROOM_CLOSED, () => {
      alert("Room closed. All players left.");
      setRoomState(null);
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.off(SOCKET_EVENTS.PIG.UPDATE);
      socket.off(SOCKET_EVENTS.PIG.ROOM_CLOSED);
      socket.disconnect();
    };
  }, [roomId, playerName, socket]);

  const rollDice = () => socket?.emit(SOCKET_EVENTS.PIG.ROLL_DICE, { roomId });
  const bankScore = () =>
    socket?.emit(SOCKET_EVENTS.PIG.BANK_SCORE, { roomId });
  const newBanned = () =>
    socket?.emit(SOCKET_EVENTS.PIG.NEW_BANNED, { roomId });

  return {
    isMyTurn,
    roomState,
    connected,
    rollDice,
    bankScore,
    newBanned,
  };
};
