// src/pages/GameList.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GamesArray } from "../constants";

const GameList = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");

  const handleCreateRoom = (id: string) => {
    if (!playerName.trim()) {
      alert("Please enter your name first.");
      return;
    }
    const roomId = uuidv4();
    navigate(`/room/${id}/${roomId}?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="ans-p-8">
      <h1 className="ans-text-2xl ans-font-bold">🎮 Choose a Game</h1>

      <input
        type="text"
        placeholder="Your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="ans-p-2 ans-mb-4 ans-w-full ans-max-w-md ans-text-Blue_gray-800"
      />

      <ul className="ans-list-none">
        {GamesArray.map((game) => (
          <li key={game.id} className="ans-mb-4">
            <strong>{game.name}</strong>
            <button
              onClick={() => handleCreateRoom(game.id)}
              className="ans-bg-Blue-500 ans-text-White ans-p-2 ans-ml-4 ans-rounded"
            >
              Create Room
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate("/join")}
        className="ans-bg-Success-500 ans-text-White ans-p-2 ans-rounded"
      >
        🔗 Join via Link
      </button>
    </div>
  );
};

export default GameList;
