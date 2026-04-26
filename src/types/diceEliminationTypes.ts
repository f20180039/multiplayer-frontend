export interface DiceEliminationPlayer {
  id: string;
  name: string;
  isActive: boolean;
  isEliminated: boolean;
  roll: number | null;
  lastRoundRoll: number | null;
}

export interface DiceRollRecord {
  round: number;
  playerId: string;
  playerName: string;
  roll: number;
  rolledAt: string;
}

export interface DiceEliminationRoomState {
  players: DiceEliminationPlayer[];
  currentTurnPlayerId: string | null;
  round: number;
  phase: "waiting" | "rolling" | "round_result" | "finished";
  eliminatedPlayerIds: string[];
  winnerId: string | null;
  lastMessage: string;
  leaderId: string;
  rollHistory: DiceRollRecord[];
}
