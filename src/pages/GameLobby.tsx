import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  FiArrowRight,
  FiLogIn,
  FiLogOut,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import { ThemeToggle } from "../components/ThemeToggle";
import { clientEnv } from "../config/env";
import { onAuthChange, signInWithGoogle, signOut } from "../config/firebase";
import {
  API_ROUTES,
  APP_ROUTES,
  AuthType,
  GameId,
  GamesArray,
  LocalStorageKey,
  PLAYER_DEFAULTS,
  RouteSegment,
} from "../constants";

const GameLobby = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string>(GameId.PIG_GAME);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (user) {
        const displayName = user.displayName || PLAYER_DEFAULTS.NAME;
        localStorage.setItem(LocalStorageKey.PLAYER_NAME, displayName);
        localStorage.setItem(LocalStorageKey.PLAYER_ID, user.uid);
        localStorage.setItem(LocalStorageKey.AUTH_TYPE, AuthType.GOOGLE);
        setPlayerName(displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firebaseUser) return;

    let playerId = localStorage.getItem(LocalStorageKey.PLAYER_ID);
    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem(LocalStorageKey.PLAYER_ID, playerId);
    }
    localStorage.setItem(LocalStorageKey.AUTH_TYPE, AuthType.GUEST);
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser) return;

    const savedName = localStorage.getItem(LocalStorageKey.PLAYER_NAME);
    if (savedName) setPlayerName(savedName);
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser) return;

    if (playerName.trim()) {
      localStorage.setItem(LocalStorageKey.PLAYER_NAME, playerName.trim());
    }
  }, [playerName, firebaseUser]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem(LocalStorageKey.AUTH_TYPE);
    localStorage.removeItem(LocalStorageKey.PLAYER_ID);
    localStorage.removeItem(LocalStorageKey.PLAYER_NAME);
    setPlayerName("");
  };

  const handleCreateRoom = (gameId: string) => {
    if (!playerName.trim()) {
      alert("Please enter your name first.");
      return;
    }

    const roomId = uuidv4();
    navigate(APP_ROUTES.roomWithName(gameId, roomId, playerName));
  };

  const checkRoomExistence = async (gameId: string, roomId: string) => {
    try {
      const res = await fetch(
        `${clientEnv.backendUrl}${API_ROUTES.checkRoomExistence(gameId, roomId)}`
      );
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleJoinRoom = async () => {
    try {
      let gameId = "";
      let roomId = "";

      if (roomLink.includes("http")) {
        const url = new URL(roomLink);
        const parts = url.pathname.split("/").filter(Boolean);
        const roomIndex = parts.indexOf(RouteSegment.ROOM);
        gameId = parts[roomIndex + 1];
        roomId = parts[roomIndex + 2];
      } else {
        gameId = selectedGameId;
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

      setIsLoading(true);
      const exists = await checkRoomExistence(gameId, roomId);
      setIsLoading(false);

      if (!exists) {
        alert("This room has been disbanded or doesn't exist.");
        return;
      }

      localStorage.setItem(LocalStorageKey.PLAYER_NAME, playerName.trim());
      navigate(APP_ROUTES.roomWithName(gameId, roomId, playerName));
    } catch (error) {
      alert("Invalid input. Please enter a valid URL or room ID. " + error);
      setIsLoading(false);
    }
  };

  if (!authReady) {
    return (
      <div className="app-shell">
        <div className="loading-state">Loading lobby...</div>
      </div>
    );
  }

  return (
    <div className="app-shell lobby-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">MG</span>
          <div>
            <p className="eyebrow">Multiplayer suite</p>
            <h1>Game Lobby</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="lobby-layout">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Rooms, chat, reconnects</p>
            <h2>Start a session that feels ready before the first roll.</h2>
          </div>
          <div className="hero-stats">
            <div>
              <span>{GamesArray.length}</span>
              <p>Games</p>
            </div>
            <div>
              <span>{firebaseUser ? "Google" : "Guest"}</span>
              <p>Mode</p>
            </div>
          </div>
        </section>

        <section className="surface-panel auth-panel">
          <div className="section-heading">
            <h2>Player</h2>
            <span className="status-pill">
              {firebaseUser ? "Signed in" : "Guest ready"}
            </span>
          </div>

          {firebaseUser ? (
            <div className="account-row">
              <div className="avatar-token">
                {(firebaseUser.displayName || PLAYER_DEFAULTS.NAME)
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <div>
                <p className="label">Signed in as</p>
                <strong>{firebaseUser.displayName}</strong>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="action-button danger"
              >
                <FiLogOut aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="stack">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="action-button primary full-width"
              >
                <FiLogIn aria-hidden="true" />
                <span>Sign in with Google</span>
              </button>
              <label className="field-label" htmlFor="player-name">
                Display name
              </label>
              <div className="input-with-icon">
                <FiUser aria-hidden="true" />
                <input
                  id="player-name"
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="control-field"
                />
              </div>
            </div>
          )}
        </section>

        <section className="surface-panel join-panel">
          <div className="section-heading">
            <h2>Join Room</h2>
            <span className="status-pill subtle">Invite or room ID</span>
          </div>

          {!roomLink.includes("http") && (
            <div className="field-group">
              <label className="field-label" htmlFor="game-selector">
                Game
              </label>
              <select
                id="game-selector"
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="control-field"
              >
                {GamesArray.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="room-link">
              Room link or ID
            </label>
            <input
              id="room-link"
              type="text"
              placeholder="Paste room link or room ID"
              value={roomLink}
              onChange={(e) => setRoomLink(e.target.value)}
              className="control-field"
            />
          </div>

          <button
            type="button"
            onClick={handleJoinRoom}
            className="action-button accent full-width"
            disabled={isLoading}
          >
            <FiArrowRight aria-hidden="true" />
            <span>{isLoading ? "Checking..." : "Join room"}</span>
          </button>
        </section>

        <section className="surface-panel create-panel">
          <div className="section-heading">
            <h2>Create Room</h2>
            <span className="status-pill subtle">Choose a game</span>
          </div>
          <div className="game-list">
            {GamesArray.map((game) => (
              <article key={game.id} className="game-option">
                <div>
                  <p className="label">Game</p>
                  <strong>{game.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateRoom(game.id)}
                  className="icon-action"
                  aria-label={`Create ${game.name} room`}
                >
                  <FiPlus aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GameLobby;
