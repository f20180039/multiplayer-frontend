import { useEffect, useRef, useState } from "react";
import { SOCKET_EVENTS } from "../constants";
import { useSocket, getAuthPayload } from "../context/socketUtils";

interface PlayerStatus {
  id: string;
  name: string;
  lastSeen: number;
  isOnline: boolean;
}

export const useRoomSocket = (
  roomId: string,
  gameId: string,
  playerName: string,
  playerId: string
) => {
  const socket = useSocket();
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!roomId || !playerName || !gameId || !playerId || !socket) {
      console.error("Missing required parameters to join the room.");
      return;
    }

    const joinRoom = () => {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, playerName, playerId, gameId });
    };

    const connectAndJoin = async () => {
      if (!socket.connected) {
        socket.auth = await getAuthPayload();
        socket.connect();
      }
      joinRoom();
    };

    connectAndJoin();

    const onRoomJoined = () => {
      setConnected(true);
      setReconnecting(false);
      hasJoinedRef.current = true;
      socket.emit(SOCKET_EVENTS.REGISTER_GAME_HANDLER, { gameId });
    };

    const onRoomPlayers = (players: Record<string, string>) => {
      setPlayers(players);
    };

    const onPlayerStatusUpdate = (statuses: PlayerStatus[]) => {
      setPlayerStatuses(statuses);
    };

    // Re-join room on reconnect
    const onReconnect = () => {
      console.log("Socket reconnected, re-joining room...");
      joinRoom();
    };

    const onDisconnect = () => {
      setConnected(false);
      if (hasJoinedRef.current) {
        setReconnecting(true);
      }
    };

    const onReconnectFailed = () => {
      setReconnecting(false);
      console.error("Failed to reconnect after maximum attempts");
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_PLAYERS, onRoomPlayers);
    socket.on(SOCKET_EVENTS.PLAYER_STATUS_UPDATE, onPlayerStatusUpdate);
    socket.on("connect", onReconnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_failed", onReconnectFailed);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_PLAYERS, onRoomPlayers);
      socket.off(SOCKET_EVENTS.PLAYER_STATUS_UPDATE, onPlayerStatusUpdate);
      socket.off("connect", onReconnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_failed", onReconnectFailed);

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [roomId, playerName, playerId, gameId, socket]);

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

  return { players: playersForList, connected, reconnecting };
};