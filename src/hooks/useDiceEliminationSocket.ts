import { useEffect, useMemo, useState } from "react";
import { GameId, SOCKET_EVENTS } from "../constants";
import { useSocket } from "../context/SocketContext";
import { DiceEliminationRoomState } from "../types/diceEliminationTypes";

export const useDiceEliminationSocket = (
  roomId: string,
  playerName: string,
  gameId?: string
) => {
  const socket = useSocket();
  const [roomState, setRoomState] =
    useState<DiceEliminationRoomState | null>(null);

  const enabled = gameId === GameId.DICE_ELIMINATION;
  const myPlayerId = useMemo(() => localStorage.getItem("playerId"), []);

  const isMyTurn = useMemo(
    () =>
      Boolean(myPlayerId && roomState?.currentTurnPlayerId === myPlayerId),
    [myPlayerId, roomState?.currentTurnPlayerId]
  );

  const isLeader = Boolean(myPlayerId && roomState?.leaderId === myPlayerId);

  useEffect(() => {
    if (!enabled || !roomId || !playerName || !socket) return;

    const joinGame = () => {
      socket.emit(SOCKET_EVENTS.DICE_ELIMINATION.JOIN_GAME, {
        roomId,
        playerName,
      });
    };

    joinGame();

    socket.on(
      SOCKET_EVENTS.DICE_ELIMINATION.UPDATE,
      (updatedRoom: DiceEliminationRoomState) => {
        setRoomState(updatedRoom);
      }
    );

    socket.on("connect", joinGame);

    return () => {
      socket.off(SOCKET_EVENTS.DICE_ELIMINATION.UPDATE);
      socket.off("connect", joinGame);
    };
  }, [enabled, roomId, playerName, socket]);

  const rollDice = () => {
    socket?.emit(SOCKET_EVENTS.DICE_ELIMINATION.ROLL_DICE, { roomId });
  };

  const startNextRound = () => {
    socket?.emit(SOCKET_EVENTS.GAME_START, { roomId });
  };

  const resetGame = () => {
    socket?.emit(SOCKET_EVENTS.DICE_ELIMINATION.RESET_GAME, { roomId });
  };

  return {
    roomState,
    isMyTurn,
    isLeader,
    rollDice,
    startNextRound,
    resetGame,
  };
};
