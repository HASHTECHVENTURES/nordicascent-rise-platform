import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PageSpinnerProps = {
  /** Full-page centered spinner vs compact section spinner */
  size?: "page" | "section";
  className?: string;
};

export function PageSpinner({ size = "page", className }: PageSpinnerProps) {
  const isPage = size === "page";
  return (
    <div
      className={cn(
        "flex justify-center",
        isPage ? "py-20" : "py-8",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          isPage ? "h-8 w-8" : "h-6 w-6"
        )}
      />
    </div>
  );
}
