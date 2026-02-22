import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { FileText, ArrowRight } from "lucide-react";

const BRAND = "#1A4D3E";
const ACCENT = "#C9A84C";

interface AgentWelcomeProps {
  firstName: string;
}

export default function AgentWelcome({ firstName }: AgentWelcomeProps) {
  const [showAgreement, setShowAgreement] = useState(false);
  const currentYear = new Date().getFullYear();

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

      {/* Agreement Placeholder Dialog */}
      <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: BRAND }}>
              <FileText className="h-5 w-5" />
              Agent Agreement
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Agent Agreement — Content Coming Soon</p>
            <p className="text-sm text-gray-400">
              The agreement document will be available here for review and signature.
            </p>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
