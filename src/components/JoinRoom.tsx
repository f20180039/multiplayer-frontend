import { useNavigate } from "react-router-dom";
import { useState } from "react";

const JoinRoom = () => {
  const [roomLink, setRoomLink] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    try {
      const url = new URL(roomLink);
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length === 3 && pathParts[0] === "room") {
        navigate(`/room/${pathParts[1]}/${pathParts[2]}`);
      } else {
        alert("Invalid room link");
      }
    } catch {
      alert("Invalid URL");
    }
  };

  return (
    <div className="ans-mt-4">
      <h2>Join Room via Link</h2>
      <input
        type="text"
        placeholder="Paste room link here"
        value={roomLink}
        onChange={(e) => setRoomLink(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button
        onClick={handleJoin}
        className="bg-blue-500 text-white px-4 py-1 rounded"
      >
        Join Room
      </button>
    </div>
  );
};

export default JoinRoom;
