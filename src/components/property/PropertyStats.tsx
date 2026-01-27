import { useRef, useEffect, useState } from "react";
import { Bed, Bath, Maximize2, Grid3X3, Compass, Eye, Home, LayoutDashboard, Square } from "lucide-react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

interface PropertyStatsProps {
  bedrooms: number;
  bedroomsMax?: number;
  bathrooms: number;
  bathroomsMax?: number;
  builtArea: number;
  builtAreaMax?: number;
  plotArea?: number;
  plotAreaMax?: number;
  orientation?: string;
  views?: string;
  // Additional sizes for new developments
  interiorSize?: number;
  interiorSizeMax?: number;
  terraceSize?: number;
  terraceSizeMax?: number;
  totalSize?: number;
  totalSizeMax?: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}

const StatItem = ({ icon, value, suffix = "", label, delay }: StatItemProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  const { formattedValue, startAnimation } = useCountUp({
    end: value,
    duration: 1500,
    delay: delay,
    suffix,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            startAnimation();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, startAnimation]);

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="stat-card-premium glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6 text-center group hover:scale-105 active:scale-[0.98] transition-all duration-300 touch-manipulation"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-0.5 md:mb-1">
        {hasStarted ? formattedValue : "0" + suffix}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

interface TextStatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const TextStatItem = ({ icon, value, label, delay }: TextStatItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay / 1000 }}
    className="stat-card-premium glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6 text-center group hover:scale-105 active:scale-[0.98] transition-all duration-300 touch-manipulation"
  >
    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
      {icon}
    </div>
    <div className="text-base sm:text-lg md:text-xl font-display font-bold text-foreground mb-0.5 md:mb-1 capitalize truncate">
      {value}
    </div>
    <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
      {label}
    </div>
  </motion.div>
);

interface RangeStatItemProps {
  icon: React.ReactNode;
  min: number;
  max?: number;
  suffix?: string;
  label: string;
  delay: number;
}

/**
 * Formats a range value exactly like Resales Online
 * Examples: "1 - 3", "65 m² - 138 m²"
 */
const formatRange = (min: number, max?: number, suffix: string = ""): string => {
  if (max && max > min) {
    return `${min} ${suffix} - ${max} ${suffix}`.trim();
  }
  return `${min}${suffix}`;
};

const RangeStatItem = ({ icon, min, max, suffix = "", label, delay }: RangeStatItemProps) => {
  const displayValue = formatRange(min, max, suffix);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="stat-card-premium glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6 text-center group hover:scale-105 active:scale-[0.98] transition-all duration-300 touch-manipulation"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground mb-0.5 md:mb-1">
        {displayValue}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

export const PropertyStats = ({
  bedrooms,
  bedroomsMax,
  bathrooms,
  bathroomsMax,
  builtArea,
  builtAreaMax,
  plotArea,
  plotAreaMax,
  orientation,
  views,
  interiorSize,
  interiorSizeMax,
  terraceSize,
  terraceSizeMax,
  totalSize,
  totalSizeMax,
}: PropertyStatsProps) => {
  // Check if this is a New Development (has range values)
  const hasRanges = bedroomsMax || bathroomsMax || builtAreaMax;

  return (
    <div className="relative mt-6 md:mt-8 z-20 px-3 sm:px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {hasRanges ? (
            <>
              <RangeStatItem
                icon={<Bed className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                min={bedrooms}
                max={bedroomsMax}
                label="Beds"
                delay={0}
              />
              <RangeStatItem
                icon={<Bath className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                min={bathrooms}
                max={bathroomsMax}
                label="Baths"
                delay={100}
              />
              <RangeStatItem
                icon={<Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                min={builtArea}
                max={builtAreaMax}
                suffix="m²"
                label="Built"
                delay={200}
              />
            </>
          ) : (
            <>
              <StatItem
                icon={<Bed className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                value={bedrooms}
                label="Beds"
                delay={0}
              />
              <StatItem
                icon={<Bath className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                value={bathrooms}
                label="Baths"
                delay={100}
              />
              <StatItem
                icon={<Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                value={builtArea}
                suffix="m²"
                label="Built"
                delay={200}
              />
            </>
          )}
          
          {/* Plot Area */}
          {plotArea !== undefined && plotArea > 0 && (
            hasRanges ? (
              <RangeStatItem
                icon={<Grid3X3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                min={plotArea}
                max={plotAreaMax}
                suffix="m²"
                label="Plot"
                delay={300}
              />
            ) : (
              <StatItem
                icon={<Grid3X3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                value={plotArea}
                suffix="m²"
                label="Plot"
                delay={300}
              />
            )
          )}
          
          {/* Interior Size (New Developments) */}
          {interiorSize !== undefined && interiorSize > 0 && (
            <RangeStatItem
              icon={<Home className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
              min={interiorSize}
              max={interiorSizeMax}
              suffix="m²"
              label="Interior"
              delay={350}
            />
          )}
          
          {/* Terrace Size (New Developments) */}
          {terraceSize !== undefined && terraceSize > 0 && (
            <RangeStatItem
              icon={<Square className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
              min={terraceSize}
              max={terraceSizeMax}
              suffix="m²"
              label="Terrace"
              delay={400}
            />
          )}
          
          {/* Total Size (New Developments) */}
          {totalSize !== undefined && totalSize > 0 && (
            <RangeStatItem
              icon={<LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
              min={totalSize}
              max={totalSizeMax}
              suffix="m²"
              label="Total"
              delay={450}
            />
          )}
          
          {/* Orientation */}
          {orientation && (
            <TextStatItem
              icon={<Compass className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
              value={orientation}
              label="Facing"
              delay={500}
            />
          )}
          
          {/* Views */}
          {views && (
            <TextStatItem
              icon={<Eye className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
              value={views}
              label="Views"
              delay={550}
            />
          )}
        </div>
      </div>
    </div>
  );
};