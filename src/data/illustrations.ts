import { BarChart3, type LucideIcon } from "lucide-react";

export type IllustrationKey = "indexing_backtest";

export interface IllustrationCard {
  id: string;
  key: IllustrationKey;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: LucideIcon;
}

export const ILLUSTRATIONS: IllustrationCard[] = [
  {
    id: "illustration-indexing-backtest",
    key: "indexing_backtest",
    title: "Indexing Strategy: 27-Year Backtest",
    subtitle: "S&P 500 1999 to 2025",
    description:
      "Visual proof that capped upside with zero floor outperformed uncapped market exposure over 27 years.",
    badge: "Illustration",
    icon: BarChart3,
  },
];