import SocorroNavbar from "@/components/socorro/SocorroNavbar";
import SocorroHero from "@/components/socorro/SocorroHero";
import SocialProof from "@/components/socorro/SocialProof";
import CuriosityCards from "@/components/socorro/CuriosityCards";
import HowItWorks from "@/components/socorro/HowItWorks";
import RetirementCalculator from "@/components/socorro/RetirementCalculator";
import TrustStrip from "@/components/socorro/TrustStrip";
import SocorroFinalCTA from "@/components/socorro/SocorroFinalCTA";
import SocorroFooter from "@/components/socorro/SocorroFooter";

export default function SocorroLanding() {
  return (
    <main>
      <SocorroNavbar />
      <SocorroHero />
      <SocialProof />
      <CuriosityCards />
      <HowItWorks />
      <RetirementCalculator />
      <TrustStrip />
      <SocorroFinalCTA />
      <SocorroFooter />
    </main>
  );
}
