import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FiActivity,
  FiRefreshCw,
  FiRepeat,
  FiShuffle,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { PANIC_POTATO_LIMITS } from "../../../constants";
import {
  PanicPotatoInput,
  PanicPotatoPlayer,
  PanicPotatoPowerUpType,
  PanicPotatoRoomState,
} from "../../../types/panicPotatoTypes";
import { PanicPotatoArena } from "./PanicPotatoArena";

interface PanicPotatoGameRoomProps {
  roomId: string;
  roomState: PanicPotatoRoomState;
  myPlayerId: string | null;
  sendInput: (input: PanicPotatoInput, dash?: boolean) => void;
  passPotato: (targetId?: string) => void;
  activatePowerUp: () => void;
  rematch: () => void;
  roomError?: string | null;
}

const POWER_UP_LABELS: Record<PanicPotatoPowerUpType, string> = {
  DASH_PEPPER: "Dash Pepper",
  GLUE_HANDS: "Glue Hands",
  SWAP_SAUCE: "Swap Sauce",
};

export const PanicPotatoGameRoom = ({
  roomId,
  roomState,
  myPlayerId,
  sendInput,
  passPotato,
  activatePowerUp,
  rematch,
  roomError,
}: PanicPotatoGameRoomProps) => {
  const [now, setNow] = useState(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastExplosionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const me = useMemo(
    () => roomState.players.find((player) => player.id === myPlayerId) ?? null,
    [myPlayerId, roomState.players]
  );
  const holder = roomState.players.find(
    (player) => player.id === roomState.potatoHolderId
  );
  const winner = roomState.players.find(
    (player) => player.id === roomState.winnerId
  );
  const livingPlayers = roomState.players.filter(isLiving);
  const eliminatedPlayers = roomState.players.filter(
    (player) => player.isEliminated || player.isSpectator
  );

  const countdownSeconds = roomState.countdownEndsAt
    ? Math.max(0, Math.ceil((roomState.countdownEndsAt - now) / 1000))
    : 0;
  const amHolder = Boolean(me && roomState.potatoHolderId === me.id);
  const passLockedUntil = Math.max(
    me?.receiveCooldownUntil ?? 0,
    me?.glueLockedUntil ?? 0
  );
  const passLockSeconds = Math.max(0, (passLockedUntil - roomState.serverTime) / 1000);
  const canPass = amHolder && passLockSeconds <= 0 && roomState.phase === "ROUND_ACTIVE";

  const ensureAudio = useCallback(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, gain = 0.03) => {
      ensureAudio();
      const context = audioContextRef.current;
      if (!context) return;

      const oscillator = context.createOscillator();
      const volume = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      volume.gain.value = gain;
      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    },
    [ensureAudio]
  );

  useEffect(() => {
    if (roomState.phase !== "ROUND_ACTIVE") return;

    const timer = window.setInterval(() => {
      playTone(520, 0.04, 0.018);
    }, 740);
    return () => window.clearInterval(timer);
  }, [playTone, roomState.phase]);

  useEffect(() => {
    const explosion = roomState.lastExplosion;
    if (!explosion || explosion.id === lastExplosionIdRef.current) return;

    lastExplosionIdRef.current = explosion.id;
    playTone(110, 0.13, 0.055);
    window.setTimeout(() => playTone(70, 0.18, 0.045), 90);
  }, [playTone, roomState.lastExplosion]);

  const handleSendInput = useCallback(
    (input: PanicPotatoInput, dash = false) => {
      if (dash) ensureAudio();
      sendInput(input, dash);
    },
    [ensureAudio, sendInput]
  );

  const handlePass = () => {
    ensureAudio();
    passPotato();
  };

  const handleUsePowerUp = () => {
    ensureAudio();
    activatePowerUp();
  };

  const handleRematch = () => {
    ensureAudio();
    rematch();
  };

  return (
    <div className="panic-game">
      <div className="panic-header">
        <div>
          <p className="eyebrow">{roomState.arena.name}</p>
          <h2>Panic Potato</h2>
        </div>
        <div className="panic-status-row">
          <span className="status-pill subtle">Room {roomId}</span>
          <span className="status-pill">Round {roomState.round}</span>
          <span className="status-pill accent">{formatPhase(roomState.phase)}</span>
        </div>
      </div>

      {roomError && <p className="panic-alert danger">{roomError}</p>}

      <div className="panic-callout" data-phase={roomState.phase}>
        <div>
          <strong>{roomState.lastEvent}</strong>
          <span>
            {holder
              ? `${truncateName(holder.name)} is holding the potato.`
              : `${livingPlayers.length} players alive.`}
          </span>
        </div>
        {roomState.phase === "COUNTDOWN" && (
          <div className="panic-countdown">{countdownSeconds}</div>
        )}
        {roomState.phase === "MATCH_END" && (
          <div className="panic-winner">
            {winner ? `${winner.name} wins` : "No winner"}
          </div>
        )}
      </div>

      <PanicPotatoArena
        roomState={roomState}
        localPlayerId={myPlayerId}
        sendInput={handleSendInput}
        passPotato={passPotato}
        activatePowerUp={activatePowerUp}
        onUserGesture={ensureAudio}
      />

      <div className="panic-controls">
        <button
          type="button"
          onClick={handlePass}
          disabled={!canPass}
          className="action-button primary"
        >
          <FiTarget aria-hidden="true" />
          <span>
            {passLockSeconds > 0
              ? `Locked ${passLockSeconds.toFixed(1)}s`
              : "Pass"}
          </span>
        </button>
        <button
          type="button"
          onClick={handleUsePowerUp}
          disabled={me?.powerUp !== "SWAP_SAUCE"}
          className="action-button accent"
        >
          <FiShuffle aria-hidden="true" />
          <span>Swap</span>
        </button>
        {roomState.phase === "MATCH_END" && (
          <button
            type="button"
            onClick={handleRematch}
            className="action-button secondary"
          >
            <FiRefreshCw aria-hidden="true" />
            <span>Rematch</span>
          </button>
        )}
      </div>

      <div className="panic-info-grid">
        <section className="panic-scoreboard">
          <div className="section-heading">
            <h3>Players</h3>
            <span className="status-pill subtle">
              {livingPlayers.length}/{PANIC_POTATO_LIMITS.MAX_PLAYERS}
            </span>
          </div>
          <div className="panic-player-list">
            {roomState.players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isMe={player.id === myPlayerId}
                hasPotato={player.id === roomState.potatoHolderId}
                serverTime={roomState.serverTime}
              />
            ))}
          </div>
        </section>

        <section className="panic-scoreboard">
          <div className="section-heading">
            <h3>Status</h3>
            <span className="status-pill subtle">
              <FiActivity aria-hidden="true" />
              {roomState.phase}
            </span>
          </div>
          <div className="panic-status-list">
            <div>
              <span>Holder</span>
              <strong>{holder ? truncateName(holder.name) : "-"}</strong>
            </div>
            <div>
              <span>Your power-up</span>
              <strong>{me?.powerUp ? POWER_UP_LABELS[me.powerUp] : "-"}</strong>
            </div>
            <div>
              <span>Dash</span>
              <strong>
                {me && me.dashCooldownUntil > roomState.serverTime
                  ? `${Math.ceil((me.dashCooldownUntil - roomState.serverTime) / 1000)}s`
                  : "Ready"}
              </strong>
            </div>
            <div>
              <span>Eliminated</span>
              <strong>
                {eliminatedPlayers.length > 0
                  ? eliminatedPlayers.map((player) => truncateName(player.name)).join(", ")
                  : "-"}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="panic-powerup-strip">
        <PowerUpChip icon={<FiZap aria-hidden="true" />} label="Dash Pepper" />
        <PowerUpChip icon={<FiRepeat aria-hidden="true" />} label="Glue Hands" />
        <PowerUpChip icon={<FiShuffle aria-hidden="true" />} label="Swap Sauce" />
      </div>
    </div>
  );
};

interface PlayerRowProps {
  player: PanicPotatoPlayer;
  isMe: boolean;
  hasPotato: boolean;
  serverTime: number;
}

const PlayerRow = ({
  player,
  isMe,
  hasPotato,
  serverTime,
}: PlayerRowProps) => {
  const glueLocked = player.glueLockedUntil > serverTime;
  const stateLabel = player.isSpectator
    ? "Spectator"
    : player.isEliminated
      ? "Eliminated"
      : player.isConnected
        ? "Alive"
        : "Offline";

  return (
    <div className="panic-player-row" data-holder={hasPotato}>
      <span className="panic-color-dot" style={{ background: player.color }} />
      <div>
        <strong>
          {truncateName(player.name)}
          {isMe ? " (you)" : ""}
        </strong>
        <span>{stateLabel}</span>
      </div>
      <div className="panic-life-stack" aria-label={`${player.lives} lives`}>
        {Array.from({ length: PANIC_POTATO_LIMITS.STARTING_LIVES }, (_, index) => (
          <span key={index} data-filled={index < player.lives} />
        ))}
      </div>
      {hasPotato && <span className="panic-potato-badge">!</span>}
      {glueLocked && <span className="panic-lock-badge">Glue</span>}
    </div>
  );
};

const PowerUpChip = ({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) => (
  <span className="panic-powerup-chip">
    {icon}
    {label}
  </span>
);

const isLiving = (player: PanicPotatoPlayer) =>
  player.isConnected &&
  !player.isSpectator &&
  !player.isEliminated &&
  player.lives > 0;

const formatPhase = (phase: string) =>
  phase
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const truncateName = (name: string) =>
  name.length > 18 ? `${name.slice(0, 17)}...` : name;
