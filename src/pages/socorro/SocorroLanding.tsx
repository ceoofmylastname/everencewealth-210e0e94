import SocorroHero from "@/components/socorro/SocorroHero";
import CuriosityCards from "@/components/socorro/CuriosityCards";
import RetirementCalculator from "@/components/socorro/RetirementCalculator";
import TrustStrip from "@/components/socorro/TrustStrip";
import SocorroFinalCTA from "@/components/socorro/SocorroFinalCTA";

export default function SocorroLanding() {
  return (
    <main>
      <SocorroHero />
      <CuriosityCards />
      <RetirementCalculator />
      <TrustStrip />
      <SocorroFinalCTA />
    </main>
  );
}
