import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const QR_CODES: Record<string, { label: string; url: string }> = {
  socorro: {
    label: "Socorro",
    url: "https://link.everencewealth.com/qr/x0UKirG-340V",
  },
};

export default function PresentationQR() {
  const { location } = useParams<{ location: string }>();
  const navigate = useNavigate();
  const config = location ? QR_CODES[location] : null;

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0D1F1A] flex items-center justify-center text-white">
        <p>Unknown location.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1F1A] flex flex-col items-center justify-center gap-8 p-8">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1
        className="text-3xl font-bold tracking-wider"
        style={{ color: "#C8A96E", fontFamily: "var(--font-display)" }}
      >
        {config.label}
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow-2xl">
        <img
          src={config.url}
          alt={`QR Code for ${config.label}`}
          className="w-72 h-72 object-contain"
        />
      </div>

      <p className="text-white/40 text-xs">Scan to access booking link</p>
    </div>
  );
}
