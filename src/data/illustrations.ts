import { BarChart3, History, type LucideIcon } from "lucide-react";

export type IllustrationKey = "indexing_backtest" | "tax_history";

export interface IllustrationCard {
  id: string;
  key: IllustrationKey;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  /** Optional in-app route. When set, clicking the card navigates here instead of opening a modal. */
  route?: string;
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
  {
    id: "illustration-tax-history",
    key: "tax_history",
    title: "US Tax History (1913–Today)",
    subtitle: "Top marginal rates over a century",
    description:
      "See how top federal tax rates have shifted from 1913 to today — context for every tax-planning conversation.",
    badge: "Reference",
    icon: History,
    route: "/portal/advisor/tools/tax-history",
  },
];