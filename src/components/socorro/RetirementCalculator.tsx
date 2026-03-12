import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

export default function RetirementCalculator() {
  const [balance, setBalance] = useState(200000);
  const [feeRate, setFeeRate] = useState(1.5);
  const [years, setYears] = useState(25);

  const marketReturn = 0.07;
  const withFees = balance * Math.pow(1 + (marketReturn - feeRate / 100), years);
  const withoutFees = balance * Math.pow(1 + marketReturn, years);
  const feeDrag = Math.round(withoutFees - withFees);

  const formatCurrency = (n: number) => "$" + n.toLocaleString("en-US");

  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: "#F7F9F8" }}>
      <div className="max-w-[700px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#1A4D3E", marginBottom: "8px" }}>
            See What Hidden Fees Could Cost You
          </h2>
          <p className="mb-10" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", color: "#4A5565" }}>
            Enter your current 401(k) balance and see the impact over time.
          </p>

          {/* Balance */}
          <div className="mb-8">
            <label className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A4D3E" }}>Current Retirement Balance</span>
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", fontWeight: 700, color: "#C8A96E" }}>{formatCurrency(balance)}</span>
            </label>
            <Slider value={[balance]} onValueChange={([v]) => setBalance(v)} min={50000} max={1000000} step={10000} className="w-full" />
          </div>

          {/* Fee rate */}
          <div className="mb-8">
            <label className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A4D3E" }}>Annual Fee Rate</span>
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", fontWeight: 700, color: "#C8A96E" }}>{feeRate.toFixed(1)}%</span>
            </label>
            <Slider value={[feeRate]} onValueChange={([v]) => setFeeRate(v)} min={0.5} max={3} step={0.1} className="w-full" />
          </div>

          {/* Years */}
          <div className="mb-10">
            <label className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A4D3E" }}>Years to Retirement</span>
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", fontWeight: 700, color: "#C8A96E" }}>{years}</span>
            </label>
            <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={10} max={35} step={1} className="w-full" />
          </div>

          {/* Result */}
          <div className="p-6 text-center" style={{ background: "#1A4D3E", borderRadius: "4px" }}>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>
              Estimated fee drag over {years} years:
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "48px", fontWeight: 700, color: "#C8A96E" }}>
              {formatCurrency(feeDrag)}
            </p>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
              That's money that could stay in your pocket.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "15px", color: "#4A5565" }}>
              Want to see what you could do with that money instead?
            </p>
            <Link
              to="/socorro-isd/advisors"
              className="inline-block transition-colors duration-200"
              style={{ background: "#C8A96E", color: "#1A4D3E", fontWeight: 700, fontSize: "14px", padding: "14px 32px", borderRadius: "4px", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#b8996a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#C8A96E"; }}
            >
              Reserve Your Spot at the Workshop →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
