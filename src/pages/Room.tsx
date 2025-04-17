import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Room = () => {
  const { gameId, roomId } = useParams();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection within the component
    const socket = io(URL);

    // Join the room as soon as the socket is connected
    socket.emit("join_room", { gameId, roomId });

    // Listen for the "room_joined" event
    socket.on("room_joined", ({ roomId }) => {
      console.log(`Joined room: ${roomId}`);
      setConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
      setConnected(false);
    });

    // Clean up the socket connection when the component unmounts or dependencies change
    return () => {
      socket.disconnect();
    };
  }, [gameId, roomId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Game: {gameId}</h2>
      <p>Room ID: {roomId}</p>
      <p>Status: {connected ? "Connected ✅" : "Connecting..."}</p>

      {/* Placeholder: Replace with game-specific UI */}
      <div style={{ marginTop: "2rem" }}>
        {gameId === "tic-tac-toe" && <p>[Tic Tac Toe UI Here]</p>}
        {gameId === "pig-game" && <p>[Pig Game UI Here]</p>}
      </div>
    </div>
  );
};

export default Room;
