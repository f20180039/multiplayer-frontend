import { GameId } from "../constants";

export type PanicPotatoPhase =
  | "LOBBY"
  | "COUNTDOWN"
  | "ROUND_ACTIVE"
  | "ROUND_END"
  | "MATCH_END";

export type PanicPotatoPowerUpType =
  | "DASH_PEPPER"
  | "GLUE_HANDS"
  | "SWAP_SAUCE";

export interface Vector2 {
  x: number;
  y: number;
}

export interface PanicPotatoObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PanicPotatoArena {
  name: string;
  width: number;
  height: number;
  obstacles: PanicPotatoObstacle[];
  spawnPoints: Vector2[];
  powerUpSpawnPoints: Vector2[];
}

export interface PanicPotatoPowerUp {
  id: string;
  type: PanicPotatoPowerUpType;
  x: number;
  y: number;
  active: boolean;
  respawnAt: number | null;
}

export interface PanicPotatoPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  lives: number;
  isConnected: boolean;
  isSpectator: boolean;
  isEliminated: boolean;
  powerUp: PanicPotatoPowerUpType | null;
  receiveCooldownUntil: number;
  glueLockedUntil: number;
  dashCooldownUntil: number;
  facing: Vector2;
}

export interface PanicPotatoExplosion {
  id: string;
  playerId: string;
  playerName: string;
  at: number;
}

export interface PanicPotatoRoomState {
  gameId: GameId.PANIC_POTATO;
  roomId: string;
  phase: PanicPotatoPhase;
  round: number;
  players: PanicPotatoPlayer[];
  potatoHolderId: string | null;
  winnerId: string | null;
  countdownEndsAt: number | null;
  lastExplosion: PanicPotatoExplosion | null;
  lastEvent: string;
  arena: PanicPotatoArena;
  powerUps: PanicPotatoPowerUp[];
  serverTime: number;
}

export interface PanicPotatoInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
