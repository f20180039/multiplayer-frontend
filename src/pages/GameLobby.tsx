import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GameId, GamesArray } from "../constants";
import { signInWithGoogle, signOut, onAuthChange } from "../config/firebase";
import type { User } from "firebase/auth";

const PLAYER_NAME_KEY = "playerName";
const PLAYER_ID_KEY = "playerId";
const AUTH_TYPE_KEY = "authType";

const GameLobby = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string>(GameId.PIG_GAME);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (user) {
        // Google-authenticated user
        localStorage.setItem(PLAYER_NAME_KEY, user.displayName || "Player");
        localStorage.setItem(PLAYER_ID_KEY, user.uid);
        localStorage.setItem(AUTH_TYPE_KEY, "google");
        setPlayerName(user.displayName || "Player");
      }
    });
    return () => unsubscribe();
  }, []);

  // Generate or retrieve persistent playerId for guests
  useEffect(() => {
    if (firebaseUser) return; // Skip for Google users
    let playerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem(PLAYER_ID_KEY, playerId);
    }
    localStorage.setItem(AUTH_TYPE_KEY, "guest");
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser) return; // Name managed by Firebase for Google users
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) setPlayerName(savedName);
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser) return;
    if (playerName.trim()) {
      localStorage.setItem(PLAYER_NAME_KEY, playerName.trim());
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
    localStorage.removeItem(AUTH_TYPE_KEY);
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
    setPlayerName("");
  };

  const handleCreateRoom = (gameId: string) => {
    if (!playerName.trim()) {
      alert("Please enter your name first.");
      return;
    }
    const roomId = uuidv4();
    navigate(`/room/${gameId}/${roomId}?name=${encodeURIComponent(playerName)}`);
  };

  const checkRoomExistence = async (gameId: string, roomId: string) => {
    try {
      const res = await fetch(
        `/api/check-room-existence/${gameId}/${roomId}`
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
        const roomIndex = parts.indexOf("room");
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

      // Save player name for refresh/rejoin
      localStorage.setItem(PLAYER_NAME_KEY, playerName.trim());
      navigate(`/room/${gameId}/${roomId}?name=${encodeURIComponent(playerName)}`);
    } catch (error) {
      alert("Invalid input. Please enter a valid URL or room ID. " + error);
      setIsLoading(false);
    }
  };

  if (!authReady) {
    return (
      <div className="ans-p-8 ans-max-w-xl ans-mx-auto ans-text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="ans-p-8 ans-max-w-xl ans-mx-auto ans-space-y-8 ans-text-Blue_gray-800 ans-font-mario">
      <h1 className="ans-text-3 ans-font-inter-3 text-center ans-text-Blue_gray-200">
        Game Lobby
      </h1>

      {/* Auth Section */}
      <div className="ans-bg-Blue_gray-50 ans-rounded-2xl ans-p-6 ans-shadow-sm ans-space-y-4">
        {firebaseUser ? (
          <div className="ans-flex ans-items-center ans-justify-between">
            <span className="ans-font-inter-1">
              Signed in as <strong>{firebaseUser.displayName}</strong>
            </span>
            <button
              onClick={handleSignOut}
              className="ans-bg-Red-500 hover:ans-bg-Red-600 ans-transition-colors ans-text-White ans-px-4 ans-py-2 ans-rounded-lg"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="ans-space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="ans-bg-Blue-500 hover:ans-bg-Blue-600 ans-transition-colors ans-text-White ans-px-4 ans-py-2 ans-rounded-lg ans-w-full"
            >
              Sign in with Google
            </button>
            <div className="ans-text-center ans-text-Blue_gray-400 ans-text-sm">
              or play as guest
            </div>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="ans-p-3 ans-rounded-lg ans-border ans-border-Blue_gray-200 ans-w-full ans-text-Blue_gray-800 ans-shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Join Room Section */}
      <div className="ans-bg-Blue_gray-50 ans-rounded-2xl ans-p-6 ans-shadow-sm ans-space-y-4">
        <h2 className="ans-text-3 ans-font-inter-2">Join a Room</h2>

        {/* Game selector - only shown when not pasting full URL */}
        {!roomLink.includes("http") && (
          <div className="ans-space-y-2">
            <label className="ans-text-sm ans-font-inter-1 ans-text-Blue_gray-600">
              Select Game:
            </label>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="ans-p-3 ans-rounded-lg ans-border ans-border-Blue_gray-200 ans-w-full ans-shadow-sm ans-bg-White"
            >
              {GamesArray.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          type="text"
          placeholder="Paste room link or room ID"
          value={roomLink}
          onChange={(e) => setRoomLink(e.target.value)}
          className="ans-p-3 ans-rounded-lg ans-border ans-border-Blue_gray-200 ans-w-full ans-shadow-sm"
        />

        <p className="ans-text-xs ans-text-Blue_gray-500">
          💡 Tip: Enter a full invite link OR just the room ID with game selection above
        </p>

        <button
          onClick={handleJoinRoom}
          className="ans-bg-Success-500 hover:ans-bg-Success-600 ans-transition-colors ans-text-White ans-px-4 ans-py-2 ans-rounded-lg ans-font-inter-1 ans-w-full"
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Join Room"}
        </button>
      </div>

      {/* Create Room Section */}
      <div className="ans-bg-Blue_gray-50 ans-rounded-2xl ans-p-6 ans-shadow-sm ans-space-y-4">
        <h2 className="ans-text-4 ans-font-semibold">Create a New Room</h2>
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
