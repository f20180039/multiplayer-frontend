import { useSocket } from "../context/SocketContext";

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
    <div className="ans-bg-Gray-200 ans-rounded-2xl ans-shadow-md ans-p-4 ans-space-y-4">
      <h3 className="ans-text-2 ans-font-inter-2 ans-text-Blue_gray-800">
        👥 Players in Room
      </h3>
      <ul className="ans-space-y-3">
        {players.map((p) => (
          <li
            key={p.id}
            className="ans-flex ans-items-center ans-justify-between ans-bg-Blue_gray-50 ans-p-3 ans-rounded-lg ans-shadow-sm"
          >
            <div className="ans-flex ans-items-center ans-space-x-3">
              <div className="ans-w-10 ans-h-10 ans-rounded-full ans-bg-Blue-500 ans-text-White ans-flex ans-items-center ans-justify-center ans-font-inter-3 ans-text-1">
                {typeof p.name === "string" && p.name.length > 0
                  ? p.name[0].toUpperCase()
                  : "?"}
              </div>
              <div>
                <div className="ans-font-inter-2 ans-text-Blue_gray-800 ans-flex ans-items-center ans-gap-2">
                  {p.name || "Unknown"}
                  {socket && p.id === socket.id && (
                    <span className="ans-text-0 ans-text-Gray-500">(You)</span>
                  )}
                  <span
                    className={`ans-w-2 ans-h-2 ans-rounded-full ${
                      p.isOnline ? "ans-bg-Success-500" : "ans-bg-Error-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
