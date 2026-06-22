import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTimer } from "@/lib/readiness";
import { cn } from "@/lib/utils";

type Props = {
  expiresAtMs: number | null | undefined;
  hard?: boolean;
  size?: "sm" | "lg";
  className?: string;
};

export default function ReadinessCountdown({ expiresAtMs, hard = false, size = "lg", className }: Props) {
  const secondsLeft = useCountdown(expiresAtMs);

  if (secondsLeft === null) return null;

  const urgent = secondsLeft < 300;
  const critical = secondsLeft < 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border font-mono tabular-nums transition-colors",
        size === "lg" ? "px-4 py-2 text-lg" : "px-2.5 py-1 text-sm",
        hard && critical && "border-destructive bg-destructive/10 text-destructive animate-pulse",
        hard && urgent && !critical && "border-destructive/70 text-destructive bg-destructive/5",
        !urgent && "border-border bg-card",
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${formatTimer(secondsLeft)} remaining`}
    >
      <Clock className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span className="font-semibold">{formatTimer(secondsLeft)}</span>
      <span className={cn("text-muted-foreground font-sans", size === "lg" ? "text-xs" : "text-[10px]")}>
        {hard ? "left" : "suggested"}
      </span>
    </div>
  );
}
