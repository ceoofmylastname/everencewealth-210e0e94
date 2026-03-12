interface BookingSummaryBarProps {
  advisorName: string;
  date: string;
  time: string;
}

export default function BookingSummaryBar({ advisorName, date, time }: BookingSummaryBarProps) {
  return (
    <div
      className="sticky top-0 z-20 px-4 sm:px-6 py-3"
      style={{ background: "#1A4D3E", borderBottom: "1px solid rgba(200,169,110,0.2)" }}
    >
      <div className="max-w-[700px] mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            color: "#C8A96E",
          }}
        >
          {advisorName}
        </span>
        <span style={{ color: "rgba(240,242,241,0.3)" }}>|</span>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "13px",
            color: "rgba(240,242,241,0.8)",
          }}
        >
          {date}
        </span>
        <span style={{ color: "rgba(240,242,241,0.3)" }}>|</span>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "13px",
            color: "rgba(240,242,241,0.8)",
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
