import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

const Room = () => {
  const { gameId, roomId } = useParams();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket = io("http://localhost:4000"); // Change to your backend URL if needed

    socket.emit("join_room", { gameId, roomId });

    socket.on("room_joined", () => {
      setConnected(true);
    });

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
