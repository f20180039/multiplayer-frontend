// src/components/games/pig/PigGameRoom.tsx
import { PigRoomState } from "../../../types/pigTypes";

interface PigGameRoomProps {
  roomState: PigRoomState;
  rollDice: () => void;
  bankScore: () => void;
  newBanned: () => void;
  isMyTurn: boolean;
  currentPlayer: string;
  isGameOver: boolean;
}

export const PigGameRoom = ({
  roomState,
  rollDice,
  bankScore,
  newBanned,
  isMyTurn,
  currentPlayer,
  isGameOver,
}: PigGameRoomProps) => {
  return (
    <div className="game-panel">
      <div className="section-heading">
        <h2>Pig Game</h2>
        <span className="status-pill">Dice {roomState.diceRoll ?? "-"}</span>
      </div>
      <div className="score-strip">
        <div>
          <p className="label">Banned number</p>
          <strong>{roomState.bannedNumber}</strong>
        </div>
        <div>
          <p className="label">Current turn</p>
          <strong>{currentPlayer}</strong>
        </div>
      </div>

      <ul className="score-list">
        {roomState.players.map((p) => (
          <li key={p.id} className="score-row">
            <strong>{p.name}</strong>
            <span>Frozen {p.frozenScore}</span>
            <span>Temp {p.tempScore}</span>
          </li>
        ))}
      </ul>

      {roomState.winner && (
        <p className="winner-banner">Winner: {roomState.winner}</p>
      )}

      {!isGameOver && (
        <div className="game-actions">
          <button
            type="button"
            onClick={rollDice}
            disabled={!isMyTurn}
            className="action-button primary"
          >
            Roll
          </button>
          <button
            type="button"
            onClick={bankScore}
            disabled={!isMyTurn}
            className="action-button accent"
          >
            Bank
          </button>
          <button
            type="button"
            onClick={newBanned}
            disabled={!isMyTurn}
            className="action-button danger"
          >
            New Banned
          </button>
        </div>
      )}
    </div>
  );
};
