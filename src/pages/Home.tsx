import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import Differentiators from "@/components/home/Differentiators";
import AudienceCards from "@/components/home/AudienceCards";
import ProcessTeaser from "@/components/home/ProcessTeaser";
import CtaSection from "@/components/home/CtaSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsBar />
      <Differentiators />
      <AudienceCards />
      <ProcessTeaser />
      <CtaSection />
    </div>
  );
}
