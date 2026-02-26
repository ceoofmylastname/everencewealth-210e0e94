import {
  LayoutDashboard, Users, FileText, ClipboardList, MessageSquare,
  Building2, Newspaper, TrendingUp,
  Wrench, GraduationCap, Megaphone, Calendar,
  Briefcase, GitBranch, FolderOpen, Settings,
  Shield, Send,
} from "lucide-react";

export interface TourStep {
  group: string;
  title: string;
  description: string;
  icons: { icon: React.ElementType; label: string }[];
}

export const TOUR_STEPS: TourStep[] = [
  {
    group: "Portal",
    title: "Your Command Center",
    description: "Your operations hub — clients, policies, coverage needs & messaging.",
    icons: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Clients" },
      { icon: FileText, label: "Policies" },
      { icon: ClipboardList, label: "CNA" },
      { icon: MessageSquare, label: "Messages" },
    ],
  },
  {
    group: "Market",
    title: "Market Intelligence",
    description: "Carrier intel, industry news & performance tracking.",
    icons: [
      { icon: Building2, label: "Carriers" },
      { icon: Newspaper, label: "News" },
      { icon: TrendingUp, label: "Performance" },
    ],
  },
  {
    group: "Resources",
    title: "Resources & Growth",
    description: "Tools, training, marketing & scheduling.",
    icons: [
      { icon: Wrench, label: "Tools" },
      { icon: GraduationCap, label: "Training" },
      { icon: Megaphone, label: "Marketing" },
      { icon: Calendar, label: "Schedule" },
    ],
  },
  {
    group: "Contracting",
    title: "Agent Contracting",
    description: "Agent onboarding pipeline, files & analytics.",
    icons: [
      { icon: Briefcase, label: "Dashboard" },
      { icon: GitBranch, label: "Pipeline" },
      { icon: Users, label: "Agents" },
      { icon: FolderOpen, label: "Files" },
      { icon: TrendingUp, label: "Analytics" },
      { icon: Settings, label: "Settings" },
    ],
  },
  {
    group: "Compliance",
    title: "Compliance & Settings",
    description: "Licensing, documents & account settings.",
    icons: [
      { icon: Shield, label: "Compliance" },
      { icon: FolderOpen, label: "Documents" },
      { icon: Send, label: "Invite Client" },
      { icon: Settings, label: "Settings" },
    ],
  },
];
