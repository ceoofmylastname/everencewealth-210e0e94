import { motion } from "framer-motion";
import { 
  CreditCard, 
  Building2, 
  Leaf, 
  Calendar, 
  FileCheck, 
  Zap, 
  CircleDollarSign,
  Receipt
} from "lucide-react";

interface PropertyCostsProps {
  // Payment terms
  reservationAmount?: number;
  vatPercentage?: number;
  
  // Associated costs
  communityFees?: number;
  ibi?: number;
  garbageTax?: number;
  
  // Construction details
  completionDate?: string;
  buildingLicense?: string;
  
  // Energy certificates
  energyRating?: string;
  co2Rating?: string;
  
  currency?: string;
}

const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PropertyCosts = ({
  reservationAmount,
  vatPercentage,
  communityFees,
  ibi,
  garbageTax,
  completionDate,
  buildingLicense,
  energyRating,
  co2Rating,
  currency = 'EUR',
}: PropertyCostsProps) => {
  // Check if we have any data to display
  const hasPaymentTerms = reservationAmount || vatPercentage;
  const hasCosts = communityFees || ibi || garbageTax;
  const hasConstruction = completionDate || buildingLicense;
  const hasCertificates = energyRating || co2Rating;
  
  if (!hasPaymentTerms && !hasCosts && !hasConstruction && !hasCertificates) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-6 md:mb-10"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground accent-line-gold">
          Costs & Details
        </h2>
        <p className="text-muted-foreground mt-2 md:mt-4 text-sm md:text-lg">
          Payment terms, associated costs, and property certifications
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Payment Terms */}
        {hasPaymentTerms && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Payment Terms</h3>
            </div>
            <div className="space-y-3">
              {reservationAmount !== undefined && reservationAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Reservation</span>
                  <span className="font-medium">{formatCurrency(reservationAmount, currency)}</span>
                </div>
              )}
              {vatPercentage !== undefined && vatPercentage > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IVA (VAT)</span>
                  <span className="font-medium">{vatPercentage}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Associated Costs */}
        {hasCosts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Associated Costs</h3>
            </div>
            <div className="space-y-3">
              {communityFees !== undefined && communityFees > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Community Fees</span>
                  <span className="font-medium">{formatCurrency(communityFees, currency)}/mo</span>
                </div>
              )}
              {ibi !== undefined && ibi > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IBI (Property Tax)</span>
                  <span className="font-medium">{formatCurrency(ibi, currency)}/year</span>
                </div>
              )}
              {garbageTax !== undefined && garbageTax > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Garbage Tax</span>
                  <span className="font-medium">{formatCurrency(garbageTax, currency)}/year</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Construction Details */}
        {hasConstruction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Construction</h3>
            </div>
            <div className="space-y-3">
              {completionDate && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Completion
                  </span>
                  <span className="font-medium">{completionDate}</span>
                </div>
              )}
              {buildingLicense && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    License
                  </span>
                  <span className="font-medium">{buildingLicense}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Energy Certificates */}
        {hasCertificates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-luxury rounded-xl md:rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Energy Certificates</h3>
            </div>
            <div className="space-y-3">
              {energyRating && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Energy Rating
                  </span>
                  <span className="font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {energyRating}
                  </span>
                </div>
              )}
              {co2Rating && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4" />
                    CO₂ Rating
                  </span>
                  <span className="font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {co2Rating}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
