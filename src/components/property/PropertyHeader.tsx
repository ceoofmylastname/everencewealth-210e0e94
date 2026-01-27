import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Maximize, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyHeaderProps {
  title: string;
  location: string;
  province: string;
  price: string;
  reference: string;
  bedrooms?: number;
  bedroomsMax?: number;
  bathrooms?: number;
  bathroomsMax?: number;
  builtArea?: number;
  builtAreaMax?: number;
  developmentName?: string;
  newDevelopment?: boolean;
}

/**
 * Formats a range value for display in badges
 * Examples: "1 - 3", "65 - 138"
 */
const formatRangeBadge = (min?: number, max?: number): string | null => {
  if (min === undefined || min <= 0) return null;
  if (max && max > min) {
    return `${min} - ${max}`;
  }
  return `${min}`;
};

export const PropertyHeader = ({
  title,
  location,
  province,
  price,
  reference,
  bedrooms,
  bedroomsMax,
  bathrooms,
  bathroomsMax,
  builtArea,
  builtAreaMax,
  developmentName,
  newDevelopment,
}: PropertyHeaderProps) => {
  const bedroomDisplay = formatRangeBadge(bedrooms, bedroomsMax);
  const bathroomDisplay = formatRangeBadge(bathrooms, bathroomsMax);
  const builtDisplay = formatRangeBadge(builtArea, builtAreaMax);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8">
        {/* Left side - Property info */}
        <div className="flex-1 space-y-3">
          {/* Development Name Badge (for new developments) */}
          {developmentName && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <Badge variant="default" className="gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground">
                <Building2 className="w-4 h-4" />
                {developmentName}
              </Badge>
              {newDevelopment && (
                <Badge variant="secondary" className="text-xs">
                  New Development
                </Badge>
              )}
            </motion.div>
          )}

          {/* Location badge */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
              <MapPin className="w-4 h-4 text-primary ml-3" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {location}, {province}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">
            {title}
          </h1>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {bedroomDisplay && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium">
                <Bed className="w-4 h-4" />
                {bedroomDisplay} {bedroomsMax && bedroomsMax > (bedrooms || 0) ? 'Beds' : (bedrooms === 1 ? 'Bed' : 'Beds')}
              </Badge>
            )}
            {bathroomDisplay && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium">
                <Bath className="w-4 h-4" />
                {bathroomDisplay} {bathroomsMax && bathroomsMax > (bathrooms || 0) ? 'Baths' : (bathrooms === 1 ? 'Bath' : 'Baths')}
              </Badge>
            )}
            {builtDisplay && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium">
                <Maximize className="w-4 h-4" />
                {builtDisplay} m²
              </Badge>
            )}
          </div>
        </div>

        {/* Right side - Price and reference */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-start lg:items-end gap-1"
        >
          <div className="glass-luxury rounded-2xl px-5 py-3 md:px-6 md:py-4">
            <p className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary">
              {price}
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono tracking-wide px-2">
            Ref: {reference}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};