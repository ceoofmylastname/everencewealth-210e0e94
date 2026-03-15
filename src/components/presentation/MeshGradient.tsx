interface MeshGradientProps {
  variant?: "warm" | "cool" | "gold";
  opacity?: number;
}

const gradients: Record<string, string> = {
  warm: [
    "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(200,169,110,0.12) 0%, transparent 70%)",
    "radial-gradient(ellipse 60% 80% at 80% 70%, rgba(245,230,200,0.10) 0%, transparent 70%)",
    "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(26,77,62,0.04) 0%, transparent 70%)",
  ].join(", "),
  cool: [
    "radial-gradient(ellipse 70% 60% at 25% 40%, rgba(26,77,62,0.08) 0%, transparent 70%)",
    "radial-gradient(ellipse 60% 70% at 75% 60%, rgba(99,110,114,0.06) 0%, transparent 70%)",
    "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(200,169,110,0.06) 0%, transparent 70%)",
  ].join(", "),
  gold: [
    "radial-gradient(ellipse 80% 70% at 30% 40%, rgba(200,169,110,0.18) 0%, transparent 60%)",
    "radial-gradient(ellipse 60% 80% at 70% 60%, rgba(139,105,20,0.10) 0%, transparent 60%)",
    "conic-gradient(from 180deg at 50% 50%, rgba(245,230,200,0.08) 0deg, transparent 120deg, rgba(200,169,110,0.06) 240deg, transparent 360deg)",
  ].join(", "),
};

export default function MeshGradient({ variant = "warm", opacity = 1 }: MeshGradientProps) {
  return (
    <>
      {/* Base mesh layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradients[variant],
          backgroundSize: "200% 200%, 200% 200%, 200% 200%",
          animation: "ag-meshDrift 30s ease infinite",
          opacity,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Frosted overlay for smoothness */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          background: `rgba(250, 250, 248, ${0.5 * opacity})`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
