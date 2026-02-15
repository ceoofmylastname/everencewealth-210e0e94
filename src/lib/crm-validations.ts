import { z } from "zod";

export const agentFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["agent", "admin"]),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  max_active_leads: z.number().min(1).max(1000).default(50),
  email_notifications: z.boolean().default(true),
  timezone: z.string().default("America/New_York"),
});

export const editAgentFormSchema = agentFormSchema.omit({ password: true }).extend({
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

export type AgentFormData = z.infer<typeof agentFormSchema>;
export type EditAgentFormData = z.infer<typeof editAgentFormSchema>;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
] as const;

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/Madrid",
  "Europe/London",
] as const;

export const getLanguageFlag = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.flag || "🌐";
};

export const getLanguageName = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.name || code;
};
