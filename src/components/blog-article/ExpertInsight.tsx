import React from "react";

interface ExpertInsightProps {
    insight: string;
}

export const ExpertInsight: React.FC<ExpertInsightProps> = ({ insight }) => {
    if (!insight) return null;

    return (
        <section className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border-l-4 border-primary">
            <h2 className="text-2xl font-serif mb-4">
                Expert Insight from a Wealth Strategist
            </h2>
            <p className="text-lg leading-relaxed">
                {insight}
            </p>
        </section>
    );
};
