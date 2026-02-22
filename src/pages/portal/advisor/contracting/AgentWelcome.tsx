import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";
import AgentAgreementForm from "./AgentAgreementForm";

const BRAND = "#1A4D3E";
const ACCENT = "#C9A84C";

interface AgentWelcomeProps {
  firstName: string;
  agentId?: string;
  fullName?: string;
}

export default function AgentWelcome({ firstName, agentId, fullName }: AgentWelcomeProps) {
  const [showAgreement, setShowAgreement] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const currentYear = new Date().getFullYear();

  // If the agreement form is open, show it full-screen
  if (showAgreement && agentId) {
    return (
      <AgentAgreementForm
        agentId={agentId}
        fullName={fullName || firstName}
        onClose={() => setShowAgreement(false)}
        onSigned={() => setShowConfirmation(true)}
      />
    );
  }

  // Confirmation page after signing
  if (showConfirmation) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Header Card */}
        <div
          className="rounded-2xl p-8 text-white text-center"
          style={{ background: BRAND }}
        >
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-white/90" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Agent Agreement Received!
          </h1>
          <p className="text-white/80 text-sm">
            Thank you for completing Step 1 of 2.
          </p>
        </div>

        {/* Letter Body */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-8 space-y-5 text-gray-700 leading-relaxed">
          <p className="font-semibold text-lg" style={{ color: BRAND }}>
            Dear {firstName},
          </p>

          <p>
            I wanted to confirm that we have received your Agent Agreement. Thank you
            for submitting it promptly.
          </p>

          {/* Step Indicator */}
          <div
            className="rounded-xl p-5 border-l-4"
            style={{ borderColor: ACCENT, background: "#FEFCE8" }}
          >
            <p className="font-bold text-base mb-1" style={{ color: BRAND }}>
              Next Steps: 2 of 2
            </p>
            <p className="font-semibold">
              {firstName}, you will now be able to get appointed with the Insurance
              Carriers.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Please, watch both SureLC videos to ensure you complete your onboarding
              process.
            </p>
          </div>

          <p>
            Please let us know if you have any questions or need further assistance.
          </p>

          <p className="text-sm">
            Best regards,
            <br />
            <span className="font-semibold" style={{ color: BRAND }}>
              Contracting
            </span>
          </p>

          {/* CTA Button */}
          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              className="text-white font-semibold gap-2 px-8 py-3 text-base rounded-xl shadow-lg hover:translate-y-[-2px] transition-all"
              style={{ background: BRAND }}
              onClick={() => window.location.reload()}
            >
              Continue to Step 2
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4 space-y-1">
          <p>Everence Wealth - 1 -</p>
          <p>Copyright &copy; {currentYear} Everence Wealth, All rights reserved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header Card */}
      <div
        className="rounded-2xl p-8 text-white text-center"
        style={{ background: BRAND }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Hello {firstName}, Welcome to Everence Wealth!
        </h1>
        <p className="text-white/80 text-sm">
          Below are instructions on how to get started with the onboarding process.
        </p>
      </div>

      {/* Letter Body */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-8 space-y-5 text-gray-700 leading-relaxed">
        <p className="font-semibold text-lg" style={{ color: BRAND }}>
          Hello {firstName},
        </p>

        <p>
          Welcome to the Everence Wealth team! We are thrilled to have you on board as we work
          together to bring truth and transparency to consumers across the United States.
        </p>

        <p>
          Everence Wealth is an Independent Marketing Organization (IMO) inspired by the
          "agent experience." Our mission is to streamline, simplify, and systemize the
          entire process from client acquisition, tools, product training, and sales training
          to utilizing technology to enhance profitability, productivity, and proficiency.
        </p>

        {/* Step Indicator */}
        <div
          className="rounded-xl p-5 border-l-4"
          style={{ borderColor: ACCENT, background: "#FEFCE8" }}
        >
          <p className="font-bold text-base mb-1" style={{ color: BRAND }}>
            Next Steps to Getting Started: 1 of 2
          </p>
          <p className="font-semibold">"Please review and sign the Agent Agreement."</p>
          <p className="text-sm text-gray-600 mt-1">
            Please sign immediately in order to move to step 2 of 2.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            className="text-white font-semibold gap-2 px-8 py-3 text-base rounded-xl shadow-lg hover:translate-y-[-2px] transition-all"
            style={{ background: BRAND }}
            onClick={() => setShowAgreement(true)}
          >
            <FileText className="h-5 w-5" />
            Review Agent Agreement
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Post-signing note */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm">
          <p className="font-semibold" style={{ color: BRAND }}>
            After the Agent Agreement is signed — Step 2 of 2 will follow.
          </p>
          <p>
            {firstName}, immediately after signing the Agent Agreement, you will be given
            instructions to begin the contracting process with various insurance carriers.
            Please follow the steps provided to complete your setup.
          </p>
        </div>

        <p className="text-sm">
          Thanks,
          <br />
          <span className="font-semibold" style={{ color: BRAND }}>
            Contracting
          </span>
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4 space-y-1">
        <p>Everence Wealth - 1 -</p>
        <p>Copyright &copy; {currentYear} Everence Wealth, All rights reserved.</p>
      </div>
    </div>
  );
}
