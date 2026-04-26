// src/types/pigTypes.ts
export interface Player {
  id: string;
  name: string;
  frozenScore: number;
  tempScore: number;
  isActive: boolean;
}

export interface PigRoomState {
  players: Player[];
  activePlayerIndex: number;
  diceRoll: number;
  bannedNumber: number;
  winner: string | null;
  gameStarted: boolean;
  leaderId: string;
}
export interface RoomPlayer {
  id: string;
  name: string;
  // Game-specific fields (optional)
  frozenScore?: number;
  tempScore?: number;
  // You can add other common fields here if needed
}
