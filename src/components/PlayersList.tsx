import { useSocket } from "../context/SocketContext";
import { RoomPlayer } from "../types/pigTypes";

interface PlayersListProps {
  players: RoomPlayer[];
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
            {/* Avatar and Name */}
            <div className="ans-flex ans-items-center ans-space-x-3">
              <div className="ans-w-10 ans-h-10 ans-rounded-full ans-bg-Blue-500 ans-text-White ans-flex ans-items-center ans-justify-center ans-font-inter-3 ans-text-1">
                {p.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="ans-font-inter-2 ans-text-Blue_gray-800">
                  {p.name}{" "}
                  {p.id === socket?.id && (
                    <span className="ans-text-0 ans-text-Gray-500">(You)</span>
                  )}
                </div>
                {typeof p.frozenScore === "number" &&
                  typeof p.tempScore === "number" && (
                    <div className="ans-text-1 ans-text-Blue_gray-600">
                      <span className="ans-bg-Blue-100 ans-text-Blue-700 ans-px-2 ans-py-0.5 ans-rounded-full ans-mr-1">
                        Frozen: {p.frozenScore}
                      </span>
                      <span className="ans-bg-Warning-100 ans-text-Warning-700 ans-px-2 ans-py-0.5 ans-rounded-full">
                        Temp: {p.tempScore}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
