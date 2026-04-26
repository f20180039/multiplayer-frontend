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
    <div className="ans-mt-6 ans-space-y-5">
      <div className="ans-space-y-2 ans-rounded ans-border ans-border-Blue_gray-100 ans-bg-White ans-p-4">
        <h3 className="ans-text-xl ans-font-semibold">Dice Elimination</h3>
        <p className="ans-text-Blue_gray-600">Round {roomState.round}</p>
        <p className="ans-font-inter-1 ans-text-Blue_gray-800">
          {roomState.lastMessage}
        </p>
        {currentPlayer && roomState.phase === "rolling" && (
          <p className="ans-rounded ans-bg-Blue-50 ans-p-3 ans-font-inter-2 ans-text-Blue-700">
            {isMyTurn
              ? "Your turn. Roll the dice."
              : `${currentPlayer.name}'s turn to roll.`}
          </p>
        )}
      </div>

      <div className="ans-grid ans-gap-3 ans-text-left">
        {roomState.players.map((player) => (
          <div
            key={player.id}
            className={`ans-rounded ans-border ans-p-3 ${
              player.isEliminated
                ? "ans-bg-Red-50 ans-border-Red-200 ans-opacity-70"
                : "ans-bg-White ans-border-Blue_gray-100"
            }`}
          >
            <div className="ans-flex ans-items-center ans-justify-between ans-gap-3">
              <div>
                <strong>{player.name}</strong>
                {!player.isActive && (
                  <span className="ans-ml-2 ans-text-sm ans-text-Blue_gray-400">
                    Offline
                  </span>
                )}
              </div>
              <div className="ans-text-right">
                <div className="ans-text-2 ans-font-inter-3">
                  {player.roll ?? player.lastRoundRoll ?? "-"}
                </div>
                <div className="ans-text-sm ans-text-Blue_gray-500">
                  {player.isEliminated
                    ? "Eliminated"
                    : player.id === roomState.currentTurnPlayerId
                      ? "Turn now"
                      : "In game"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ans-grid ans-gap-4 ans-text-left md:ans-grid-cols-2">
        <div className="ans-rounded ans-border ans-border-Blue_gray-100 ans-bg-White ans-p-4">
          <h4 className="ans-font-inter-2 ans-text-Blue_gray-800">
            Current Round Rolls
          </h4>
          {currentRoundRolls.length > 0 ? (
            <ul className="ans-mt-3 ans-space-y-2">
              {currentRoundRolls.map((record) => (
                <li
                  key={`${record.round}-${record.playerId}-${record.rolledAt}`}
                  className="ans-flex ans-justify-between ans-gap-3 ans-text-Blue_gray-700"
                >
                  <span>{record.playerName}</span>
                  <strong>{record.roll}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ans-mt-3 ans-text-sm ans-text-Blue_gray-500">
              No rolls yet this round.
            </p>
          )}
        </div>

        <div className="ans-rounded ans-border ans-border-Blue_gray-100 ans-bg-White ans-p-4">
          <h4 className="ans-font-inter-2 ans-text-Blue_gray-800">
            Roll History
          </h4>
          {recentRolls.length > 0 ? (
            <ul className="ans-mt-3 ans-space-y-2">
              {recentRolls.map((record) => (
                <li
                  key={`${record.round}-${record.playerId}-${record.rolledAt}`}
                  className="ans-flex ans-justify-between ans-gap-3 ans-text-sm ans-text-Blue_gray-700"
                >
                  <span>
                    Round {record.round}: {record.playerName}
                  </span>
                  <strong>{record.roll}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ans-mt-3 ans-text-sm ans-text-Blue_gray-500">
              Rolls will appear here as players take turns.
            </p>
          )}
        </div>
      </div>

      {winner && (
        <p className="ans-text-lg ans-font-bold ans-text-Success-600">
          Winner: {winner.name}
        </p>
      )}

      <div className="ans-flex ans-flex-wrap ans-gap-3 ans-justify-center">
        {roomState.phase === "rolling" && (
          <button
            onClick={rollDice}
            disabled={!isMyTurn}
            className="ans-bg-Blue-500 ans-text-White ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
          >
            Roll Dice
          </button>
        )}

        {roomState.phase === "round_result" && (
          <button
            onClick={startNextRound}
            className="ans-bg-Success-500 ans-text-White ans-px-4 ans-py-2 ans-rounded"
          >
            Start Next Round
          </button>
        )}

        {isLeader && (
          <button
            onClick={resetGame}
            className="ans-bg-Blue_gray-600 ans-text-White ans-px-4 ans-py-2 ans-rounded"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};
