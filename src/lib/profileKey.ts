export const PROFILE_KEY_TRAITS = [
  { key: "trait_age_25_plus", num: 1, short: "25+", label: "25+ yrs" },
  { key: "trait_married", num: 2, short: "Married", label: "Married" },
  { key: "trait_children", num: 3, short: "Children", label: "Children" },
  { key: "trait_homeowner", num: 4, short: "Homeowner", label: "Homeowner" },
  { key: "trait_income", num: 5, short: "Income", label: "Income" },
  { key: "trait_ambitious", num: 6, short: "Ambitious", label: "Ambitious" },
  { key: "trait_dissatisfied", num: 7, short: "Dissat.", label: "Dissatisfied" },
  { key: "trait_entrepreneur", num: 8, short: "Entrep.", label: "Entrepreneur" },
] as const;

export type ProfileTraitKey = (typeof PROFILE_KEY_TRAITS)[number]["key"];

export type ProfileStatus = "response" | "associate" | "client" | null;

export const STATUS_OPTIONS: { code: Exclude<ProfileStatus, null>; letter: "R" | "A" | "C"; label: string }[] = [
  { code: "response", letter: "R", label: "Response" },
  { code: "associate", letter: "A", label: "Associate" },
  { code: "client", letter: "C", label: "Client" },
];

export interface ProfileKeyRow {
  contact_id: string;
  advisor_id: string;
  trait_age_25_plus: boolean;
  trait_married: boolean;
  trait_children: boolean;
  trait_homeowner: boolean;
  trait_income: boolean;
  trait_ambitious: boolean;
  trait_dissatisfied: boolean;
  trait_entrepreneur: boolean;
  status_code: ProfileStatus;
  score: number;
}

export const EMPTY_PROFILE_KEY = (
  contactId: string,
  advisorId: string
): ProfileKeyRow => ({
  contact_id: contactId,
  advisor_id: advisorId,
  trait_age_25_plus: false,
  trait_married: false,
  trait_children: false,
  trait_homeowner: false,
  trait_income: false,
  trait_ambitious: false,
  trait_dissatisfied: false,
  trait_entrepreneur: false,
  status_code: null,
  score: 0,
});

export function scoreColorVar(score: number): string {
  const s = Math.max(0, Math.min(8, score));
  return `var(--profile-key-${s})`;
}

export function scoreColorHsl(score: number, alpha = 1): string {
  return alpha < 1
    ? `hsl(${scoreColorVar(score)} / ${alpha})`
    : `hsl(${scoreColorVar(score)})`;
}

export function scoreBucketLabel(score: number): string {
  if (score >= 7) return "Urgent";
  if (score >= 4) return "Watch";
  if (score >= 1) return "Cool";
  return "Cold";
}