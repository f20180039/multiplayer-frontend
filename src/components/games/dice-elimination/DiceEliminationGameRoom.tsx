import { DiceEliminationRoomState } from "../../../types/diceEliminationTypes";

interface DiceEliminationGameRoomProps {
  roomState: DiceEliminationRoomState;
  isMyTurn: boolean;
  isLeader: boolean;
  rollDice: () => void;
  startNextRound: () => void;
  resetGame: () => void;
}

export const DiceEliminationGameRoom = ({
  roomState,
  isMyTurn,
  isLeader,
  rollDice,
  startNextRound,
  resetGame,
}: DiceEliminationGameRoomProps) => {
  const winner = roomState.players.find(
    (player) => player.id === roomState.winnerId
  );
  const currentPlayer = roomState.players.find(
    (player) => player.id === roomState.currentTurnPlayerId
  );
  const currentRoundRolls = roomState.rollHistory.filter(
    (record) => record.round === roomState.round
  );
  const recentRolls = [...roomState.rollHistory].reverse().slice(0, 8);

  return (
    <div className="game-panel">
      <div className="section-heading">
        <h2>Dice Elimination</h2>
        <span className="status-pill">Round {roomState.round}</span>
      </div>

      <div className="game-callout">
        <p>{roomState.lastMessage}</p>
        {currentPlayer && roomState.phase === "rolling" && (
          <p className="turn-note">
            {isMyTurn
              ? "Your turn. Roll the dice."
              : `${currentPlayer.name}'s turn to roll.`}
          </p>
        )}
      </div>

      <div className="elimination-list">
        {roomState.players.map((player) => (
          <div
            key={player.id}
            className="elimination-row"
            data-eliminated={player.isEliminated}
          >
            <div>
              <strong>{player.name}</strong>
              {!player.isActive && <span className="muted">Offline</span>}
            </div>
            <div className="roll-cell">
              <strong>{player.roll ?? player.lastRoundRoll ?? "-"}</strong>
              <span>
                {player.isEliminated
                  ? "Eliminated"
                  : player.id === roomState.currentTurnPlayerId
                    ? "Turn now"
                    : "In game"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="history-grid">
        <div className="history-panel">
          <h3>Current Round Rolls</h3>
          {currentRoundRolls.length > 0 ? (
            <ul>
              {currentRoundRolls.map((record) => (
                <li key={`${record.round}-${record.playerId}-${record.rolledAt}`}>
                  <span>{record.playerName}</span>
                  <strong>{record.roll}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No rolls yet this round.</p>
          )}
        </div>

        <div className="history-panel">
          <h3>Roll History</h3>
          {recentRolls.length > 0 ? (
            <ul>
              {recentRolls.map((record) => (
                <li key={`${record.round}-${record.playerId}-${record.rolledAt}`}>
                  <span>
                    Round {record.round}: {record.playerName}
                  </span>
                  <strong>{record.roll}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Rolls will appear here.</p>
          )}
        </div>
      </div>

      {winner && <p className="winner-banner">Winner: {winner.name}</p>}

      <div className="game-actions">
        {roomState.phase === "rolling" && (
          <button
            type="button"
            onClick={rollDice}
            disabled={!isMyTurn}
            className="action-button primary"
          >
            Roll Dice
          </button>
        )}

        {roomState.phase === "round_result" && (
          <button
            type="button"
            onClick={startNextRound}
            className="action-button accent"
          >
            Start Next Round
          </button>
        )}

        {isLeader && (
          <button
            type="button"
            onClick={resetGame}
            className="action-button secondary"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};
