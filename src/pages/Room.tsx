// src/pages/Room.tsx
import { useParams } from "react-router-dom";
import { usePigGameSocket } from "../hooks/usePigGameSocket";
import { useMemo } from "react";
import { GameId } from "../constants";

const Room = () => {
  const { gameId, roomId } = useParams();
  const playerName = useMemo(
    () => "Player_" + Math.floor(Math.random() * 1000),
    []
  );
  const { roomState, connected, rollDice, bankScore, newBanned, isMyTurn } =
    usePigGameSocket(roomId!, playerName);

  const currentPlayer =
    roomState?.players[roomState.activePlayerIndex]?.name || "Unknown";
    
  const isGameOver = Boolean(roomState?.winner);

  return (
    <div className="ans-p-8 ans-text-center">
      <h2 className="ans-text-2xl ans-font-bold">Game: {gameId}</h2>
      <p className="ans-text-sm">Room ID: {roomId}</p>
      <p className="ans-mt-2 ans-text-green-600">
        Status: {connected ? "Connected ✅" : "Connecting..."}
      </p>

      {gameId === GameId.PIG_GAME && roomState && (
        <div className="ans-mt-6 ans-space-y-4">
          <h3 className="ans-text-xl ans-font-semibold">
            🎲 Dice: {roomState.diceRoll ?? "-"}
          </h3>
          <p>Banned Number: {roomState.bannedNumber}</p>
          <p>
            Current Turn:{" "}
            <span className="ans-font-medium ans-text-blue-600">
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
            <p className="ans-text-lg ans-font-bold ans-text-purple-600">
              🎉 Winner: {roomState.winner}
            </p>
          )}

          {!isGameOver && (
            <div className="ans-flex ans-gap-4 ans-justify-center ans-mt-4">
              <button
                onClick={rollDice}
                disabled={!isMyTurn}
                className="ans-bg-blue-500 ans-text-white ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
              >
                Roll
              </button>
              <button
                onClick={bankScore}
                disabled={!isMyTurn}
                className="ans-bg-green-500 ans-text-white ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
              >
                Bank
              </button>
              <button
                onClick={newBanned}
                disabled={!isMyTurn}
                className="ans-bg-red-500 ans-text-white ans-px-4 ans-py-2 ans-rounded disabled:ans-opacity-50 disabled:ans-cursor-not-allowed"
              >
                New Banned
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Room;
