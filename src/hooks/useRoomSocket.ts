import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "../constants";
import { useSocket } from "../context/SocketContext";

interface PlayerStatus {
  id: string;
  name: string;
  lastSeen: number;
  isOnline: boolean;
}

export const useRoomSocket = (
  roomId: string,
  gameId: string,
  playerName: string
) => {
  const socket = useSocket();
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId || !playerName || !gameId || !socket) {
      console.error("Missing required parameters to join the room.");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, playerName, gameId });

    const onRoomJoined = () => {
      setConnected(true);
      socket.emit(SOCKET_EVENTS.REGISTER_GAME_HANDLER, { gameId });
    };

    const onRoomPlayers = (players: Record<string, string>) => {
      setPlayers(players);
    };

    const onPlayerStatusUpdate = (statuses: PlayerStatus[]) => {
      setPlayerStatuses(statuses);
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_PLAYERS, onRoomPlayers);
    socket.on(SOCKET_EVENTS.PLAYER_STATUS_UPDATE, onPlayerStatusUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_PLAYERS, onRoomPlayers);
      socket.off(SOCKET_EVENTS.PLAYER_STATUS_UPDATE, onPlayerStatusUpdate);

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [roomId, playerName, gameId, socket]);

  // Prefer playerStatuses if available, else fallback to players
  const playersForList =
    playerStatuses.length > 0
      ? playerStatuses
      : Object.entries(players).map(([id, name]) => ({
          id,
          name,
          isOnline: true,
          lastSeen: Date.now(),
        }));

  return { players: playersForList, connected };
};