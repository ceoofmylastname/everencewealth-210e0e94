import { motion } from "framer-motion";

const cards = [
  { icon: "🔒", question: "Is your current retirement account actually protected from market losses?" },
  { icon: "💰", question: "How much are hidden fees silently costing you over 30 years?" },
  { icon: "📊", question: "Are there tax strategies your HR department was never required to tell you about?" },
];

export default function CuriosityCards() {
  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase mb-10" style={{ color: "#C8A96E", letterSpacing: "0.2em", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          WHAT YOU'LL DISCOVER
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-6"
              style={{ borderLeft: "4px solid #1A4D3E", background: "#F7F9F8" }}
            >
              <span className="text-2xl block mb-4">{card.icon}</span>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#1A4D3E", lineHeight: 1.4 }}>
                {card.question}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-sm italic" style={{ color: "#4A5565", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          These aren't trick questions. They're the starting point for every conversation we have.
        </p>
      </div>
    </section>
  );
}
