import { usePublicStats } from "@/hooks/useData";
import { Loader2 } from "lucide-react";

export default function StatsBar() {
  const { data: stats, isLoading } = usePublicStats();

  const displayStats = [
    { value: String(stats?.candidates ?? 0), label: "Candidates on Platform" },
    { value: String(stats?.companies ?? 0), label: "Partner Companies" },
    { value: String(stats?.openJobs ?? 0), label: "Open Roles" },
    { value: "4", label: "Nordic Countries" },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2 transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70 tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
