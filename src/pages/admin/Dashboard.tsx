import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, ClipboardCheck, Heart, Rocket, Loader2 } from "lucide-react";
import { useAdminJourneyStats } from "@/hooks/useData";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminJourneyStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: "Universities",
      count: stats?.waitlistPending ?? 0,
      label: "waitlist pending",
      href: "/admin/universities",
      icon: GraduationCap,
    },
    {
      title: "Readiness",
      count: stats?.readinessNeedsReview ?? 0,
      label: "need review",
      href: "/admin/readiness",
      icon: ClipboardCheck,
    },
    {
      title: "Mentoring",
      count: stats?.mentoringPipeline ?? 0,
      label: "ready · activation locked",
      href: "/admin/mentoring",
      icon: Heart,
    },
    {
      title: "Activation",
      count: stats?.jobsUnlocked ?? 0,
      label: "candidates in activation",
      href: "/admin/activation",
      icon: Rocket,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Universities → Selection → Readiness → Mentoring → Activation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.href}>
            <Card className="hover:border-primary/40 transition-colors h-full">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{card.title}</p>
                  <p className="text-2xl font-bold mt-0.5">{card.count}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
