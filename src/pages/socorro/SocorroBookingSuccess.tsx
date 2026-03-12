import { useSearchParams, Link } from "react-router-dom";
import ConfirmationBlock from "@/components/socorro/ConfirmationBlock";

export default function SocorroBookingSuccess() {
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name") || "there";
  const advisorName = searchParams.get("advisor") || "Your Advisor";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16"
      style={{ background: "#F7F9F8" }}
    >
      <ConfirmationBlock
        name={name}
        advisorName={advisorName}
        date={date}
        time={time}
      />

      <Link
        to="/socorro-isd"
        className="mt-10 inline-block transition-colors duration-200"
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          color: "#1A4D3E",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        }}
      >
        Back to Socorro ISD Home
      </Link>
    </main>
  );
}
