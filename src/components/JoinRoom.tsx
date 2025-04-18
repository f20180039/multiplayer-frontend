// src/pages/JoinRoom.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const JoinRoom = () => {
  const [roomLink, setRoomLink] = useState("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
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
        // Assume raw room ID provided
        gameId = "pig-game"; // or allow user to select the game
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
      navigate(`/room/${gameId}/${roomId}?name=${encodeURIComponent(playerName)}`);
    } catch (error) {
      alert("Invalid input. Please enter a valid URL or room ID. " + error);
    }
  };

  return (
    <div className="ans-mt-4 ans-p-4 ans-max-w-md ans-mx-auto">
      <h2 className="ans-text-xl ans-font-bold ans-mb-2">Join Room via Link</h2>
      <input
        type="text"
        placeholder="Paste room link here"
        value={roomLink}
        onChange={(e) => setRoomLink(e.target.value)}
        className="ans-border ans-px-2 ans-py-1 ans-mb-2 ans-w-full"
      />
      <input
        type="text"
        placeholder="Your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="ans-border ans-px-2 ans-py-1 ans-mb-4 ans-w-full"
      />
      <button
        onClick={handleJoin}
        className="ans-bg-Blue-500 ans-text-White ans-px-4 ans-py-2 ans-rounded ans-w-full"
      >
        Join Room
      </button>
    </div>
  );
};

export default JoinRoom;
