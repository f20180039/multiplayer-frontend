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

  const { roomState, connected, rollDice, bankScore, newBanned } =
    usePigGameSocket(roomId!, playerName);

  return (
    <div className="ans-p-8 ans-text-center">
      <h2 className="ans-text-2xl ans-font-bold">Game: {gameId}</h2>
      <p className="ans-text-sm">Room ID: {roomId}</p>
      <p className="ans-mt-2 ans-text-green-600">
        Status: {connected ? "Connected ✅" : "Connecting..."}{roomState}
      </p>

      {gameId === GameId.PIG_GAME && roomState && (
        <div className="ans-mt-6 ans-space-y-4">
          <h3 className="ans-text-xl ans-font-semibold">
            🎲 Dice: {roomState.diceRoll}
          </h3>
          <p>Banned Number: {roomState.bannedNumber}</p>
          <p>
            Current Turn: {roomState.players[roomState.activePlayerIndex]?.name}
          </p>

          <ul className="ans-list-disc ans-list-inside ans-text-left ans-max-w-md ans-mx-auto">
            {roomState.players.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> - Frozen: {p.frozenScore}, Temp:{" "}
                {p.tempScore}
              </li>
            ))}
          </ul>

          {roomState.winner && (
            <p className="ans-text-lg ans-font-bold ans-text-purple-600">
              {roomState.winner}
            </p>
          )}

          <div className="ans-flex ans-gap-4 ans-justify-center ans-mt-4">
            <button
              onClick={rollDice}
              className="ans-bg-blue-500 ans-text-white ans-px-4 ans-py-2 ans-rounded"
            >
              Roll
            </button>
            <button
              onClick={bankScore}
              className="ans-bg-green-500 ans-text-white ans-px-4 ans-py-2 ans-rounded"
            >
              Bank
            </button>
            <button
              onClick={newBanned}
              className="ans-bg-red-500 ans-text-white ans-px-4 ans-py-2 ans-rounded"
            >
              New Banned
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
