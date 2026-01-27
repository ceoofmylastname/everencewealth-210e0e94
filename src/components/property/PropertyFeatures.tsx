import { motion } from "framer-motion";
import { 
  Waves, 
  Trees, 
  Car, 
  Compass, 
  Eye, 
  Dumbbell, 
  Wifi, 
  Wind, 
  Sun, 
  Home,
  Shield,
  Flame,
  Droplets,
  Mountain,
  Building,
  Sparkles,
  MapPin,
  ChefHat,
  Thermometer,
  Check
} from "lucide-react";

interface PropertyFeaturesProps {
  features: string[];
  pool?: string;
  garden?: string;
  parking?: string;
  orientation?: string;
  views?: string;
  featureCategories?: Record<string, string[]>;
}

// Map category names to icons
const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes("setting") || lowerCategory.includes("location")) return MapPin;
  if (lowerCategory.includes("pool")) return Waves;
  if (lowerCategory.includes("climate") || lowerCategory.includes("heating") || lowerCategory.includes("cooling")) return Thermometer;
  if (lowerCategory.includes("view")) return Eye;
  if (lowerCategory.includes("kitchen")) return ChefHat;
  if (lowerCategory.includes("garden")) return Trees;
  if (lowerCategory.includes("security")) return Shield;
  if (lowerCategory.includes("parking") || lowerCategory.includes("garage")) return Car;
  if (lowerCategory.includes("feature")) return Home;
  
  return Sparkles;
};

// Map feature keywords to icons (for flat list fallback)
const getFeatureIcon = (feature: string) => {
  const lowerFeature = feature.toLowerCase();
  
  if (lowerFeature.includes("pool") || lowerFeature.includes("piscina")) return Waves;
  if (lowerFeature.includes("garden") || lowerFeature.includes("jardin") || lowerFeature.includes("jardín")) return Trees;
  if (lowerFeature.includes("garage") || lowerFeature.includes("parking") || lowerFeature.includes("garaje")) return Car;
  if (lowerFeature.includes("gym") || lowerFeature.includes("fitness")) return Dumbbell;
  if (lowerFeature.includes("wifi") || lowerFeature.includes("internet")) return Wifi;
  if (lowerFeature.includes("air") || lowerFeature.includes("clima") || lowerFeature.includes("conditioning")) return Wind;
  if (lowerFeature.includes("terrace") || lowerFeature.includes("terraza") || lowerFeature.includes("solarium")) return Sun;
  if (lowerFeature.includes("security") || lowerFeature.includes("seguridad") || lowerFeature.includes("alarm")) return Shield;
  if (lowerFeature.includes("fireplace") || lowerFeature.includes("chimenea")) return Flame;
  if (lowerFeature.includes("jacuzzi") || lowerFeature.includes("spa") || lowerFeature.includes("sauna")) return Droplets;
  if (lowerFeature.includes("mountain") || lowerFeature.includes("montaña")) return Mountain;
  if (lowerFeature.includes("sea") || lowerFeature.includes("beach") || lowerFeature.includes("mar") || lowerFeature.includes("playa")) return Eye;
  if (lowerFeature.includes("lift") || lowerFeature.includes("elevator") || lowerFeature.includes("ascensor")) return Building;
  if (lowerFeature.includes("luxury") || lowerFeature.includes("premium")) return Sparkles;
  
  return Home;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export const PropertyFeatures = ({
  features,
  pool,
  garden,
  parking,
  orientation,
  views,
  featureCategories,
}: PropertyFeaturesProps) => {
  // Check if we have grouped features from API
  const hasGroupedFeatures = featureCategories && Object.keys(featureCategories).length > 0;
  
  // Combine all features for flat display
  const allFeatures: { name: string; value?: string }[] = [
    ...(pool ? [{ name: "Pool", value: pool }] : []),
    ...(garden ? [{ name: "Garden", value: garden }] : []),
    ...(parking ? [{ name: "Parking", value: parking }] : []),
    ...(orientation ? [{ name: "Orientation", value: orientation }] : []),
    ...(views ? [{ name: "Views", value: views }] : []),
    ...features.map(f => ({ name: f })),
  ];

  if (!hasGroupedFeatures && allFeatures.length === 0) return null;

  // Render grouped features (Resales Online format)
  if (hasGroupedFeatures) {
    return (
      <section className="py-8 md:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground accent-line-gold">
            Property Features
          </h2>
          <p className="text-muted-foreground mt-2 md:mt-4 text-sm md:text-lg">
            Discover the exceptional amenities this property has to offer
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {Object.entries(featureCategories!).map(([category, items], index) => {
            const IconComponent = getCategoryIcon(category);
            
            return (
              <motion.div
                key={category}
                variants={itemVariants}
                className="glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg capitalize">{category}</h3>
                </div>
                
                {/* Feature Items */}
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Also show amenities if we have them */}
        {allFeatures.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mt-6"
          >
            {allFeatures.map((feature, index) => {
              const IconComponent = getFeatureIcon(feature.name);
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="glass-luxury rounded-xl p-3 flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{feature.name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    );
  }

  // Fallback: Render flat list (existing behavior)
  return (
    <section className="py-8 md:py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-6 md:mb-10"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground accent-line-gold">
          Property Features
        </h2>
        <p className="text-muted-foreground mt-2 md:mt-4 text-sm md:text-lg">
          Discover the exceptional amenities this property has to offer
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
      >
        {allFeatures.map((feature, index) => {
          const IconComponent = getFeatureIcon(feature.name);
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative glass-luxury rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 overflow-hidden card-3d cursor-default touch-manipulation active:scale-[0.98]"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors truncate">
                    {feature.name}
                  </h3>
                  {feature.value && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 capitalize truncate">
                      {feature.value}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};
