// src/hooks/usePigGameSocket.ts
import { useEffect, useState } from "react";
import { GameId, SOCKET_EVENTS } from "../constants";
import { useSocket } from "../context/socketUtils";
import { PigRoomState } from "../types/pigTypes";

export const usePigGameSocket = (
  roomId: string,
  playerName: string,
  gameId?: string
) => {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<PigRoomState | null>(null);
  const isMyTurn =
    roomState?.players[roomState.activePlayerIndex]?.id === socket?.id;

  useEffect(() => {
    if (gameId !== GameId.PIG_GAME || !roomId || !playerName || !socket) return;

    socket.on(SOCKET_EVENTS.PIG.UPDATE, (room: PigRoomState) => {
      console.log("Room State Updated:", room);
      setRoomState(room);
    });

    socket.on(SOCKET_EVENTS.PIG.ROOM_CLOSED, () => {
      alert("Room closed. All players left.");
      setRoomState(null);
    });

    return () => {
      socket.off(SOCKET_EVENTS.PIG.UPDATE);
      socket.off(SOCKET_EVENTS.PIG.ROOM_CLOSED);
    };
  }, [roomId, playerName, gameId, socket]);

  const rollDice = () => socket?.emit(SOCKET_EVENTS.PIG.ROLL_DICE, { roomId });
  const bankScore = () =>
    socket?.emit(SOCKET_EVENTS.PIG.BANK_SCORE, { roomId });
  const newBanned = () =>
    socket?.emit(SOCKET_EVENTS.PIG.NEW_BANNED, { roomId });

  return {
    isMyTurn,
    roomState,
    rollDice,
    bankScore,
    newBanned,
  };
};
