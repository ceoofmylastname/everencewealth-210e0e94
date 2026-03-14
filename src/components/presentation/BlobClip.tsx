import { motion } from "framer-motion";
import type { CSSProperties } from "react";

/** Organic blob shapes for clipping images */
const BLOB_PATHS = [
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "40% 60% 60% 40% / 50% 60% 40% 50%",
  "50% 50% 40% 60% / 40% 60% 50% 50%",
];

interface BlobClipProps {
  /** Gradient background (since we use placeholders) */
  gradient?: string;
  /** Descriptive label for the image placeholder */
  label?: string;
  /** Image source URL or import */
  imageSrc?: string;
  /** Alt text for image */
  imageAlt?: string;
  /** Width of the blob container */
  width?: string | number;
  /** Height of the blob container */
  height?: string | number;
  /** Which blob shape to use (0-3) */
  variant?: number;
  /** Additional className */
  className?: string;
  /** Additional style for the image */
  imageStyle?: CSSProperties;
  /** Additional style */
  style?: CSSProperties;
}

export default function BlobClip({
  gradient = "linear-gradient(135deg, #1A4D3E 0%, #C8A96E 100%)",
  label,
  imageSrc,
  imageAlt = "",
  width = "100%",
  height = "400px",
  variant = 0,
  className,
  imageStyle,
  style,
}: BlobClipProps) {
  const shape = BLOB_PATHS[variant % BLOB_PATHS.length];

  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        borderRadius: shape,
        background: gradient,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      animate={{
        borderRadius: [
          BLOB_PATHS[variant % BLOB_PATHS.length],
          BLOB_PATHS[(variant + 1) % BLOB_PATHS.length],
          BLOB_PATHS[(variant + 2) % BLOB_PATHS.length],
          BLOB_PATHS[variant % BLOB_PATHS.length],
        ],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={imageAlt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : label ? (
        <span className="text-white/40 text-sm font-medium text-center px-4">
          {label}
        </span>
      ) : null}
    </motion.div>
  );
}
