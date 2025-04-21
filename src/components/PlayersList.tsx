import { useSocket } from "../context/SocketContext";
import { RoomPlayer } from "../types/pigTypes";

interface PlayersListProps {
  players: RoomPlayer[];
}

export const PlayersList = ({ players }: PlayersListProps) => {
  const socket = useSocket();

  return (
    <div>
      <h3 className="ans-text-lg ans-font-semibold ans-mb-2">
        👥 Players in Room
      </h3>
      <ul className="ans-list-disc ans-list-inside ans-text-left ans-max-w-md ans-mx-auto">
        {players.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>
            {p.id === socket?.id && (
              <span className="ans-text-xs ans-text-gray-500 ml-1">(You)</span>
            )}
            {typeof p.frozenScore === "number" &&
              typeof p.tempScore === "number" && (
                <>
                  {" — "}
                  <span className="ans-text-sm">
                    Frozen: {p.frozenScore}, Temp: {p.tempScore}
                  </span>
                </>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};
