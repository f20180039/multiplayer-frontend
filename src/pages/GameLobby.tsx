import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GameId, GamesArray } from "../constants";

const PLAYER_NAME_KEY = "playerName";

const GameLobby = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [roomLink, setRoomLink] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // Save player name to localStorage when it changes
  useEffect(() => {
    if (playerName.trim()) {
      localStorage.setItem(PLAYER_NAME_KEY, playerName.trim());
    }
  }, [playerName]);

  const handleCreateRoom = (gameId: string) => {
    if (!playerName.trim()) {
      alert("Please enter your name first.");
      return;
    }
    const roomId = uuidv4();
    navigate(
      `/room/${gameId}/${roomId}?name=${encodeURIComponent(playerName)}`
    );
  };

  const handleJoinRoom = () => {
    try {
      let gameId = "";
      let roomId = "";

      if (roomLink.includes("http")) {
        const url = new URL(roomLink);
        const parts = url.pathname.split("/").filter(Boolean);
        const roomIndex = parts.indexOf("room");
        gameId = parts[roomIndex + 1];
        roomId = parts[roomIndex + 2];
      } else {
        gameId = GameId.PIG_GAME; // fallback
        roomId = roomLink.trim();
      }

      if (!gameId || !roomId) {
        alert("Invalid room link. Format should be /room/:gameId/:roomId");
        return;
      }

      if (!playerName.trim()) {
        alert("Please enter your name before joining.");
        return;
      }

      navigate(
        `/room/${gameId}/${roomId}?name=${encodeURIComponent(playerName)}`
      );
    } catch (error) {
      alert("Invalid input. Please enter a valid URL or room ID. " + error);
    }
  };

  return (
    <div className="ans-p-8 ans-max-w-xl ans-mx-auto ans-space-y-8 ans-text-Blue_gray-800 ans-font-mario">
      <h1 className="ans-text-3 ans-font-inter-3 text-center ans-text-Blue_gray-200">
        🎮 Game Lobby
      </h1>

      <div className="ans-flex ans-flex-col ans-gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="ans-p-3 ans-rounded-lg ans-border ans-border-Blue_gray-200 ans-w-full ans-text-Blue_gray-800 ans-shadow-sm"
        />
      </div>

      {/* Join Room Section */}
      <div className="ans-bg-Blue_gray-50 ans-rounded-2xl ans-p-6 ans-shadow-sm ans-space-y-4">
        <h2 className="ans-text-3 ans-font-inter-2">🔗 Join a Room</h2>
        <input
          type="text"
          placeholder="Paste room link or ID"
          value={roomLink}
          onChange={(e) => setRoomLink(e.target.value)}
          className="ans-p-3 ans-rounded-lg ans-border ans-border-Blue_gray-200 ans-w-full ans-shadow-sm"
        />
        <button
          onClick={handleJoinRoom}
          className="ans-bg-Success-500 hover:ans-bg-Success-600 ans-transition-colors ans-text-White ans-px-4 ans-py-2 ans-rounded-lg ans-font-inter-1"
        >
          Join Room
        </button>
      </div>

      {/* Create Room Section */}
      <div className="ans-bg-Blue_gray-50 ans-rounded-2xl ans-p-6 ans-shadow-sm ans-space-y-4">
        <h2 className="ans-text-4 ans-font-semibold">📋 Create a New Room</h2>
        <ul className="ans-space-y-3">
          {GamesArray.map((game) => (
            <li
              key={game.id}
              className="ans-flex ans-items-center ans-justify-between ans-bg-White ans-p-3 ans-rounded-xl ans-shadow"
            >
              <span className="ans-font-inter-1">{game.name}</span>
              <button
                onClick={() => handleCreateRoom(game.id)}
                className="ans-bg-Blue-500 hover:ans-bg-Blue-600 ans-transition-colors ans-text-White ans-px-4 ans-py-2 ans-rounded-lg"
              >
                Create Room
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameLobby;
