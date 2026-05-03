// src/pages/Room.tsx
import { useMemo, useState } from "react";
import { FiCheckCircle, FiCopy, FiHash, FiSend, FiWifi } from "react-icons/fi";
import { useParams, useSearchParams } from "react-router-dom";
import { PlayersList } from "../components/PlayersList";
import { ThemeToggle } from "../components/ThemeToggle";
import { DiceEliminationGameRoom } from "../components/games/dice-elimination/DiceEliminationGameRoom";
import { PanicPotatoGameRoom } from "../components/games/panic-potato/PanicPotatoGameRoom";
import { PigGameRoom } from "../components/games/pig/PigGameRoom";
import {
  APP_ROUTES,
  GameId,
  LocalStorageKey,
  PLAYER_DEFAULTS,
} from "../constants";
import { useChatSocket } from "../hooks/useChatSocket";
import { useDiceEliminationSocket } from "../hooks/useDiceEliminationSocket";
import { usePanicPotatoSocket } from "../hooks/usePanicPotatoSocket";
import { usePigGameSocket } from "../hooks/usePigGameSocket";
import { useRoomSocket } from "../hooks/useRoomSocket";

const Room = () => {
  const { gameId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const playerName =
    searchParams.get("name") ||
    `${PLAYER_DEFAULTS.GENERATED_NAME_PREFIX}${Math.floor(Math.random() * 1000)}`;

  const playerId = useMemo(() => {
    let id = localStorage.getItem(LocalStorageKey.PLAYER_ID);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(LocalStorageKey.PLAYER_ID, id);
    }
    return id;
  }, []);

  const { players, connected, roomError: roomSocketError } = useRoomSocket(
    roomId!,
    gameId!,
    playerName,
    playerId
  );
  const { roomState, rollDice, bankScore, newBanned, isMyTurn } =
    usePigGameSocket(roomId!, playerName, gameId);
  const {
    roomState: diceEliminationRoomState,
    rollDice: rollEliminationDice,
    startNextRound,
    resetGame,
    isMyTurn: isDiceEliminationTurn,
    isLeader: isDiceEliminationLeader,
  } = useDiceEliminationSocket(roomId!, playerName, gameId);
  const {
    myPlayerId,
    roomError: panicRoomError,
    roomState: panicPotatoRoomState,
    passPotato,
    rematch,
    sendInput,
    activatePowerUp,
  } = usePanicPotatoSocket(roomId!, playerName, gameId);

  const { messages, sendMessage } = useChatSocket(roomId!, playerName);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);

  const currentPlayer =
    roomState?.players[roomState.activePlayerIndex]?.name ||
    PLAYER_DEFAULTS.NAME;
  const isGameOver = Boolean(roomState?.winner);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${APP_ROUTES.roomWithName(
      gameId!,
      roomId!,
      PLAYER_DEFAULTS.ROOM_NAME_PLACEHOLDER
    )}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId!).then(() => {
      setCopiedRoomId(true);
      setTimeout(() => setCopiedRoomId(false), 2000);
    });
  };

  const handleSend = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };

  if (!connected) {
    return (
      <div className="app-shell room-shell">
        <div className="loading-state">
          {roomSocketError || "Connecting to room..."}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell room-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">MG</span>
          <div>
            <p className="eyebrow">Room</p>
            <h1>{gameId}</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="room-layout">
        <section className="room-meta-panel">
          <div>
            <p className="eyebrow">Session ID</p>
            <h2>{roomId}</h2>
          </div>
          <div className="room-actions">
            <span className="status-pill success">
              <FiWifi aria-hidden="true" />
              Connected
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="action-button secondary"
            >
              {copied ? (
                <FiCheckCircle aria-hidden="true" />
              ) : (
                <FiCopy aria-hidden="true" />
              )}
              <span>{copied ? "Link copied" : "Copy invite"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyRoomId}
              className="action-button secondary"
            >
              {copiedRoomId ? (
                <FiCheckCircle aria-hidden="true" />
              ) : (
                <FiHash aria-hidden="true" />
              )}
              <span>{copiedRoomId ? "ID copied" : "Copy ID"}</span>
            </button>
          </div>
        </section>

        <div className="room-grid">
          <aside className="room-sidebar">
            {players && Object.keys(players).length > 0 && (
              <PlayersList players={players} />
            )}
          </aside>

          <section className="game-stage">
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
            {gameId === GameId.DICE_ELIMINATION && diceEliminationRoomState && (
              <DiceEliminationGameRoom
                roomState={diceEliminationRoomState}
                rollDice={rollEliminationDice}
                startNextRound={startNextRound}
                resetGame={resetGame}
                isMyTurn={isDiceEliminationTurn}
                isLeader={isDiceEliminationLeader}
              />
            )}
            {gameId === GameId.PANIC_POTATO && panicPotatoRoomState && (
              <PanicPotatoGameRoom
                roomId={roomId!}
                roomState={panicPotatoRoomState}
                myPlayerId={myPlayerId}
                sendInput={sendInput}
                passPotato={passPotato}
                activatePowerUp={activatePowerUp}
                rematch={rematch}
                roomError={panicRoomError}
              />
            )}
          </section>

          <aside className="chat-panel">
            <div className="section-heading">
              <h2>Room Chat</h2>
              <span className="status-pill subtle">{messages.length}</span>
            </div>
            <div className="chat-feed">
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div key={`${msg.playerName}-${idx}`} className="chat-line">
                    <strong>{msg.playerName}</strong>
                    <span>{msg.message}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No messages yet.</p>
              )}
            </div>
            <div className="chat-compose">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="control-field"
              />
              <button
                type="button"
                onClick={handleSend}
                className="icon-action"
                aria-label="Send message"
              >
                <FiSend aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Room;
