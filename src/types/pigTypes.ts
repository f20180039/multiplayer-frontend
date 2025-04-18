// src/types/pigTypes.ts
export interface Player {
    id: string;
    name: string;
    frozenScore: number;
    tempScore: number;
  }
  
  export interface PigRoomState {
    players: Player[];
    activePlayerIndex: number;
    diceRoll: number;
    bannedNumber: number;
    winner: string | null;
  }
  