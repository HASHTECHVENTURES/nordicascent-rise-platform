import HeroSection from "@/components/home/HeroSection";
import PartnerStrip from "@/components/home/PartnerStrip";
import ProcessTeaser from "@/components/home/ProcessTeaser";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <PartnerStrip />
      <ProcessTeaser />
    </div>
  );
}
