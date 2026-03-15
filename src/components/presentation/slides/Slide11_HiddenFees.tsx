import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";

const feeData = [
  { year: 1, noFee: "$3,888", fee095: "$3,851", fee2: "$3,810", fee3: "$3,771" },
  { year: 10, noFee: "$56,312", fee095: "$53,143", fee2: "$49,846", fee3: "$46,908" },
  { year: 20, noFee: "$177,923", fee095: "$157,429", fee2: "$137,775", fee3: "$121,587" },
  { year: 25, noFee: "$284,236", fee095: "$242,669", fee2: "$204,397", fee3: "$174,153" },
  { year: 30, noFee: "$440,445", fee095: "$362,077", fee2: "$292,881", fee3: "$240,479" },
  { year: 35, noFee: "$669,968", fee095: "$529,350", fee2: "$410,402", fee3: "$324,167", bold: true },
];

const costs = [
  { label: "0.95% Fee", value: "$140,618" },
  { label: "2% Fee", value: "$259,566" },
  { label: "3% Fee", value: "$345,801", highlight: true },
];

export default function Slide11_HiddenFees() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="mb-2">
          <h2 className="text-3xl font-bold" style={{ color: "#4A5565", fontFamily: "var(--font-display)" }}>
            Hidden Fees inside
          </h2>
          <h2 className="text-3xl font-bold">
            <GoldUnderline><GradientText>Retirement Plans</GradientText></GoldUnderline>
          </h2>
          <p className="text-sm mt-2" style={{ color: "#4A5565" }}>
            $3,600 annual contribution, 8% compounded, 35 years
          </p>
        </RevealElement>

        {/* Reveal 2: Fee Table */}
        <RevealElement index={2} direction="cardRise" className="mb-4">
          <div
            className="overflow-x-auto rounded-2xl p-1"
            style={{
              background: "rgba(255, 255, 255, 0.35)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.45)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            }}
          >
            <table className="antigravity-fee-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>No Fee</th>
                  <th>0.95% Fee</th>
                  <th>2% Fee</th>
                  <th>3% Fee</th>
                </tr>
              </thead>
              <tbody>
                {feeData.map((row, i) => (
                  <tr
                    key={i}
                    style={row.bold ? { fontWeight: 700, background: "rgba(245, 230, 200, 0.5)" } : {}}
                  >
                    <td>{row.year}</td>
                    <td>{row.noFee}</td>
                    <td>{row.fee095}</td>
                    <td>{row.fee2}</td>
                    <td>{row.fee3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealElement>

        {/* Reveal 3: Cost of Plan row */}
        <RevealElement index={3} direction="explode" className="mb-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {costs.map((cost, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  background: cost.highlight ? "rgba(200, 169, 110, 0.85)" : "rgba(245, 230, 200, 0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  color: cost.highlight ? "white" : "#1A4D3E",
                }}
              >
                <div className="text-xs">{cost.label}</div>
                <div className="text-lg font-bold antigravity-stat">{cost.value}</div>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 4: Warning callouts */}
        <RevealElement index={4} direction="whomp">
          <div className="flex flex-col items-center gap-2">
            <div
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{
                background: "rgba(254, 226, 226, 0.6)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(214, 69, 69, 0.15)",
                color: "#D64545",
              }}
            >
              Average 401k fees: <strong>3.1%</strong> — More than HALF your account gone.
            </div>
          </div>
        </RevealElement>

        {/* Reveal 5: Second warning */}
        <RevealElement index={5} direction="whomp" className="mt-2">
          <div className="flex justify-center">
            <div
              className="px-4 py-2 rounded-xl text-sm"
              style={{
                background: "rgba(254, 226, 226, 0.6)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(214, 69, 69, 0.15)",
                color: "#D64545",
              }}
            >
              Average advisor total fees: <strong>3.7%</strong>
            </div>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
