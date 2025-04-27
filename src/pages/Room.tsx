// src/pages/Room.tsx
import { useParams, useSearchParams } from "react-router-dom";
import { PlayersList } from "../components/PlayersList";
import { PigGameRoom } from "../components/games/pig/PigGameRoom";
import { usePigGameSocket } from "../hooks/usePigGameSocket";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { GameId } from "../constants";
import { useChatSocket } from "../hooks/useChatSocket";
import { useState } from "react";

const Room = () => {
  const { gameId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const playerName =
    searchParams.get("name") || "Player_" + Math.floor(Math.random() * 1000);

  const { players, connected } = useRoomSocket(roomId!, gameId!, playerName);
  const { roomState, rollDice, bankScore, newBanned, isMyTurn } =
    usePigGameSocket(roomId!, playerName);

  const { messages, sendMessage } = useChatSocket(roomId!, playerName);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentPlayer =
    roomState?.players[roomState.activePlayerIndex]?.name || "Unknown";
  const isGameOver = Boolean(roomState?.winner);

  // 📋 Copy invite link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/room/${gameId}/${roomId}?name=YourName`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSend = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };
  if (!connected)
    return <p className="ans-text-Error-500">Connecting to room...</p>;

  return (
    <div className="ans-p-8 ans-text-center">
      <h2 className="ans-text-2 ans-font-inter-3">Game: {gameId}</h2>
      <p className="ans-text-0">Room ID: {roomId}</p>
      <p className="ans-mt-2 ans-text-Success-600">
        Status: {connected ? "Connected ✅" : "Connecting..."}
      </p>

      {/* 📎 Copy Link */}
      <div className="ans-mt-4">
        <button
          onClick={handleCopyLink}
          className="ans-bg-Blue-600 ans-text-White ans-px-4 ans-py-1 ans-rounded hover:ans-bg-Blue-700"
        >
          {copied ? "Link Copied!" : "Copy Invite Link"}
        </button>
      </div>

      {/* Flexbox Layout */}
      <div className="ans-flex ans-justify-between ans-mt-8">
        {/* Left: Player List */}
        <div className="ans-w-1/4 ans-p-4">
          {players && Object.keys(players).length > 0 && (
            <PlayersList players={players} />
          )}
        </div>

        {/* Middle: Game Area */}
        <div className="ans-w-1/2 ans-p-4">
          {gameId === GameId.PIG_GAME && roomState && (
            <PigGameRoom
              roomState={roomState}
              rollDice={rollDice}
              bankScore={bankScore}
              newBanned={newBanned}
              isMyTurn={isMyTurn}
              currentPlayer={currentPlayer}
              isGameOver={isGameOver}
            />
          )}
        </div>

        {/* Right: Chat Section */}
        <div className="ans-w-1/4 ans-p-4">
          <h3 className="ans-text-2 ans-font-inter-2">Chat</h3>
          <div className="ans-border ans-rounded-md ans-p-2 ans-h-48 ans-overflow-y-auto ans-mb-2 ans-bg-White ans-text-left">
            {messages.map((msg, idx) => (
              <div key={idx} className="ans-text-0 ans-text-Blue_gray-800">
                <span className="ans-font-inter-3 ans-text-Blue_gray-800">
                  {msg.playerName}:
                </span>{" "}
                {msg.message}
              </div>
            ))}
          </div>
          <div className="ans-flex ans-gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="ans-border ans-rounded ans-p-1 ans-flex-1 ans-text-Blue_gray-800"
            />
            <button
              onClick={handleSend}
              className="ans-bg-Blue-500 ans-text-White ans-px-4 ans-rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
