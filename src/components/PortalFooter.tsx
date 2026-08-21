import { Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Public company page (no member-only query params). */
export const NORDIC_ASCENT_LINKEDIN_URL = "https://www.linkedin.com/company/nordic-ascent/";

type Props = {
  className?: string;
  compact?: boolean;
};

/** Footer strip for authenticated portals — LinkedIn + copyright. */
export default function PortalFooter({ className, compact = false }: Props) {
  return (
    <footer
      className={cn(
        "border-t border-border mt-auto",
        compact ? "py-3 px-4" : "py-4 px-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© 2026 Nordic Ascent</span>
        <a
          href={NORDIC_ASCENT_LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Linkedin className="h-3.5 w-3.5" />
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
