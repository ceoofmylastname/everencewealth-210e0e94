import { useSearchParams } from "react-router-dom";
import SocorroNavbar from "@/components/socorro/SocorroNavbar";
import SocorroFooter from "@/components/socorro/SocorroFooter";
import FloatingOrbs from "@/components/socorro/primitives/FloatingOrbs";
import GoldCTA from "@/components/socorro/primitives/GoldCTA";
import ConfirmationBlock from "@/components/socorro/ConfirmationBlock";

export default function SocorroBookingSuccess() {
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name") || "there";
  const advisorName = searchParams.get("advisor") || "Your Advisor";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  return (
    <main style={{ background: "#F7F9F8", minHeight: "100vh" }}>
      <SocorroNavbar />

      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <FloatingOrbs variant="light" />
        <div className="relative z-10">
          <ConfirmationBlock
            name={name}
            advisorName={advisorName}
            date={date}
            time={time}
          />

          <div className="mt-10 text-center">
            <GoldCTA href="/socorro-isd" size="sm">
              Back to Socorro ISD Home
            </GoldCTA>
          </div>
        </div>
      </section>

      <SocorroFooter />
    </main>
  );
}
