const stats = [
  { value: "500+", label: "Engineers Placed" },
  { value: "50+", label: "Nordic Companies" },
  { value: "95%", label: "Retention Rate" },
  { value: "4", label: "Nordic Countries" },
];

export default function StatsBar() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
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
      </div>
    </section>
  );
}
