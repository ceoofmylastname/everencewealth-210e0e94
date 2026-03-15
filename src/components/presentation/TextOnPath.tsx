import { motion } from "framer-motion";

interface TextOnPathProps {
  children: string;
  fontSize?: number;
  color?: string;
  animate?: boolean;
  curve?: "gentle" | "wave" | "circle";
  className?: string;
  width?: number;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
}

const paths: Record<string, string> = {
  gentle: "M 0,50 Q 250,10 500,40 Q 750,70 1000,50",
  wave: "M 0,60 C 166,20 333,80 500,50 C 666,20 833,80 1000,50",
  circle: "M 250,500 A 250,250 0 1,1 250,0 A 250,250 0 1,1 250,500",
};

export default function TextOnPath({
  children,
  fontSize = 48,
  color = "var(--ev-green)",
  animate = true,
  curve = "gentle",
  className = "",
  width = 1000,
  fontWeight = 800,
  fontStyle = "normal",
}: TextOnPathProps) {
  const pathId = `textpath-${curve}-${Math.random().toString(36).slice(2, 8)}`;
  const isCircle = curve === "circle";
  const viewBox = isCircle ? "0 0 500 500" : `0 0 ${width} 100`;
  const svgHeight = isCircle ? 500 : 100;

  return (
    <div className={className} style={{ width: "100%", overflow: "visible" }}>
      <svg
        viewBox={viewBox}
        width="100%"
        height={svgHeight}
        style={{ overflow: "visible" }}
        preserveAspectRatio={isCircle ? "xMidYMid meet" : "xMidYMid meet"}
      >
        <defs>
          <path id={pathId} d={paths[curve]} fill="none" />
        </defs>
        <motion.text
          fill={color}
          fontFamily="var(--font-display)"
          fontWeight={fontWeight}
          fontStyle={fontStyle}
          fontSize={fontSize}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.textPath
            href={`#${pathId}`}
            startOffset={isCircle ? "0%" : "50%"}
            textAnchor={isCircle ? "start" : "middle"}
            initial={animate && isCircle ? { startOffset: "0%" } : undefined}
            animate={animate && isCircle ? { startOffset: "100%" } : undefined}
            transition={isCircle ? { duration: 20, repeat: Infinity, ease: "linear" } : undefined}
          >
            {children}
          </motion.textPath>
        </motion.text>
      </svg>
    </div>
  );
}
