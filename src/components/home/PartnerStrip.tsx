const PARTNERS = [
  "GCE NODE",
  "UiT",
  "Bangalore university partners",
  "Relocation Agder",
];

export default function PartnerStrip() {
  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-6">
          Working with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PARTNERS.map((name) => (
            <span
              key={name}
              className="text-sm sm:text-base font-medium text-primary/70 tracking-wide"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
