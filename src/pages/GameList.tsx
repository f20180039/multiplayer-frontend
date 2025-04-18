// src/pages/GameList.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const games = [
  { id: "tic-tac-toe", name: "Tic Tac Toe" },
  { id: "pig-game", name: "Pig Game" },
];

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
    <div style={{ padding: "2rem" }}>
      <h1>🎮 Choose a Game</h1>

      <input
        type="text"
        placeholder="Your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        style={{
          padding: "0.5rem",
          marginBottom: "1rem",
          width: "100%",
          maxWidth: "300px",
          display: "block",
        }}
      />

      <ul>
        {games.map((game) => (
          <li key={game.id} style={{ marginBottom: "1rem" }}>
            <strong>{game.name}</strong>
            <button
              onClick={() => handleCreateRoom(game.id)}
              style={{ marginLeft: "1rem" }}
            >
              Create Room
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/join")}>🔗 Join via Link</button>
    </div>
  );
};

export default GameList;
