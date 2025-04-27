import { SOCKET_EVENTS } from "../constants";

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ROOM]: (data: { gameId: string; roomId: string }) => void;
  [SOCKET_EVENTS.PIG.JOIN_ROOM]: (data: {
    roomId: string;
    playerName: string;
  }) => void;
  [SOCKET_EVENTS.PIG.ROLL_DICE]: (data: { roomId: string }) => void;
  [SOCKET_EVENTS.PIG.BANK_SCORE]: (data: { roomId: string }) => void;
  [SOCKET_EVENTS.PIG.NEW_BANNED]: (data: { roomId: string }) => void;
  // Other game events can be added here
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.USER_JOINED]: (userId: string) => void;
  [SOCKET_EVENTS.ROOM_JOINED]: (data: { roomId: string }) => void;
  // [SOCKET_EVENTS.PIG.UPDATE]: (state: any) => void;
}

// Room state interface should be aligned with the backend RoomState
export interface Player {
  id: string;
  name: string;
  frozenScore: number;
  tempScore: number;
}

export interface RoomState {
  players: Player[];
  activePlayerIndex: number;
  diceRoll: number;
  bannedNumber: number;
  winner: string | null;
}
