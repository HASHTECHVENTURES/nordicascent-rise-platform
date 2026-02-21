import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import Differentiators from "@/components/home/Differentiators";
import CtaSection from "@/components/home/CtaSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsBar />
      <Differentiators />
      <CtaSection />
    </div>
  );
}
