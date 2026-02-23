import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/i18n";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  BlogRedirect,
  QARedirect,
  ComparisonRedirect,
  LocationIndexRedirect,
  LocationPageRedirect,
} from "@/components/LegacyRouteRedirects";
import { SUPPORTED_LANGUAGES } from "@/types/hreflang";

// Language-prefixed homepage wrapper - validates lang param and renders Home or NotFound
const LanguageHome = () => {
  const { lang } = useParams<{ lang: string }>();

  // If lang is 'en', redirect to root to avoid duplicate URLs
  if (lang === 'en') {
    return <Navigate to="/" replace />;
  }

  // Check if it's a valid language code (excluding 'en' which redirects above)
  const isValidLang = lang && SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number]);

  if (!isValidLang) {
    return <NotFound />;
  }

  return <Home />;
};

// Eager load critical pages (landing pages)
import Home from "./pages/Home";
import BlogIndex from "./pages/BlogIndex";
import QAIndex from "./pages/QAIndex";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ThankYou from "./pages/ThankYou";

// Gmail OAuth callback
const GmailCallback = lazy(() => import("./pages/auth/GmailCallback"));

// Lazy load heavy public pages
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const QAPage = lazy(() => import("./pages/QAPage"));
const PropertyFinder = lazy(() => import("./pages/PropertyFinder"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const CityBrochure = lazy(() => import("./pages/CityBrochure"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Glossary = lazy(() => import("./pages/Glossary"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const ComparisonIndex = lazy(() => import("./pages/ComparisonIndex"));
const LocationHub = lazy(() => import("./pages/LocationHub"));
const LocationIndex = lazy(() => import("./pages/LocationIndex"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const StateGuidesIndex = lazy(() => import("./pages/StateGuidesIndex"));
const StateGuidePage = lazy(() => import("./pages/StateGuidePage"));
const About = lazy(() => import("./pages/About"));
const Philosophy = lazy(() => import("./pages/Philosophy"));
const IndexedUniversalLife = lazy(() => import("./pages/strategies/IndexedUniversalLife"));
const WholeLife = lazy(() => import("./pages/strategies/WholeLife"));
const TaxFreeRetirement = lazy(() => import("./pages/strategies/TaxFreeRetirement"));
const AssetProtection = lazy(() => import("./pages/strategies/AssetProtection"));
const Team = lazy(() => import("./pages/Team"));
const ClientStories = lazy(() => import("./pages/ClientStories"));
const BuyersGuide = lazy(() => import("./pages/BuyersGuide"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const ApartmentsLanding = lazy(() => import("./pages/apartments/ApartmentsLanding"));

// Lazy load ALL admin pages (rarely accessed, heavy components)
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProperties = lazy(() => import("./pages/AdminProperties"));
const PropertyForm = lazy(() => import("./pages/admin/PropertyForm"));
const Articles = lazy(() => import("./pages/admin/Articles"));
const ArticleEditor = lazy(() => import("./pages/admin/ArticleEditor"));
const Authors = lazy(() => import("./pages/admin/Authors"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Export = lazy(() => import("./pages/admin/Export"));
const AITools = lazy(() => import("./pages/admin/AITools"));
const SystemCheck = lazy(() => import("./pages/admin/SystemCheck"));
const ClusterGenerator = lazy(() => import("./pages/admin/ClusterGenerator"));
const AEOGuide = lazy(() => import("./pages/admin/AEOGuide"));
const BatchImageGeneration = lazy(() => import("./pages/admin/BatchImageGeneration"));
const CitationHealth = lazy(() => import("./pages/admin/CitationHealth"));
const ApprovedDomains = lazy(() => import("./pages/admin/ApprovedDomains"));
const BulkInternalLinks = lazy(() => import("./pages/admin/BulkInternalLinks"));
const BulkSpeakableRegeneration = lazy(() => import("./pages/admin/BulkSpeakableRegeneration"));
const BulkArticleLinker = lazy(() => import("./pages/admin/BulkArticleLinker"));
const BrochureManager = lazy(() => import("./pages/admin/BrochureManager"));
const QAGenerator = lazy(() => import("./pages/admin/QAGenerator"));
const QADashboard = lazy(() => import("./pages/admin/QADashboard"));
const ComparisonGenerator = lazy(() => import("./pages/admin/ComparisonGenerator"));
const LocationGenerator = lazy(() => import("./pages/admin/LocationGenerator"));
const LocationPages = lazy(() => import("./pages/admin/LocationPages"));
const BatchLocationImageGeneration = lazy(() => import("./pages/admin/BatchLocationImageGeneration"));
const Phase1LinkingTool = lazy(() => import("./pages/admin/Phase1LinkingTool"));
const BOFUPageGenerator = lazy(() => import("./pages/admin/BOFUPageGenerator"));
const NavbarImageGenerator = lazy(() => import("./pages/admin/NavbarImageGenerator"));
const SEOMonitor = lazy(() => import("./pages/admin/SEOMonitor"));
const SystemHealth = lazy(() => import("./pages/admin/SystemHealth"));
const SchemaHealth = lazy(() => import("./pages/admin/SchemaHealth"));
const ClusterManager = lazy(() => import("./pages/admin/ClusterManager"));
const DuplicateImageFixer = lazy(() => import("./pages/admin/DuplicateImageFixer"));
const ImageHealthDashboard = lazy(() => import("./pages/admin/ImageHealthDashboard"));
const SystemAudit = lazy(() => import("./pages/admin/SystemAudit"));
const ProductionAudit = lazy(() => import("./pages/admin/ProductionAudit"));
const AEOAnswerFixer = lazy(() => import("./pages/admin/AEOAnswerFixer"));
const MigrateImages = lazy(() => import("./pages/admin/MigrateImages"));
const AddProperty = lazy(() => import("./pages/AddProperty"));
const EmmaConversations = lazy(() => import("./pages/admin/EmmaConversations"));
const GoneURLsManager = lazy(() => import("./pages/admin/GoneURLsManager"));
const RedirectChecker = lazy(() => import("./pages/admin/RedirectChecker"));
const BrokenLinkChecker = lazy(() => import("./pages/admin/BrokenLinkChecker"));
const BulkImageUpdate = lazy(() => import("./pages/admin/BulkImageUpdate"));
const WebhookTesting = lazy(() => import("./pages/admin/WebhookTesting"));
const SEOStatusChecker = lazy(() => import("./pages/admin/SEOStatusChecker"));
const DuplicateDetector = lazy(() => import("./pages/admin/DuplicateDetector"));
const CanonicalBackfill = lazy(() => import("./pages/admin/CanonicalBackfill"));
const NotFoundResolver = lazy(() => import("./pages/admin/NotFoundResolver"));
const CitationBackfill = lazy(() => import("./pages/admin/CitationBackfill"));
const SpeakableTestBench = lazy(() => import("./pages/admin/SpeakableTestBench"));
const LinkAudit = lazy(() => import("./pages/admin/LinkAudit"));
const CrawlabilityTest = lazy(() => import("./pages/admin/CrawlabilityTest"));
const ApartmentsPageContent = lazy(() => import("./pages/admin/ApartmentsPageContent"));
const ApartmentsProperties = lazy(() => import("./pages/admin/ApartmentsProperties"));
const ApartmentsEditorManager = lazy(() => import("./pages/admin/ApartmentsEditorManager"));
const ApartmentsAuth = lazy(() => import("./pages/ApartmentsAuth"));

// Inner components for apartments editor layout (no AdminLayout wrapper)
import { ApartmentsPageContentInner } from "./pages/admin/ApartmentsPageContent";
import { ApartmentsPropertiesInner } from "./pages/admin/ApartmentsProperties";

// CRM Pages
// Portal Pages
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalForgotPassword = lazy(() => import("./pages/portal/PortalForgotPassword"));
const PortalResetPassword = lazy(() => import("./pages/portal/PortalResetPassword"));
const AdvisorDashboard = lazy(() => import("./pages/portal/advisor/AdvisorDashboard"));
const AdvisorClients = lazy(() => import("./pages/portal/advisor/AdvisorClients"));
const AdvisorPolicies = lazy(() => import("./pages/portal/advisor/AdvisorPolicies"));
const PolicyForm = lazy(() => import("./pages/portal/advisor/PolicyForm"));
const PolicyDetail = lazy(() => import("./pages/portal/advisor/PolicyDetail"));
const AdvisorDocuments = lazy(() => import("./pages/portal/advisor/AdvisorDocuments"));
const ClientInvite = lazy(() => import("./pages/portal/advisor/ClientInvite"));
const AdvisorMessages = lazy(() => import("./pages/portal/advisor/AdvisorMessages"));
const CarrierDirectory = lazy(() => import("./pages/portal/advisor/CarrierDirectory"));
const CarrierDetail = lazy(() => import("./pages/portal/advisor/CarrierDetail"));
const CarrierNewsPage = lazy(() => import("./pages/portal/advisor/CarrierNews"));
const PerformanceTracker = lazy(() => import("./pages/portal/advisor/PerformanceTracker"));
const ToolsHub = lazy(() => import("./pages/portal/advisor/ToolsHub"));
const TrainingCenter = lazy(() => import("./pages/portal/advisor/TrainingCenter"));
const TrainingDetail = lazy(() => import("./pages/portal/advisor/TrainingDetail"));
const MarketingResources = lazy(() => import("./pages/portal/advisor/MarketingResources"));
const SchedulePage = lazy(() => import("./pages/portal/advisor/SchedulePage"));
const ComplianceCenter = lazy(() => import("./pages/portal/advisor/ComplianceCenter"));
const AdvisorSettings = lazy(() => import("./pages/portal/AdvisorSettings"));
const CNADashboard = lazy(() => import("./pages/portal/advisor/CNADashboard"));
const CNAForm = lazy(() => import("./pages/portal/advisor/CNAForm"));
const ContractingDashboard = lazy(() => import("./pages/portal/advisor/contracting/ContractingDashboard"));
const ContractingPipeline = lazy(() => import("./pages/portal/advisor/contracting/ContractingPipeline"));
const ContractingAgentDetail = lazy(() => import("./pages/portal/advisor/contracting/ContractingAgentDetail"));
const ContractingMessages = lazy(() => import("./pages/portal/advisor/contracting/ContractingMessages"));
const ContractingDocuments = lazy(() => import("./pages/portal/advisor/contracting/ContractingDocuments"));
const ContractingAdmin = lazy(() => import("./pages/portal/advisor/contracting/ContractingAdmin"));
const ContractingAnalytics = lazy(() => import("./pages/portal/advisor/contracting/ContractingAnalytics"));
const ContractingAgents = lazy(() => import("./pages/portal/advisor/contracting/ContractingAgents"));
const ContractingSettings = lazy(() => import("./pages/portal/advisor/contracting/ContractingSettings"));
const WorkshopSlugSetup = lazy(() => import("./pages/portal/advisor/WorkshopSlugSetup"));
const WorkshopCreate = lazy(() => import("./pages/portal/advisor/WorkshopCreate"));
const WorkshopsDashboard = lazy(() => import("./pages/portal/advisor/WorkshopsDashboard"));
const ClientDashboard = lazy(() => import("./pages/portal/client/ClientDashboard"));
const ClientPolicies = lazy(() => import("./pages/portal/client/ClientPolicies"));
const ClientDocuments = lazy(() => import("./pages/portal/client/ClientDocuments"));
const ClientMessages = lazy(() => import("./pages/portal/client/ClientMessages"));
const ClientPolicyDetail = lazy(() => import("./pages/portal/client/ClientPolicyDetail"));
const ClientNotifications = lazy(() => import("./pages/portal/client/ClientNotifications"));
const ClientCNAView = lazy(() => import("./pages/portal/client/ClientCNAView"));
const ClientSignup = lazy(() => import("./pages/portal/ClientSignup"));

// Portal Admin Pages
const AdminAgents = lazy(() => import("./pages/portal/admin/AdminAgents"));
const AdminAgentNew = lazy(() => import("./pages/portal/admin/AdminAgentNew"));
const AdminAgentDetail = lazy(() => import("./pages/portal/admin/AdminAgentDetail"));
const AdminClients = lazy(() => import("./pages/portal/admin/AdminClients"));
const AdminCarriersPage = lazy(() => import("./pages/portal/admin/AdminCarriers"));
const AdminNewsPage = lazy(() => import("./pages/portal/admin/AdminNews"));
const AdminToolsPage = lazy(() => import("./pages/portal/admin/AdminTools"));
const AdminTrainingPage = lazy(() => import("./pages/portal/admin/AdminTraining"));
const AdminMarketingPage = lazy(() => import("./pages/portal/admin/AdminMarketing"));
const AdminSchedulePage = lazy(() => import("./pages/portal/admin/AdminSchedule"));
const AdminCompliancePage = lazy(() => import("./pages/portal/admin/AdminCompliance"));
const AdminBrochures = lazy(() => import("./pages/portal/admin/AdminBrochures"));
const AdminBrochureForm = lazy(() => import("./pages/portal/admin/AdminBrochureForm"));
const AdminStatePages = lazy(() => import("./pages/portal/admin/AdminStatePages"));
const GuidesLibrary = lazy(() => import("./pages/GuidesLibrary"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const AgentLogin = lazy(() => import("./pages/crm/AgentLogin"));
const CrmLogin = lazy(() => import("./pages/crm/CrmLogin"));
const AgentDashboard = lazy(() => import("./pages/crm/agent/AgentDashboard"));
const AgentLeads = lazy(() => import("./pages/crm/agent/AgentLeads"));
const LeadDetailPage = lazy(() => import("./pages/crm/agent/LeadDetailPage"));
const ClaimLeadPage = lazy(() => import("./pages/crm/agent/ClaimLeadPage"));
const CalendarPage = lazy(() => import("./pages/crm/agent/CalendarPage"));
const AgentProfilePage = lazy(() => import("./pages/crm/agent/AgentProfilePage"));

// CRM Layout and Route Guard
import { CrmAgentLayout } from "@/components/crm/CrmAgentLayout";
import { CrmAgentRoute } from "@/components/crm/CrmAgentRoute";
import { CrmAdminRoute } from "@/components/crm/CrmAdminRoute";
import { CrmAdminLayout } from "@/components/crm/CrmAdminLayout";
import { ApartmentsEditorRoute } from "@/components/ApartmentsEditorRoute";
import { ApartmentsEditorLayout } from "@/components/ApartmentsEditorLayout";
import { AdvisorRoute } from "@/components/portal/AdvisorRoute";
import { ClientRoute } from "@/components/portal/ClientRoute";
import { AdminRoute } from "@/components/portal/AdminRoute";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { AdminPortalLayout } from "@/components/portal/AdminPortalLayout";
const CrmDashboard = lazy(() => import("./pages/crm/admin/CrmDashboard"));
const CrmAnalytics = lazy(() => import("./pages/crm/admin/CrmAnalytics"));
const CrmAgentManagement = lazy(() => import("./pages/crm/admin/AgentManagement"));
const CrmAgentDetails = lazy(() => import("./pages/crm/admin/AgentDetails"));
const CrmLeadsOverview = lazy(() => import("./pages/crm/admin/LeadsOverview"));
const CrmSettings = lazy(() => import("./pages/crm/admin/CrmSettings"));
const CrmSystemVerification = lazy(() => import("./pages/crm/admin/SystemVerification"));
const CrmRoutingRules = lazy(() => import("./pages/crm/admin/RoutingRulesPage"));
const CrmRoundRobinConfig = lazy(() => import("./pages/crm/admin/RoundRobinConfig"));
const CrmEmailLogs = lazy(() => import("./pages/crm/admin/EmailLogs"));
const CrmSalestrailCallLogs = lazy(() => import("./pages/crm/admin/SalestrailCallLogs"));
const LandingEn = lazy(() => import("./pages/landing/en"));
const OptIn = lazy(() => import("./pages/OptIn"));
const RetargetingLanding = lazy(() => import("./pages/RetargetingLanding"));
const Assessment = lazy(() => import("./pages/Assessment"));
const ContractingIntake = lazy(() => import("./pages/ContractingIntake"));
const WorkshopLanding = lazy(() => import("./pages/public/WorkshopLanding"));


// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

// Redirect component for legacy property routes
const PropertyRedirect = () => {
  const { reference } = useParams<{ reference: string }>();
  return <Navigate to={`/en/property/${reference}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Eager-loaded critical pages */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/gmail/callback" element={<GmailCallback />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/apply" element={<ContractingIntake />} />
              

              {/* ========================================== */}
              {/* PROTECTED ADMIN ROUTES (MUST BE BEFORE /:lang) */}
              {/* ========================================== */}
              <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/properties" element={<ProtectedRoute><AdminProperties /></ProtectedRoute>} />
              <Route path="/admin/emma" element={<ProtectedRoute><EmmaConversations /></ProtectedRoute>} />
              <Route path="/admin/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
              <Route path="/admin/properties/edit/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
              <Route path="/admin/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
              <Route path="/admin/articles/new" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
              <Route path="/admin/articles/:id/edit" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
              <Route path="/admin/authors" element={<ProtectedRoute><Authors /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
              <Route path="/admin/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
              <Route path="/admin/cluster-generator" element={<ProtectedRoute><ClusterGenerator /></ProtectedRoute>} />
              <Route path="/admin/system-check" element={<ProtectedRoute><SystemCheck /></ProtectedRoute>} />
              <Route path="/admin/tools/batch-image-generation" element={<ProtectedRoute><BatchImageGeneration /></ProtectedRoute>} />
              <Route path="/admin/tools/bulk-speakable-regeneration" element={<ProtectedRoute><BulkSpeakableRegeneration /></ProtectedRoute>} />
              <Route path="/admin/tools/bulk-article-linker" element={<ProtectedRoute><BulkArticleLinker /></ProtectedRoute>} />
              <Route path="/admin/citation-health" element={<ProtectedRoute><CitationHealth /></ProtectedRoute>} />
              <Route path="/admin/docs/aeo-sge-guide" element={<ProtectedRoute><AEOGuide /></ProtectedRoute>} />
              <Route path="/admin/approved-domains" element={<ProtectedRoute><ApprovedDomains /></ProtectedRoute>} />
              <Route path="/admin/bulk-internal-links" element={<ProtectedRoute><BulkInternalLinks /></ProtectedRoute>} />
              <Route path="/admin/brochures" element={<ProtectedRoute><AdminBrochures /></ProtectedRoute>} />
              <Route path="/admin/brochures/new" element={<ProtectedRoute><AdminBrochureForm /></ProtectedRoute>} />
              <Route path="/admin/brochures/:id/edit" element={<ProtectedRoute><AdminBrochureForm /></ProtectedRoute>} />
              <Route path="/admin/state-pages" element={<ProtectedRoute><AdminStatePages /></ProtectedRoute>} />
              <Route path="/admin/qa-generator" element={<ProtectedRoute><QAGenerator /></ProtectedRoute>} />
              <Route path="/admin/qa-dashboard" element={<ProtectedRoute><QADashboard /></ProtectedRoute>} />
              <Route path="/admin/comparison-generator" element={<ProtectedRoute><ComparisonGenerator /></ProtectedRoute>} />
              <Route path="/admin/location-generator" element={<ProtectedRoute><LocationGenerator /></ProtectedRoute>} />
              <Route path="/admin/location-pages" element={<ProtectedRoute><LocationPages /></ProtectedRoute>} />
              <Route path="/admin/batch-location-images" element={<ProtectedRoute><BatchLocationImageGeneration /></ProtectedRoute>} />
              <Route path="/admin/phase1-linking" element={<ProtectedRoute><Phase1LinkingTool /></ProtectedRoute>} />
              <Route path="/admin/bofu-generator" element={<ProtectedRoute><BOFUPageGenerator /></ProtectedRoute>} />
              <Route path="/admin/navbar-images" element={<ProtectedRoute><NavbarImageGenerator /></ProtectedRoute>} />
              <Route path="/admin/seo-monitor" element={<ProtectedRoute><SEOMonitor /></ProtectedRoute>} />
              <Route path="/admin/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
              <Route path="/admin/schema-health" element={<ProtectedRoute><SchemaHealth /></ProtectedRoute>} />
              <Route path="/admin/clusters" element={<ProtectedRoute><ClusterManager /></ProtectedRoute>} />
              <Route path="/admin/duplicate-images" element={<ProtectedRoute><DuplicateImageFixer /></ProtectedRoute>} />
              <Route path="/admin/image-health" element={<ProtectedRoute><ImageHealthDashboard /></ProtectedRoute>} />
              <Route path="/admin/system-audit" element={<ProtectedRoute><SystemAudit /></ProtectedRoute>} />
              <Route path="/admin/production-audit" element={<ProtectedRoute><ProductionAudit /></ProtectedRoute>} />
              <Route path="/admin/aeo-fixer" element={<ProtectedRoute><AEOAnswerFixer /></ProtectedRoute>} />
              <Route path="/admin/migrate-images" element={<ProtectedRoute><MigrateImages /></ProtectedRoute>} />
              <Route path="/admin/gone-urls" element={<ProtectedRoute><GoneURLsManager /></ProtectedRoute>} />
              <Route path="/admin/redirect-checker" element={<ProtectedRoute><RedirectChecker /></ProtectedRoute>} />
              <Route path="/admin/broken-links" element={<ProtectedRoute><BrokenLinkChecker /></ProtectedRoute>} />
              <Route path="/admin/bulk-image-update" element={<ProtectedRoute><BulkImageUpdate /></ProtectedRoute>} />
              <Route path="/admin/webhook-testing" element={<ProtectedRoute><WebhookTesting /></ProtectedRoute>} />
              <Route path="/admin/seo-status" element={<ProtectedRoute><SEOStatusChecker /></ProtectedRoute>} />
              <Route path="/admin/duplicate-detector" element={<ProtectedRoute><DuplicateDetector /></ProtectedRoute>} />
              <Route path="/admin/canonical-backfill" element={<ProtectedRoute><CanonicalBackfill /></ProtectedRoute>} />
              <Route path="/admin/404-resolver" element={<ProtectedRoute><NotFoundResolver /></ProtectedRoute>} />
              <Route path="/admin/citation-backfill" element={<ProtectedRoute><CitationBackfill /></ProtectedRoute>} />
              <Route path="/admin/speakable-test" element={<ProtectedRoute><SpeakableTestBench /></ProtectedRoute>} />
              <Route path="/admin/link-audit" element={<ProtectedRoute><LinkAudit /></ProtectedRoute>} />
              <Route path="/admin/crawlability-test" element={<ProtectedRoute><CrawlabilityTest /></ProtectedRoute>} />
              <Route path="/admin/apartments-content" element={<ProtectedRoute><ApartmentsPageContent /></ProtectedRoute>} />
              <Route path="/admin/apartments-properties" element={<ProtectedRoute><ApartmentsProperties /></ProtectedRoute>} />
              <Route path="/admin/apartments-editors" element={<ProtectedRoute><ApartmentsEditorManager /></ProtectedRoute>} />

              {/* Apartments Editor Login (public) */}
              <Route path="/apartments/login" element={<ApartmentsAuth />} />

              {/* Apartments Editor Protected Routes */}
              <Route path="/apartments/dashboard" element={<ApartmentsEditorRoute><ApartmentsEditorLayout /></ApartmentsEditorRoute>}>
                <Route path="content" element={<ApartmentsPageContentInner />} />
                <Route path="properties" element={<ApartmentsPropertiesInner />} />
                <Route index element={<Navigate to="content" replace />} />
              </Route>

              {/* Standalone Property Management Page */}
              <Route path="/add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />

              {/* ========================================== */}
              {/* PORTAL ROUTES (MUST BE BEFORE /:lang)     */}
              {/* ========================================== */}
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route path="/portal/forgot-password" element={<PortalForgotPassword />} />
              <Route path="/portal/reset-password" element={<PortalResetPassword />} />
              <Route path="/portal/signup" element={<ClientSignup />} />
              <Route path="/portal/advisor" element={<AdvisorRoute />}>
                <Route element={<PortalLayout />}>
                  <Route path="dashboard" element={<AdvisorDashboard />} />
                  <Route path="clients" element={<AdvisorClients />} />
                  <Route path="policies" element={<AdvisorPolicies />} />
                  <Route path="policies/new" element={<PolicyForm />} />
                  <Route path="policies/:id" element={<PolicyDetail />} />
                  <Route path="policies/:id/edit" element={<PolicyForm />} />
                  <Route path="documents" element={<AdvisorDocuments />} />
                  <Route path="invite" element={<ClientInvite />} />
                  <Route path="messages" element={<AdvisorMessages />} />
                  <Route path="carriers" element={<CarrierDirectory />} />
                  <Route path="carriers/:id" element={<CarrierDetail />} />
                  <Route path="news" element={<CarrierNewsPage />} />
                  <Route path="performance" element={<PerformanceTracker />} />
                  <Route path="tools" element={<ToolsHub />} />
                  <Route path="training" element={<TrainingCenter />} />
                  <Route path="training/:id" element={<TrainingDetail />} />
                  <Route path="marketing" element={<MarketingResources />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  <Route path="compliance" element={<ComplianceCenter />} />
                  <Route path="settings" element={<AdvisorSettings />} />
                  <Route path="cna" element={<CNADashboard />} />
                  <Route path="cna/new" element={<CNAForm />} />
                  <Route path="cna/:id" element={<CNAForm />} />
                  <Route path="contracting" element={<ContractingDashboard />} />
                  <Route path="contracting/pipeline" element={<ContractingPipeline />} />
                  <Route path="contracting/agent/:id" element={<ContractingAgentDetail />} />
                  <Route path="contracting/messages" element={<ContractingMessages />} />
                  <Route path="contracting/documents" element={<ContractingDocuments />} />
                  <Route path="contracting/admin" element={<ContractingAdmin />} />
                  <Route path="contracting/analytics" element={<ContractingAnalytics />} />
                  <Route path="contracting/agents" element={<ContractingAgents />} />
                  <Route path="contracting/settings" element={<ContractingSettings />} />
                  <Route path="workshops" element={<WorkshopsDashboard />} />
                  <Route path="workshops/slug-setup" element={<WorkshopSlugSetup />} />
                  <Route path="workshops/create" element={<WorkshopCreate />} />
                </Route>
              </Route>
              <Route path="/portal/client" element={<ClientRoute />}>
                <Route element={<PortalLayout />}>
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="policies" element={<ClientPolicies />} />
                  <Route path="policies/:id" element={<ClientPolicyDetail />} />
                  <Route path="documents" element={<ClientDocuments />} />
                  <Route path="messages" element={<ClientMessages />} />
                  <Route path="notifications" element={<ClientNotifications />} />
                  <Route path="cna/:id" element={<ClientCNAView />} />
                </Route>
              </Route>

              {/* Portal Admin Routes */}
              <Route path="/portal/admin" element={<AdminRoute />}>
                <Route element={<AdminPortalLayout />}>
                  <Route path="agents" element={<AdminAgents />} />
                  <Route path="agents/new" element={<AdminAgentNew />} />
                  <Route path="agents/:id" element={<AdminAgentDetail />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="carriers" element={<AdminCarriersPage />} />
                  <Route path="news" element={<AdminNewsPage />} />
                  <Route path="tools" element={<AdminToolsPage />} />
                  <Route path="training" element={<AdminTrainingPage />} />
                  <Route path="marketing" element={<AdminMarketingPage />} />
                  <Route path="schedule" element={<AdminSchedulePage />} />
                  <Route path="compliance" element={<AdminCompliancePage />} />
                </Route>
              </Route>

              {/* CRM Routes */}
              <Route path="/crm/login" element={<CrmLogin />} />
              <Route path="/crm/agent/login" element={<AgentLogin />} />
              
              {/* CRM Agent Protected Routes */}
              {/* CRM Agent Protected Routes */}
              <Route path="/crm/agent" element={<CrmAgentRoute><CrmAgentLayout /></CrmAgentRoute>}>
                <Route path="dashboard" element={<AgentDashboard />} />
                <Route path="leads" element={<AgentLeads />} />
                <Route path="leads/:id" element={<LeadDetailPage />} />
                <Route path="leads/:id/claim" element={<ClaimLeadPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="profile" element={<AgentProfilePage />} />
              </Route>

              {/* CRM Admin Protected Routes */}
              <Route path="/crm/admin" element={<CrmAdminRoute><CrmAdminLayout /></CrmAdminRoute>}>
                <Route path="dashboard" element={<CrmDashboard />} />
                <Route path="analytics" element={<CrmAnalytics />} />
                <Route path="agents" element={<CrmAgentManagement />} />
                <Route path="agents/:id" element={<CrmAgentDetails />} />
                <Route path="leads" element={<CrmLeadsOverview />} />
                <Route path="leads/:id" element={<LeadDetailPage />} />
                <Route path="routing-rules" element={<CrmRoutingRules />} />
                <Route path="round-robin" element={<CrmRoundRobinConfig />} />
                <Route path="email-logs" element={<CrmEmailLogs />} />
                <Route path="call-logs" element={<CrmSalestrailCallLogs />} />
                <Route path="verification" element={<CrmSystemVerification />} />
                <Route path="settings" element={<CrmSettings />} />
              </Route>

              {/* ========================================== */}
              {/* OTHER PUBLIC ROUTES (no language prefix)  */}
              {/* MUST BE BEFORE /:lang dynamic route       */}
              {/* ========================================== */}
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/glossary" element={<Navigate to="/en/glossary" replace />} />
              <Route path="/:lang/glossary" element={<Glossary />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Guides / Brochures */}
              <Route path="/guides" element={<GuidesLibrary />} />
              <Route path="/guides/:slug" element={<GuidePage />} />
              <Route path="/:lang/guides" element={<GuidesLibrary />} />
              <Route path="/:lang/guides/:slug" element={<GuidePage />} />

              {/* Landing Pages (Paid Traffic) */}
              <Route path="/en/landing" element={<LandingEn />} />
              
              {/* Retargeting Landing Pages (EN + ES) */}
              <Route path="/en/welcome-back" element={<RetargetingLanding />} />
              <Route path="/es/bienvenido" element={<RetargetingLanding />} />
              
              <Route path="/optin" element={<OptIn />} />
              <Route path="/:lang/optin" element={<OptIn />} />

              {/* Legacy redirect for brochures - redirect to English */}
              <Route path="/brochure/:citySlug" element={<Navigate to={window.location.pathname.replace('/brochure/', '/en/brochure/')} replace />} />
              {/* Language-prefixed brochure routes */}
              <Route path="/:lang/brochure/:citySlug" element={<CityBrochure />} />
              {/* About page */}
              <Route path="/about" element={<Navigate to="/en/about-us" replace />} />
              <Route path="/:lang/about" element={<About />} />
              <Route path="/:lang/about-us" element={<About />} />
              
              {/* Team page */}
              <Route path="/team" element={<Navigate to="/en/team" replace />} />
              <Route path="/:lang/team" element={<Team />} />
              
              {/* Client Stories page */}
              <Route path="/client-stories" element={<Navigate to="/en/client-stories" replace />} />
              <Route path="/:lang/client-stories" element={<ClientStories />} />
              <Route path="/:lang/historias-de-clientes" element={<ClientStories />} />
              
              {/* Philosophy page */}
              <Route path="/philosophy" element={<Navigate to="/en/philosophy" replace />} />
              <Route path="/es/filosofia" element={<Navigate to="/es/philosophy" replace />} />
              <Route path="/:lang/philosophy" element={<Philosophy />} />
              
              {/* Strategy pages */}
              <Route path="/:lang/strategies/iul" element={<IndexedUniversalLife />} />
              <Route path="/:lang/estrategias/seguro-universal-indexado" element={<IndexedUniversalLife />} />
              <Route path="/:lang/strategies/whole-life" element={<WholeLife />} />
              <Route path="/:lang/estrategias/seguro-vida-entera" element={<WholeLife />} />
              <Route path="/:lang/strategies/tax-free-retirement" element={<TaxFreeRetirement />} />
              <Route path="/:lang/estrategias/retiro-libre-impuestos" element={<TaxFreeRetirement />} />
              <Route path="/:lang/strategies/asset-protection" element={<AssetProtection />} />
              <Route path="/:lang/estrategias/proteccion-de-activos" element={<AssetProtection />} />
              
              <Route path="/buyers-guide" element={<Navigate to="/en/buyers-guide" replace />} />
              <Route path="/:lang/buyers-guide" element={<BuyersGuide />} />
              
              {/* Contact page */}
              <Route path="/contact" element={<Navigate to="/en/contact" replace />} />
              <Route path="/:lang/contact" element={<Contact />} />

              {/* Apartments landing page */}
              <Route path="/apartments" element={<Navigate to="/en/apartments" replace />} />
              <Route path="/:lang/apartments" element={<ApartmentsLanding />} />

              {/* ========================================== */}
              {/* LANGUAGE-PREFIXED ROUTES (Phase 2)        */}
              {/* ========================================== */}

              {/* Language-prefixed homepage */}
              <Route path="/:lang" element={<LanguageHome />} />

              {/* Blog routes with language prefix */}
              <Route path="/:lang/blog" element={<BlogIndex />} />
              <Route path="/:lang/blog/:slug" element={<BlogArticle />} />

              {/* Q&A routes with language prefix */}
              <Route path="/:lang/qa" element={<QAIndex />} />
              <Route path="/:lang/qa/:slug" element={<QAPage />} />

              {/* Comparison routes with language prefix */}
              <Route path="/:lang/compare" element={<ComparisonIndex />} />
              <Route path="/:lang/compare/:slug" element={<ComparisonPage />} />

              {/* Location routes with language prefix */}
              <Route path="/:lang/locations" element={<LocationHub />} />
              <Route path="/:lang/locations/:citySlug" element={<LocationIndex />} />
              <Route path="/:lang/locations/:citySlug/:topicSlug" element={<LocationPage />} />

              {/* State Guides routes */}
              <Route path="/:lang/retirement-planning" element={<StateGuidesIndex />} />
              <Route path="/:lang/retirement-planning/:topicSlug" element={<StateGuidePage />} />

              {/* Property routes with language prefix */}
              <Route path="/:lang/properties" element={<PropertyFinder />} />
              <Route path="/:lang/property/:reference" element={<PropertyDetail />} />

              {/* ========================================== */}
              {/* LEGACY ROUTES -> REDIRECT TO /en/...      */}
              {/* ========================================== */}

              {/* Blog legacy redirects */}
              <Route path="/blog" element={<Navigate to="/en/blog" replace />} />
              <Route path="/blog/:slug" element={<BlogRedirect />} />

              {/* Q&A legacy redirects */}
              <Route path="/qa" element={<Navigate to="/en/qa" replace />} />
              <Route path="/qa/:slug" element={<QARedirect />} />

              {/* Comparison legacy redirects */}
              <Route path="/compare" element={<Navigate to="/en/compare" replace />} />
              <Route path="/compare/:slug" element={<ComparisonRedirect />} />

              {/* Location legacy redirects */}
              <Route path="/locations" element={<Navigate to="/en/locations" replace />} />
              <Route path="/locations/:citySlug" element={<LocationIndexRedirect />} />
              <Route path="/locations/:citySlug/:topicSlug" element={<LocationPageRedirect />} />

              {/* Property legacy redirects */}
              <Route path="/properties" element={<Navigate to="/en/properties" replace />} />
              <Route path="/property-finder" element={<Navigate to="/en/properties" replace />} />
              <Route path="/property/:reference" element={<PropertyRedirect />} />

              {/* Public Workshop Landing Page */}
              <Route path="/w/:slug" element={<WorkshopLanding />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
