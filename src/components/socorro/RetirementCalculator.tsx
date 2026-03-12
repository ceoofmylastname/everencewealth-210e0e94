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

  const formatCurrency = (n: number) => "$" + n.toLocaleString("en-US");

  return (
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden" style={{ background: "#0D1F1A" }}>
      <FloatingOrbs variant="dark" />

      <div className="relative z-10 max-w-[720px] mx-auto">
        <ScrollReveal>
          <span
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              color: "#C8A96E",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Fee Calculator
          </span>
          <ShimmerHeadline as="h2" variant="light" className="mt-3 mb-3 text-[clamp(28px,4vw,42px)]">
            See What Hidden Fees Could Cost You
          </ShimmerHeadline>
          <p
            className="mb-10"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "16px",
              color: "rgba(240,242,241,0.6)",
            }}
          >
            Enter your current 401(k) balance and see the impact over time.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <GlassCard className="p-8 sm:p-10">
            {/* Balance */}
            <div className="mb-8">
              <label className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#F0F2F1",
                  }}
                >
                  Current Retirement Balance
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#C8A96E",
                  }}
                >
                  {formatCurrency(balance)}
                </span>
              </label>
              <Slider
                value={[balance]}
                onValueChange={([v]) => setBalance(v)}
                min={50000}
                max={1000000}
                step={10000}
                className="w-full"
              />
            </div>

            {/* Fee rate */}
            <div className="mb-8">
              <label className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#F0F2F1",
                  }}
                >
                  Annual Fee Rate
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#C8A96E",
                  }}
                >
                  {feeRate.toFixed(1)}%
                </span>
              </label>
              <Slider
                value={[feeRate]}
                onValueChange={([v]) => setFeeRate(v)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Years */}
            <div className="mb-10">
              <label className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#F0F2F1",
                  }}
                >
                  Years to Retirement
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#C8A96E",
                  }}
                >
                  {years}
                </span>
              </label>
              <Slider
                value={[years]}
                onValueChange={([v]) => setYears(v)}
                min={10}
                max={35}
                step={1}
                className="w-full"
              />
            </div>

            {/* Result */}
            <div
              className="p-6 text-center"
              style={{
                background: "rgba(26, 77, 62, 0.4)",
                borderRadius: "var(--socorro-radius-card)",
                border: "1px solid rgba(200, 169, 110, 0.15)",
              }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "8px",
                }}
              >
                Estimated fee drag over {years} years:
              </p>
              <p
                className="socorro-shimmer-text-light"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "48px",
                  fontWeight: 700,
                }}
              >
                {formatCurrency(feeDrag)}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "8px",
                }}
              >
                That's money that could stay in your pocket.
              </p>
            </div>
          </GlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-10 text-center">
            <p
              className="mb-5"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "15px",
                color: "rgba(240,242,241,0.6)",
              }}
            >
              Want to see what you could do with that money instead?
            </p>
            <GoldCTA href="/socorro-isd/advisors">
              Reserve Your Spot at the Workshop &rarr;
            </GoldCTA>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
