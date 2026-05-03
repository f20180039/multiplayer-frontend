import { useEffect, useRef } from "react";
import Phaser from "phaser";
import {
  PanicPotatoInput,
  PanicPotatoPlayer,
  PanicPotatoPowerUpType,
  PanicPotatoRoomState,
} from "../../../types/panicPotatoTypes";

interface PanicPotatoArenaProps {
  roomState: PanicPotatoRoomState;
  localPlayerId: string | null;
  sendInput: (input: PanicPotatoInput, dash?: boolean) => void;
  passPotato: (targetId?: string) => void;
  activatePowerUp: () => void;
  onUserGesture: () => void;
}

const PASS_RANGE = 78;

const POWER_UP_META: Record<
  PanicPotatoPowerUpType,
  { label: string; shortLabel: string; color: number; stroke: number }
> = {
  DASH_PEPPER: {
    label: "Dash Pepper",
    shortLabel: "DP",
    color: 0xdc2626,
    stroke: 0x7f1d1d,
  },
  GLUE_HANDS: {
    label: "Glue Hands",
    shortLabel: "GH",
    color: 0x7c3aed,
    stroke: 0x3b0764,
  },
  SWAP_SAUCE: {
    label: "Swap Sauce",
    shortLabel: "SS",
    color: 0x2563eb,
    stroke: 0x1e3a8a,
  },
};

class PanicPotatoScene extends Phaser.Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private labels = new Map<string, Phaser.GameObjects.Text>();
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private getState: () => PanicPotatoRoomState | null;
  private getLocalPlayerId: () => string | null;
  private sendInput: (input: PanicPotatoInput, dash?: boolean) => void;
  private passPotato: (targetId?: string) => void;
  private activatePowerUp: () => void;
  private onUserGesture: () => void;
  private lastInputKey = "";
  private lastInputSentAt = 0;

  constructor(config: {
    getState: () => PanicPotatoRoomState | null;
    getLocalPlayerId: () => string | null;
    sendInput: (input: PanicPotatoInput, dash?: boolean) => void;
    passPotato: (targetId?: string) => void;
    activatePowerUp: () => void;
    onUserGesture: () => void;
  }) {
    super("PanicPotatoScene");
    this.getState = config.getState;
    this.getLocalPlayerId = config.getLocalPlayerId;
    this.sendInput = config.sendInput;
    this.passPotato = config.passPotato;
    this.activatePowerUp = config.activatePowerUp;
    this.onUserGesture = config.onUserGesture;
  }

  create() {
    this.graphics = this.add.graphics();
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.keys = {
        w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        pass: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        power: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      };
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.onUserGesture();
      const target = this.getPointerPassTarget(pointer.worldX, pointer.worldY);
      this.passPotato(target?.id);
    });
  }

  update(time: number) {
    this.renderState();
    this.handleInput(time);
  }

  private handleInput(time: number) {
    if (!this.keys) return;

    const input = this.readInput();
    const inputKey = JSON.stringify(input);
    const shouldSend = inputKey !== this.lastInputKey || time - this.lastInputSentAt > 70;

    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.onUserGesture();
      this.sendInput(input, true);
      this.lastInputSentAt = time;
      this.lastInputKey = inputKey;
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.pass)) {
      this.onUserGesture();
      this.passPotato(this.getNearestPassTarget()?.id);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.power)) {
      this.onUserGesture();
      this.activatePowerUp();
    }

    if (shouldSend) {
      this.sendInput(input);
      this.lastInputSentAt = time;
      this.lastInputKey = inputKey;
    }
  }

  private readInput(): PanicPotatoInput {
    if (!this.keys) {
      return { up: false, down: false, left: false, right: false };
    }

    return {
      up: this.keys.w.isDown || this.keys.up.isDown,
      down: this.keys.s.isDown || this.keys.down.isDown,
      left: this.keys.a.isDown || this.keys.left.isDown,
      right: this.keys.d.isDown || this.keys.right.isDown,
    };
  }

  private renderState() {
    const state = this.getState();
    if (!this.graphics || !state) return;

    const { arena } = state;
    this.graphics.clear();
    this.drawKitchen(arena.width, arena.height);

    state.powerUps.forEach((powerUp) => {
      if (!powerUp.active) {
        this.graphics?.lineStyle(2, 0x7a746b, 0.35);
        this.graphics?.strokeCircle(powerUp.x, powerUp.y, 13);
        return;
      }

      const meta = POWER_UP_META[powerUp.type];
      this.graphics?.fillStyle(meta.color, 0.95);
      this.graphics?.lineStyle(3, meta.stroke, 1);
      this.graphics?.fillCircle(powerUp.x, powerUp.y, 16);
      this.graphics?.strokeCircle(powerUp.x, powerUp.y, 16);
      this.upsertLabel(
        `power-${powerUp.id}`,
        meta.shortLabel,
        powerUp.x,
        powerUp.y - 7,
        "#ffffff",
        "11px"
      );
    });

    const liveLabelIds = new Set<string>();
    state.powerUps
      .filter((powerUp) => powerUp.active)
      .forEach((powerUp) => liveLabelIds.add(`power-${powerUp.id}`));

    const localPlayer = state.players.find(
      (player) => player.id === this.getLocalPlayerId()
    );
    if (localPlayer && state.potatoHolderId === localPlayer.id) {
      this.graphics.lineStyle(2, 0xfbbf24, 0.5);
      this.graphics.strokeCircle(localPlayer.x, localPlayer.y, PASS_RANGE);
    }

    state.players.forEach((player) => {
      const isHolder = state.potatoHolderId === player.id;
      const isLocked = player.glueLockedUntil > state.serverTime;
      const alpha = player.isEliminated || player.isSpectator ? 0.32 : 1;
      const color = Phaser.Display.Color.HexStringToColor(player.color).color;

      this.graphics?.fillStyle(color, alpha);
      this.graphics?.lineStyle(isHolder ? 6 : 3, isHolder ? 0xf59e0b : 0xffffff, 1);
      this.graphics?.fillCircle(player.x, player.y, player.radius);
      this.graphics?.strokeCircle(player.x, player.y, player.radius);

      if (isHolder) {
        this.graphics?.fillStyle(0xfacc15, 1);
        this.graphics?.lineStyle(3, 0xbe123c, 1);
        this.graphics?.fillEllipse(player.x, player.y - 31, 25, 18);
        this.graphics?.strokeEllipse(player.x, player.y - 31, 25, 18);
        this.upsertLabel(`holder-${player.id}`, "!", player.x, player.y - 39, "#7f1d1d", "16px");
        liveLabelIds.add(`holder-${player.id}`);
      }

      if (isLocked) {
        this.graphics?.lineStyle(3, 0x38bdf8, 0.95);
        this.graphics?.strokeCircle(player.x, player.y, player.radius + 8);
        this.upsertLabel(
          `lock-${player.id}`,
          "LOCK",
          player.x,
          player.y - player.radius - 28,
          "#075985",
          "11px"
        );
        liveLabelIds.add(`lock-${player.id}`);
      }

      const label = player.isSpectator
        ? `${truncate(player.name)} (out)`
        : `${truncate(player.name)} ${"I".repeat(player.lives)}`;
      this.upsertLabel(
        `name-${player.id}`,
        label,
        player.x,
        player.y + player.radius + 8,
        "#17211d",
        "12px"
      );
      liveLabelIds.add(`name-${player.id}`);
    });

    this.removeStaleLabels(liveLabelIds);
  }

  private drawKitchen(width: number, height: number) {
    const state = this.getState();
    if (!this.graphics || !state) return;

    this.graphics.fillStyle(0xf8e7c7, 1);
    this.graphics.fillRoundedRect(0, 0, width, height, 14);

    this.graphics.lineStyle(1, 0xe6cfa2, 0.75);
    for (let x = 0; x <= width; x += 60) {
      this.graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 60) {
      this.graphics.lineBetween(0, y, width, y);
    }

    this.graphics.lineStyle(8, 0x7c4a24, 1);
    this.graphics.strokeRoundedRect(4, 4, width - 8, height - 8, 12);

    state.arena.obstacles.forEach((obstacle) => {
      this.graphics?.fillStyle(0x8b8073, 1);
      this.graphics?.lineStyle(3, 0x4b433a, 1);
      this.graphics?.fillRoundedRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
        8
      );
      this.graphics?.strokeRoundedRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
        8
      );
    });
  }

  private upsertLabel(
    id: string,
    value: string,
    x: number,
    y: number,
    color: string,
    fontSize: string
  ) {
    let label = this.labels.get(id);
    if (!label) {
      label = this.add.text(x, y, value, {
        color,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize,
        fontStyle: "700",
        stroke: "#ffffff",
        strokeThickness: 3,
      });
      label.setOrigin(0.5, 0);
      this.labels.set(id, label);
    }

    label.setText(value);
    label.setPosition(x, y);
    label.setStyle({ color, fontSize });
  }

  private removeStaleLabels(liveLabelIds: Set<string>) {
    for (const [id, label] of this.labels) {
      if (!liveLabelIds.has(id)) {
        label.destroy();
        this.labels.delete(id);
      }
    }
  }

  private getPointerPassTarget(x: number, y: number) {
    const state = this.getState();
    const localPlayer = this.getLocalPlayer(state);
    if (!state || !localPlayer) return null;

    return this.getLivingTargets(state, localPlayer)
      .map((player) => ({
        player,
        pointerDistance: Math.hypot(player.x - x, player.y - y),
        holderDistance: Math.hypot(player.x - localPlayer.x, player.y - localPlayer.y),
      }))
      .filter(({ pointerDistance, holderDistance }) => pointerDistance <= 34 && holderDistance <= PASS_RANGE)
      .sort((a, b) => a.pointerDistance - b.pointerDistance)[0]?.player ?? null;
  }

  private getNearestPassTarget() {
    const state = this.getState();
    const localPlayer = this.getLocalPlayer(state);
    if (!state || !localPlayer) return null;

    return (
      this.getLivingTargets(state, localPlayer)
        .map((player) => ({
          player,
          distance: Math.hypot(player.x - localPlayer.x, player.y - localPlayer.y),
        }))
        .filter(({ distance }) => distance <= PASS_RANGE)
        .sort((a, b) => a.distance - b.distance)[0]?.player ?? null
    );
  }

  private getLocalPlayer(state: PanicPotatoRoomState | null) {
    if (!state) return null;
    return (
      state.players.find((player) => player.id === this.getLocalPlayerId()) ??
      null
    );
  }

  private getLivingTargets(
    state: PanicPotatoRoomState,
    localPlayer: PanicPotatoPlayer
  ) {
    return state.players.filter(
      (player) =>
        player.id !== localPlayer.id &&
        player.isConnected &&
        !player.isSpectator &&
        !player.isEliminated &&
        player.lives > 0
    );
  }
}

export const PanicPotatoArena = ({
  roomState,
  localPlayerId,
  sendInput,
  passPotato,
  activatePowerUp,
  onUserGesture,
}: PanicPotatoArenaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const stateRef = useRef(roomState);
  const localPlayerIdRef = useRef(localPlayerId);
  const callbacksRef = useRef({
    sendInput,
    passPotato,
    activatePowerUp,
    onUserGesture,
  });

  useEffect(() => {
    stateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    localPlayerIdRef.current = localPlayerId;
  }, [localPlayerId]);

  useEffect(() => {
    callbacksRef.current = {
      sendInput,
      passPotato,
      activatePowerUp,
      onUserGesture,
    };
  }, [sendInput, passPotato, activatePowerUp, onUserGesture]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const scene = new PanicPotatoScene({
      getState: () => stateRef.current,
      getLocalPlayerId: () => localPlayerIdRef.current,
      sendInput: (input, dash) => callbacksRef.current.sendInput(input, dash),
      passPotato: (targetId) => callbacksRef.current.passPotato(targetId),
      activatePowerUp: () => callbacksRef.current.activatePowerUp(),
      onUserGesture: () => callbacksRef.current.onUserGesture(),
    });

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: roomState.arena.width,
      height: roomState.arena.height,
      backgroundColor: "#f8e7c7",
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [roomState.arena.height, roomState.arena.width]);

  return <div ref={containerRef} className="panic-arena" />;
};

const truncate = (value: string) =>
  value.length > 12 ? `${value.slice(0, 11)}...` : value;
