import { useCallback, useEffect, useState } from "react";
import PlaceCanvas from "../components/PlaceCanvas";
import Palette, { PALETTE } from "../components/Palette";
import { CooldownError, getCanvas, placePixel } from "../api";
import type { CanvasState } from "../types";
import Header from "../components/Header";

const POLL_MS = 2000; // how often to refresh the board from the backend

// Size of the local grid used when the backend can't be reached
const OFFLINE_WIDTH = 100;
const OFFLINE_HEIGHT = 100;

function emptyBoard(width = OFFLINE_WIDTH, height = OFFLINE_HEIGHT): CanvasState {
  return { width, height, pixels: new Array(width * height).fill("#ffffff") };
}

export default function CanvasPage() {
  const [board, setBoard] = useState<CanvasState | null>(null);
  const [offline, setOffline] = useState(false);
  const [color, setColor] = useState(PALETTE[5]);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  /** Load from the backend; on failure fall back to an empty local grid. */
  const connect = useCallback(async () => {
    try {
      setBoard(await getCanvas());
      setOffline(false);
      setError(null);
    } catch {
      // Keep whatever is already drawn; only create an empty grid if there is none
      setBoard((b) => b ?? emptyBoard());
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  // Poll for other people's pixels while online.
  // Paused while offline so the server never overwrites local drawings.
  // Swap this for WebSockets/SignalR if your backend pushes updates.
  useEffect(() => {
    if (offline) return;
    const id = setInterval(async () => {
      try {
        setBoard(await getCanvas());
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [offline]);

  // Tick the cooldown countdown
  useEffect(() => {
    if (cooldownUntil <= now) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil, now]);

  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const onCooldown = !offline && secondsLeft > 0;

  function setPixel(i: number, c: string) {
    setBoard((b) => {
      if (!b) return b;
      const pixels = b.pixels.slice();
      pixels[i] = c;
      return { ...b, pixels };
    });
  }

  async function handlePlace(x: number, y: number) {
    if (!board || onCooldown) return;
    const i = y * board.width + x;
    const previous = board.pixels[i];

    // Draw immediately (optimistic when online, the only copy when offline)
    setPixel(i, color);
    if (offline) return;

    try {
      await placePixel({ x, y, color });
    } catch (e) {
      if (e instanceof CooldownError) {
        setPixel(i, previous);
        setCooldownUntil(Date.now() + e.retryAfterSeconds * 1000);
        setNow(Date.now());
      } else {
        // Backend/database went away: keep the pixel and continue locally
        setOffline(true);
      }
    }
  }

  function retry() {
    if (confirm("Reconnecting replaces your local drawing with the saved board. Continue?")) {
      connect();
    }
  }

  return (
    <div className="app">

      {offline && (
        <div className="offline-banner">
          Can't reach the server — you're drawing locally and nothing is saved.
          <button onClick={retry}>Retry</button>
        </div>
      )}

      {board ? (
        <PlaceCanvas
          width={board.width}
          height={board.height}
          pixels={board.pixels}
          selectedColor={color}
          disabled={onCooldown}
          onPlace={handlePlace}
          onHover={setHover}
        />
      ) : (
        <div className="board loading">Loading canvas…</div>
      )}

      <footer className="bottombar">
        {onCooldown ? (
          <div className="cooldown">Next pixel in {secondsLeft}s</div>
        ) : (
          <Palette selected={color} onSelect={setColor} />
        )}
        {error && !offline && <div className="error">{error}</div>}
      </footer>
    </div>
  );
}
