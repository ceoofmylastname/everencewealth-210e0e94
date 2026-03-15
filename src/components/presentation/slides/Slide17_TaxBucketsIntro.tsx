import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import bucketOrdinary from "@/assets/bucket-ordinary-income.png";
import bucketCapital from "@/assets/bucket-capital-gains.png";
import bucketTaxFree from "@/assets/bucket-tax-free.png";

const buckets = [
  {
    title: "ORDINARY INCOME",
    image: bucketOrdinary,
    items: ["401(k)", "403(b)", "457 Plan", "Pension"],
    labelBg: "linear-gradient(135deg, #C8A96E, #A8884E)",
    cardBg: "rgba(245, 230, 200, 0.5)",
    borderColor: "rgba(200, 169, 110, 0.3)",
    glowColor: "rgba(200, 169, 110, 0.15)",
  },
  {
    title: "CAPITAL GAINS",
    image: bucketCapital,
    items: ["Brokerage Account", "Bonds", "Stocks", "ETFs", "Crypto"],
    labelBg: "linear-gradient(135deg, #E8D44D, #C8B82E)",
    cardBg: "rgba(255, 248, 235, 0.6)",
    borderColor: "rgba(232, 212, 77, 0.3)",
    glowColor: "rgba(232, 212, 77, 0.15)",
  },
  {
    title: "TAX FREE",
    image: bucketTaxFree,
    items: ["Roth IRA", "SERP"],
    labelBg: "linear-gradient(135deg, #1A4D3E, #2A6B55)",
    labelColor: "#fff",
    cardBg: "rgba(26, 77, 62, 0.06)",
    borderColor: "rgba(26, 77, 62, 0.2)",
    glowColor: "rgba(26, 77, 62, 0.1)",
  },
];

export default function Slide17_TaxBucketsIntro() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-10">
          <h2
            className="text-4xl md:text-5xl font-bold"
            style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
          >
            Tax <GoldUnderline><GradientText>Categories</GradientText></GoldUnderline>
          </h2>
          <p className="text-lg mt-3" style={{ color: "#4A5565" }}>
            The three different ways your money is taxed and how it can impact you
          </p>
        </RevealElement>

        {/* Bucket Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {buckets.map((bucket, i) => (
            <RevealElement
              key={bucket.title}
              index={i === 2 ? 3 : 2}
              direction={i === 2 ? "explode" : "cardRise"}
            >
              <div
                className="relative flex flex-col items-center text-center rounded-2xl p-6 pt-2 transition-all duration-300 group"
                style={{
                  background: bucket.cardBg,
                  border: `1px solid ${bucket.borderColor}`,
                  backdropFilter: "blur(16px)",
                  boxShadow: `0 8px 32px -8px ${bucket.glowColor}, 0 2px 8px -2px rgba(0,0,0,0.06)`,
                }}
              >
                {/* Hover 3D lift */}
                <style>{`
                  .bucket-card-${i}:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 16px 48px -12px ${bucket.glowColor}, 0 4px 16px -4px rgba(0,0,0,0.1) !important;
                  }
                `}</style>
                <div className={`bucket-card-${i} contents`} />

                {/* Bucket Image */}
                <div className="relative w-36 h-36 mb-4 flex-shrink-0">
                  <img
                    src={bucket.image}
                    alt={`${bucket.title} bucket`}
                    className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Subtle glow behind bucket */}
                  <div
                    className="absolute inset-0 rounded-full blur-2xl -z-10 opacity-40"
                    style={{ background: bucket.glowColor }}
                  />
                </div>

                {/* Title Label */}
                <div
                  className="px-5 py-2 rounded-lg mb-4 font-bold text-sm tracking-wider"
                  style={{
                    background: bucket.labelBg,
                    color: bucket.labelColor || "#1A4D3E",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  {bucket.title}
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-1.5">
                  {bucket.items.map((item) => (
                    <span
                      key={item}
                      className="text-sm font-medium"
                      style={{ color: "#4A5565" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
