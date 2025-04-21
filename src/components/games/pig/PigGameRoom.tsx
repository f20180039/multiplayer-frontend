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
    <div className="ans-mt-6 ans-space-y-4">
      <h3 className="ans-text-xl ans-font-semibold">
        🎲 Dice: {roomState.diceRoll ?? "-"}
      </h3>
      <p>Banned Number: {roomState.bannedNumber}</p>
      <p>
        Current Turn:{" "}
        <span className="ans-font-medium ans-text-Blue-600">
          {currentPlayer}
        </span>
      </p>

      <ul className="ans-list-disc ans-list-inside ans-text-left ans-max-w-md ans-mx-auto">
        {roomState.players.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> — Frozen: {p.frozenScore}, Temp:{" "}
            {p.tempScore}
          </li>
        ))}
      </ul>

      {roomState.winner && (
        <p className="ans-text-lg ans-font-bold ans-text-Purple-600">
          🎉 Winner: {roomState.winner}
        </p>
      )}

      {!isGameOver && (
        <div className="ans-flex ans-gap-4 ans-justify-center ans-mt-4">
          <button
            onClick={rollDice}
            disabled={!isMyTurn}
            className="ans-bg-Blue-500 ans-text-White ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
          >
            Roll
          </button>
          <button
            onClick={bankScore}
            disabled={!isMyTurn}
            className="ans-bg-Success-500 ans-text-White ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
          >
            Bank
          </button>
          <button
            onClick={newBanned}
            disabled={!isMyTurn}
            className="ans-bg-Error-500 ans-text-White ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
          >
            New Banned
          </button>
        </div>
      )}
    </div>
  );
};
