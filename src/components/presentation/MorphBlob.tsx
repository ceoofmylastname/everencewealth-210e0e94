interface MorphBlobProps {
  size?: number;
  color?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
  opacity?: number;
}

export default function MorphBlob({
  size = 300,
  color = "rgba(200, 169, 110, 0.15)",
  top,
  left,
  right,
  bottom,
  delay = 0,
  opacity = 0.3,
}: MorphBlobProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        background: color,
        borderRadius: "50% 30% 70% 40% / 60% 40% 60% 50%",
        animation: `ag-morphBlob 12s ease-in-out ${delay}s infinite`,
        filter: "blur(40px)",
        opacity,
        top,
        left,
        right,
        bottom,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
