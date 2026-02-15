import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { registerCrmLead } from "@/utils/crm/registerCrmLead";

export type ChatStep = "initial" | "property_type" | "budget" | "area" | "contact_form" | "complete";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickReplies?: Array<{ label: string; value: string }>;
}

interface CollectedData {
  propertyType?: string;
  budget?: string;
  area?: string;
}

export interface ChatbotHook {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (text: string) => void;
  handleQuickReply: (value: string) => void;
  submitContactForm: (data: { name: string; email: string; phone: string; language: string }) => void;
  currentStep: ChatStep;
  language: string;
}

const TRANSLATIONS = {
  en: {
    greeting: "👋 Hello! I'm here to help you explore insurance and wealth strategies tailored to your goals.\n\nWhat would you like help with?",
    scheduleViewing: "📅 Schedule a consultation",
    discussFinancing: "💰 Discuss strategies",
    learnAbout: "📍 Learn about products",
    askQuestion: "❓ Ask a question",
    propertyTypeQ: "Great! Let me collect some details.\n\nWhat type of product are you most interested in?",
    budgetQ: "What's your annual budget range?",
    areaQ: "Which area of planning interests you most?",
    confirmation: "✅ Thank you! Our team will contact you within 24 hours to schedule your consultation. You'll receive a confirmation email shortly.",
  },
  es: {
    greeting: "👋 ¡Hola! Estoy aquí para ayudarte a explorar estrategias de seguros y patrimonio adaptadas a tus objetivos.\n\n¿En qué te puedo ayudar?",
    scheduleViewing: "📅 Programar una consulta",
    discussFinancing: "💰 Discutir estrategias",
    learnAbout: "📍 Conocer sobre productos",
    askQuestion: "❓ Hacer una pregunta",
    propertyTypeQ: "¡Genial! Permíteme recopilar algunos detalles.\n\n¿Qué tipo de producto te interesa más?",
    budgetQ: "¿Cuál es tu rango de presupuesto anual?",
    areaQ: "¿Qué área de planificación te interesa más?",
    confirmation: "✅ ¡Gracias! Nuestro equipo se pondrá en contacto contigo en 24 horas para programar tu consulta. Recibirás un correo de confirmación pronto.",
  },
};

export const useChatbot = (articleSlug: string, language: string): ChatbotHook => {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const [messages, setMessages] = useState<Message[]>([
    {
      text: t.greeting,
      isBot: true,
      timestamp: new Date(),
      quickReplies: [
        { label: t.scheduleViewing, value: "schedule" },
        { label: t.discussFinancing, value: "financing" },
        { label: t.learnAbout, value: "areas" },
        { label: t.askQuestion, value: "question" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState<ChatStep>("initial");
  const [collectedData, setCollectedData] = useState<CollectedData>({});

  const addMessage = (text: string, isBot: boolean, quickReplies?: Array<{ label: string; value: string }>) => {
    setMessages((prev) => [...prev, { text, isBot, timestamp: new Date(), quickReplies }]);
  };

  const sendMessage = (text: string) => {
    addMessage(text, false);
    setInput("");
  };

  const handleQuickReply = (value: string) => {
    addMessage(value, false);

    switch (currentStep) {
      case "initial":
        if (value === "schedule") {
          setCurrentStep("property_type");
          addMessage(t.propertyTypeQ, true, [
            { label: "🛡️ Life Insurance", value: "life_insurance" },
            { label: "💰 Annuities", value: "annuities" },
            { label: "📈 Retirement Planning", value: "retirement" },
            { label: "🏛️ Estate Planning", value: "estate" },
          ]);
        }
        break;

      case "property_type":
        setCollectedData((prev) => ({ ...prev, propertyType: value }));
        setCurrentStep("budget");
        addMessage(t.budgetQ, true, [
          { label: "Under $5K/year", value: "under-5k" },
          { label: "$5K - $15K/year", value: "5k-15k" },
          { label: "$15K - $50K/year", value: "15k-50k" },
          { label: "$50K+/year", value: "50k+" },
        ]);
        break;

      case "budget":
        setCollectedData((prev) => ({ ...prev, budget: value }));
        setCurrentStep("area");
        addMessage(t.areaQ, true, [
          { label: "Retirement Income", value: "retirement_income" },
          { label: "Family Protection", value: "family_protection" },
          { label: "Tax Optimization", value: "tax_optimization" },
          { label: "Wealth Transfer", value: "wealth_transfer" },
        ]);
        break;

      case "area":
        setCollectedData((prev) => ({ ...prev, area: value }));
        setCurrentStep("contact_form");
        break;
    }
  };

  const submitContactForm = async (data: { name: string; email: string; phone: string; language: string }) => {
    try {
      const conversationTranscript = messages.map((m) => ({
        text: m.text,
        isBot: m.isBot,
        timestamp: m.timestamp.toISOString(),
      }));

      const { error } = await supabase.from("chatbot_conversations").insert({
        user_name: data.name,
        user_email: data.email,
        user_phone: data.phone,
        preferred_language: data.language,
        property_type: collectedData.propertyType,
        budget_range: collectedData.budget,
        area: collectedData.area,
        conversation_transcript: conversationTranscript,
        article_slug: articleSlug,
      });

      if (error) throw error;

      // Parse full name for CRM
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Build conversation summary for CRM message
      const conversationSummary = [
        collectedData.propertyType ? `Property Type: ${collectedData.propertyType}` : null,
        collectedData.budget ? `Budget: ${collectedData.budget}` : null,
        collectedData.area ? `Area: ${collectedData.area}` : null,
      ].filter(Boolean).join(' | ');

      // Register with CRM for proper lead routing and admin notifications
      await registerCrmLead({
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        leadSource: 'Emma Chatbot',
        leadSourceDetail: `chatbot_embedded_${articleSlug}_${language}`,
        pageType: 'blog_article',
        pageUrl: window.location.href,
        pageTitle: document.title,
        language: language,
        referrer: document.referrer || undefined,
        propertyType: collectedData.propertyType,
        interest: conversationSummary || `Chatbot inquiry from ${articleSlug}`,
        message: `Chatbot conversation completed. Budget: ${collectedData.budget || 'Not specified'}. ${conversationSummary}`,
      });

      setCurrentStep("complete");
      addMessage(t.confirmation, true);
      toast.success("Booking submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    handleQuickReply,
    submitContactForm,
    currentStep,
    language,
  };
};
