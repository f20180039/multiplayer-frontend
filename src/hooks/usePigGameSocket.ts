// src/hooks/usePigGameSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants";
import { PigRoomState } from "../types/pigTypes";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const usePigGameSocket = (roomId: string, playerName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<PigRoomState | null>(null);
  const [connected, setConnected] = useState(false);

  const isMyTurn =
    roomState?.players[roomState.activePlayerIndex]?.id === socket?.id;

  useEffect(() => {
    const s = io(URL);
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      // Emit JOIN_ROOM only after socket connects
      if (roomId && playerName) {
        s.emit(SOCKET_EVENTS.JOIN_ROOM, {
          gameId: "pig-game",
          roomId,
          playerName,
        });
      }
    });

    s.on(SOCKET_EVENTS.PIG.UPDATE, (room: PigRoomState) => {
      console.log("Room State Updated:", room);
      setRoomState(room);
    });

    s.on(SOCKET_EVENTS.PIG.ROOM_CLOSED, () => {
      alert("Room closed. All players left.");
      setRoomState(null);
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, [roomId, playerName]);

  const rollDice = () => socket?.emit(SOCKET_EVENTS.PIG.ROLL_DICE, { roomId });
  const bankScore = () =>
    socket?.emit(SOCKET_EVENTS.PIG.BANK_SCORE, { roomId });
  const newBanned = () =>
    socket?.emit(SOCKET_EVENTS.PIG.NEW_BANNED, { roomId });

  return {
    isMyTurn,
    socket,
    roomState,
    connected,
    rollDice,
    bankScore,
    newBanned,
  };
};
