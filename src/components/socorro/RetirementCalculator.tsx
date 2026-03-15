import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import FloatingOrbs from "./primitives/FloatingOrbs";
import ScrollReveal from "./primitives/ScrollReveal";
import GlassCard from "./primitives/GlassCard";
import GoldCTA from "./primitives/GoldCTA";
import ShimmerHeadline from "./primitives/ShimmerHeadline";

export default function RetirementCalculator() {
  const [balance, setBalance] = useState(200000);
  const [feeRate, setFeeRate] = useState(1.5);
  const [years, setYears] = useState(25);

  const marketReturn = 0.07;
  const withFees = balance * Math.pow(1 + (marketReturn - feeRate / 100), years);
  const withoutFees = balance * Math.pow(1 + marketReturn, years);
  const feeDrag = Math.round(withoutFees - withFees);
  const maxVal = Math.max(withoutFees, 1);

  const formatCurrency = (n: number) => "$" + n.toLocaleString("en-US");

  const sliderLabelStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    color: "#F0F2F1",
  };

  const sliderValueStyle: React.CSSProperties = {
    fontFamily: "'Clash Display', system-ui, sans-serif",
    fontSize: "18px",
    fontWeight: 700,
    color: "#C8A96E",
  };

  return (
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden" style={{ background: "#0D1F1A" }}>
      <FloatingOrbs variant="dark" />

      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          {/* Left — Section text */}
          <ScrollReveal>
            <div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#C8A96E",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                Fee Calculator
              </span>
              <ShimmerHeadline as="h2" variant="light" className="mt-3 mb-4 text-[clamp(28px,4vw,42px)]">
                Remember This Number?
              </ShimmerHeadline>
              <p
                className="mb-6"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "16px",
                  color: "rgba(240,242,241,0.55)",
                  lineHeight: 1.7,
                  maxWidth: "400px",
                }}
              >
                You saw it at the workshop. Now plug in your own numbers and see the real impact of hidden fees.
              </p>
              <p
                className="mb-8"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "15px",
                  color: "rgba(240,242,241,0.5)",
                }}
              >
                Ready to stop losing money to fees?
              </p>
              <GoldCTA href="/socorro-isd/advisors">
                Book Your Discovery Call &rarr;
              </GoldCTA>
            </div>
          </ScrollReveal>

          {/* Right — Calculator */}
          <ScrollReveal delay={0.15}>
            <GlassCard className="p-8 sm:p-10">
              {/* Balance */}
              <div className="mb-7">
                <label className="flex items-center justify-between mb-3">
                  <span style={sliderLabelStyle}>Current Balance</span>
                  <span style={sliderValueStyle}>{formatCurrency(balance)}</span>
                </label>
                <div className="socorro-slider">
                  <Slider value={[balance]} onValueChange={([v]) => setBalance(v)} min={50000} max={1000000} step={10000} className="w-full" />
                </div>
              </div>

              {/* Fee rate */}
              <div className="mb-7">
                <label className="flex items-center justify-between mb-3">
                  <span style={sliderLabelStyle}>Annual Fee Rate</span>
                  <span style={sliderValueStyle}>{feeRate.toFixed(1)}%</span>
                </label>
                <div className="socorro-slider">
                  <Slider value={[feeRate]} onValueChange={([v]) => setFeeRate(v)} min={0.5} max={3} step={0.1} className="w-full" />
                </div>
              </div>

              {/* Years */}
              <div className="mb-8">
                <label className="flex items-center justify-between mb-3">
                  <span style={sliderLabelStyle}>Years to Retirement</span>
                  <span style={sliderValueStyle}>{years}</span>
                </label>
                <div className="socorro-slider">
                  <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={10} max={35} step={1} className="w-full" />
                </div>
              </div>

              {/* Comparison bars */}
              <div className="mb-6 space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Without fees</span>
                    <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "13px", fontWeight: 600, color: "#C8A96E" }}>{formatCurrency(Math.round(withoutFees))}</span>
                  </div>
                  <div className="socorro-bar" style={{ width: "100%", background: "linear-gradient(90deg, #C8A96E, #E2C896)" }} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>With {feeRate.toFixed(1)}% fees</span>
                    <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{formatCurrency(Math.round(withFees))}</span>
                  </div>
                  <div className="socorro-bar" style={{ width: `${(withFees / maxVal) * 100}%`, background: "linear-gradient(90deg, rgba(200,169,110,0.3), rgba(200,169,110,0.15))" }} />
                </div>
              </div>

              {/* Result */}
              <div
                className="p-6 text-center relative overflow-hidden"
                style={{
                  background: "rgba(26, 77, 62, 0.4)",
                  borderRadius: "16px",
                  border: "1px solid rgba(200, 169, 110, 0.2)",
                  boxShadow: "0 0 30px rgba(200, 169, 110, 0.06)",
                }}
              >
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                  Estimated fee drag over {years} years
                </p>
                <p
                  className="socorro-shimmer-text-light"
                  style={{
                    fontFamily: "'Clash Display', system-ui, sans-serif",
                    fontSize: "44px",
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(feeDrag)}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>
                  That's money that could stay in your pocket.
                </p>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
