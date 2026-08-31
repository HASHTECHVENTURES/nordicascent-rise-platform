import PartnerLogos from "@/components/home/PartnerLogos";

export default function PartnerStrip() {
  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-6">
          Working with
        </p>
        <PartnerLogos />
      </div>
    </section>
  );
}
