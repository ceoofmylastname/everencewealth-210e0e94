import { motion } from "framer-motion";
import { Mail, Phone, Calendar, MessageCircle, Star, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyContactProps {
  reference: string;
  price: string;
  propertyType: string;
}

export const PropertyContact = ({ reference, price, propertyType }: PropertyContactProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-24 md:top-28 hidden lg:block"
    >
      <div className="card-3d glass-luxury rounded-2xl md:rounded-3xl p-5 md:p-8 overflow-hidden relative">
        {/* Premium Badge */}
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground px-3 md:px-4 py-1 md:py-1.5 text-xs font-semibold uppercase tracking-wider rounded-bl-xl md:rounded-bl-2xl">
            Featured
          </div>
        </div>

        {/* Top Shimmer Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 animate-shimmer" />

        {/* Header */}
        <div className="mb-5 md:mb-6">
          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
            Interested in this property?
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Our luxury real estate experts are ready to assist you
          </p>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-5 md:mb-6">
          <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-primary" />
            Premium
          </div>
          <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Shield className="w-3 h-3 md:w-3.5 md:h-3.5" />
            Verified
          </div>
          <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
            Quick Response
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          <Button 
            className="w-full h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl animate-glow-pulse hover:scale-[1.02] transition-transform"
            size="lg"
          >
            <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
            Send Inquiry
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl border-2 hover:bg-primary/5 hover:border-primary hover:scale-[1.02] transition-all"
            size="lg"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
            Call Now
          </Button>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <Button 
              variant="outline" 
              className="h-10 md:h-12 text-sm font-medium rounded-xl border-2 hover:bg-primary/5 hover:border-primary transition-all"
            >
              <Calendar className="w-4 h-4 mr-1.5 md:mr-2" />
              Schedule
            </Button>
            <Button 
              variant="outline" 
              className="h-10 md:h-12 text-sm font-medium rounded-xl border-2 hover:bg-primary/5 hover:border-primary transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-1.5 md:mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-luxury my-4 md:my-6" />

        {/* Property Quick Info */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-muted-foreground">Property Type</span>
            <span className="font-semibold text-sm md:text-base text-foreground capitalize">{propertyType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-muted-foreground">Price</span>
            <span className="font-bold text-primary text-base md:text-lg">{price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-muted-foreground">Reference</span>
            <span className="font-mono text-xs md:text-sm bg-muted px-2 py-0.5 md:py-1 rounded">{reference}</span>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            🏆 Del Sol Prime Homes — Your trusted partner in luxury Costa del Sol real estate
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Separate Mobile CTA Component
export const PropertyContactMobile = ({ reference, price }: { reference: string; price: string }) => {
  return (
    <div 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-luxury border-t border-border"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {/* Price Display */}
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">Price</span>
          <span className="font-bold text-primary truncate">{price}</span>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-1 gap-2 sm:gap-3">
          <Button className="flex-1 h-12 sm:h-14 font-semibold rounded-xl text-sm sm:text-base touch-manipulation">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Inquire
          </Button>
          <Button variant="outline" className="flex-1 h-12 sm:h-14 font-semibold rounded-xl border-2 text-sm sm:text-base touch-manipulation">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Call
          </Button>
        </div>
      </div>
    </div>
  );
};
