import React from "react";
import { DecisionSnapshot as DecisionSnapshotType } from "@/types/blog";
import { Check, AlertTriangle, X } from "lucide-react";

interface DecisionSnapshotProps {
    snapshot: DecisionSnapshotType;
}

export const DecisionSnapshot: React.FC<DecisionSnapshotProps> = ({ snapshot }) => {
    if (!snapshot) return null;

    const { bestSuitedIf, lessSuitableIf, commonMistake, relatedQALink } = snapshot;

    return (
        <section className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-serif mb-6">
                Decision Snapshot: Is This Relevant for You?
            </h2>

            <div className="space-y-6">
                {/* Best Suited If */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Best suited if:</h3>
                    </div>
                    <ul className="list-disc pl-9 space-y-2">
                        {bestSuitedIf.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Less Suitable If */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-semibold">Less suitable if:</h3>
                    </div>
                    <ul className="list-disc pl-9 space-y-2">
                        {lessSuitableIf.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Common Mistake */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <X className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold">Common mistake to avoid:</h3>
                    </div>
                    <div className="pl-9">
                        <p>{commonMistake}</p>
                        {relatedQALink && (
                            <a href={relatedQALink} className="text-primary hover:underline mt-2 inline-block font-medium">
                                Read the full evaluation checklist here →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
