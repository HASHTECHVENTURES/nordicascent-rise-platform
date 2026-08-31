import { cn } from "@/lib/utils";
import { PARTNERS } from "@/lib/partners";

type PartnerLogosProps = {
  className?: string;
  logoClassName?: string;
};

export default function PartnerLogos({ className, logoClassName }: PartnerLogosProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-8 sm:gap-12", className)}>
      {PARTNERS.map((partner) => (
        <a
          key={partner.name}
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group flex items-center justify-center transition-opacity hover:opacity-80",
            partner.darkBg && "rounded-md bg-foreground px-4 py-3"
          )}
          aria-label={partner.name}
        >
          <img
            src={partner.logoSrc}
            alt={partner.name}
            className={cn("h-8 w-auto max-w-[160px] object-contain sm:h-9", logoClassName)}
          />
        </a>
      ))}
    </div>
  );
}
