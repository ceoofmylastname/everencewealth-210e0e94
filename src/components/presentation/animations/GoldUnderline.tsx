import { motion } from "framer-motion";

interface GoldUnderlineProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function GoldUnderline({ children, delay = 0.4, className = "" }: GoldUnderlineProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
        style={{
          background: "linear-gradient(90deg, #C8A96E, #E2C896, #C8A96E)",
        }}
        initial={{ scaleX: 0, transformOrigin: "left" }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </span>
  );
}
