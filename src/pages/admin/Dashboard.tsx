import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/PageSpinner";
import {
  GraduationCap,
  ClipboardCheck,
  Rocket,
  UserCheck,
  UsersRound,
  MapPin,
  Building2,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { useAdminJourneyStats } from "@/hooks/useData";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminJourneyStats();

  if (isLoading) {
    return <PageSpinner />;
  }

  const journeyCards = [
    {
      title: "Universities",
      count: stats?.waitlistPending ?? 0,
      label: "waitlist pending",
      href: "/admin/universities",
      icon: GraduationCap,
    },
    {
      title: "Selection",
      count: stats?.eligibilityPending ?? 0,
      label: "awaiting eligibility review",
      href: "/admin/selection?step=1",
      icon: UserCheck,
    },
    {
      title: "Readiness",
      count: stats?.readinessNeedsReview ?? 0,
      label: "evaluations needed",
      href: "/admin/readiness",
      icon: ClipboardCheck,
    },
    {
      title: "Mentoring",
      count: (stats?.mentorAssignmentPending ?? 0) + (stats?.mentoringPipeline ?? 0),
      label: "mentor assign + programme",
      href: "/admin/mentoring",
      icon: UsersRound,
    },
    {
      title: "Activation",
      count: stats?.activationActive ?? 0,
      label: "internship / pre-arrival",
      href: "/admin/activation",
      icon: Rocket,
    },
    {
      title: "Relocation",
      count: stats?.relocationActive ?? 0,
      label: "in relocation",
      href: "/admin/relocation",
      icon: MapPin,
    },
    {
      title: "Onboarding",
      count: stats?.onboardingActive ?? 0,
      label: "in onboarding",
      href: "/admin/onboarding",
      icon: Building2,
    },
    {
      title: "Follow-up",
      count: stats?.followupActive ?? 0,
      label: "in follow-up period",
      href: "/admin/followup",
      icon: HeartHandshake,
    },
  ];

  const quickLinks = [
    { label: "Open eligibility queue", href: "/admin/selection?step=1" },
    { label: "Assign mentors", href: "/admin/mentoring" },
    { label: "Review readiness", href: "/admin/readiness" },
    { label: "Browse candidates", href: "/admin/candidates" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Universities → Selection → Readiness → Mentoring → Activation → Relocation → Onboarding →
          Follow-up
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {journeyCards.map((card) => (
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

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
            >
              <span>{link.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
