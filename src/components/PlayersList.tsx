import { useSocket } from "../context/socketUtils";

interface Player {
  id: string;
  name?: string;
  lastSeen?: number;
  isOnline?: boolean;
}

interface PlayersListProps {
  players: Player[];
}

export const PlayersList = ({ players }: PlayersListProps) => {
  const socket = useSocket();

  return (
    <div className="players-panel">
      <div className="section-heading">
        <h2>Players</h2>
        <span className="status-pill subtle">{players.length}</span>
      </div>
      <ul className="players-list">
        {players.map((p) => (
          <li key={p.id} className="player-row">
            <div className="avatar-token">
              <span>
                {typeof p.name === "string" && p.name.length > 0
                  ? p.name[0].toUpperCase()
                  : "?"}
              </span>
            </div>
            <div className="player-row__body">
              <strong>{p.name || "Unknown"}</strong>
              {socket && p.id === socket.id && <span>You</span>}
            </div>
            <span
              className="presence-dot"
              data-online={Boolean(p.isOnline)}
              aria-label={p.isOnline ? "Online" : "Offline"}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
