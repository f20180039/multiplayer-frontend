import { useCallback, useEffect, useMemo, useState } from "react";
import { GameId, LocalStorageKey, SOCKET_EVENTS } from "../constants";
import { useSocket } from "../context/socketUtils";
import {
  PanicPotatoInput,
  PanicPotatoRoomState,
} from "../types/panicPotatoTypes";

export const usePanicPotatoSocket = (
  roomId: string,
  playerName: string,
  gameId?: string
) => {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<PanicPotatoRoomState | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);

  const enabled = gameId === GameId.PANIC_POTATO;
  const myPlayerId = useMemo(
    () => localStorage.getItem(LocalStorageKey.PLAYER_ID),
    []
  );

  useEffect(() => {
    if (!enabled || !roomId || !playerName || !socket) return;

    const onUpdate = (updatedRoom: PanicPotatoRoomState) => {
      setRoomState(updatedRoom);
      setRoomError(null);
    };

    const onError = ({ message }: { message: string }) => {
      setRoomError(message);
    };

    socket.on(SOCKET_EVENTS.PANIC_POTATO.UPDATE, onUpdate);
    socket.on(SOCKET_EVENTS.PANIC_POTATO.ERROR, onError);

    return () => {
      socket.off(SOCKET_EVENTS.PANIC_POTATO.UPDATE, onUpdate);
      socket.off(SOCKET_EVENTS.PANIC_POTATO.ERROR, onError);
    };
  }, [enabled, roomId, playerName, socket]);

  const sendInput = useCallback(
    (input: PanicPotatoInput, dash = false) => {
      socket?.emit(SOCKET_EVENTS.PANIC_POTATO.INPUT, {
        roomId,
        input,
        dash,
      });
    },
    [roomId, socket]
  );

  const passPotato = useCallback(
    (targetId?: string) => {
      socket?.emit(SOCKET_EVENTS.PANIC_POTATO.PASS_POTATO, {
        roomId,
        targetId,
      });
    },
    [roomId, socket]
  );

  const activatePowerUp = useCallback(() => {
    socket?.emit(SOCKET_EVENTS.PANIC_POTATO.USE_POWER_UP, { roomId });
  }, [roomId, socket]);

  const rematch = useCallback(() => {
    socket?.emit(SOCKET_EVENTS.PANIC_POTATO.REMATCH, { roomId });
  }, [roomId, socket]);

  return {
    myPlayerId,
    roomError,
    roomState,
    passPotato,
    rematch,
    sendInput,
    activatePowerUp,
  };
};
