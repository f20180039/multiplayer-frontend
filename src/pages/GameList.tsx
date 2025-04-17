import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const games = [
  { id: "tic-tac-toe", name: "Tic Tac Toe" },
  { id: "pig-game", name: "Pig Game" },
];

const GameList = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");

  const handleCreateRoom = (id: string) => {
    const roomId = uuidv4();
    navigate(`/room/${id}/${roomId}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎮 Choose a Game</h1>
      <ul>
        {games.map((game) => (
          <li key={game.id} style={{ marginBottom: "1rem" }}>
            <strong>{game.name}</strong>
            <button onClick={() => handleCreateRoom(game.id)} style={{ marginLeft: "1rem" }}>
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
