import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface GoldCTAProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  disabled?: boolean;
}

const sizes = {
  sm: "px-5 py-2 text-[13px]",
  md: "px-7 py-3 text-[14px]",
  lg: "px-10 py-4 text-[15px]",
};

export default function GoldCTA({
  children,
  onClick,
  href,
  className = "",
  size = "md",
  type = "button",
  disabled = false,
}: GoldCTAProps) {
  const classes = `socorro-pill-btn ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  if (href) {
    return (
      <motion.div whileTap={disabled ? undefined : { scale: 0.97 }}>
        <Link to={href} className={classes} style={{ textDecoration: "none" }}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={classes}
    >
      {children}
    </motion.button>
  );
}
