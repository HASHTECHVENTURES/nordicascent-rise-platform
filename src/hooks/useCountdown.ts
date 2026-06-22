import { useEffect, useState } from "react";

/** Live seconds remaining until `expiresAtMs`, updates every second. */
export function useCountdown(expiresAtMs: number | null | undefined) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAtMs) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAtMs]);

  return secondsLeft;
}
