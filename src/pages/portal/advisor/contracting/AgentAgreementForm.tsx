import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/portal/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const BRAND = "#1A4D3E";
const AGREEMENT_STEP_ID = "979518e9-9044-404d-bf94-3cc44d7c78cf";

interface AgentAgreementFormProps {
  agentId: string;
  fullName: string;
  onClose: () => void;
  onSigned: () => void;
}

export default function AgentAgreementForm({ agentId, fullName, onClose, onSigned }: AgentAgreementFormProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const canSubmit = !!signature && !!initials && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // 1. Save agreement
      const { error: insertErr } = await supabase.from("contracting_agreements").insert({
        agent_id: agentId,
        agent_signature: signature,
        agent_initials: initials,
        agent_signed_at: new Date().toISOString(),
        consultant_name: fullName,
        effective_date: new Date().toISOString().split("T")[0],
        status: "pending_company",
      } as any);
      if (insertErr) throw insertErr;

      // 2. Mark agreement step completed
      const { error: stepErr } = await supabase.from("contracting_agent_steps").upsert({
        agent_id: agentId,
        step_id: AGREEMENT_STEP_ID,
        status: "completed",
        completed_at: new Date().toISOString(),
      } as any, { onConflict: "agent_id,step_id" });
      if (stepErr) throw stepErr;

      toast.success("Agreement signed successfully!");
      onSigned();
    } catch (err: any) {
      console.error("Agreement submit error:", err);
      toast.error(err.message || "Failed to submit agreement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <Button variant="ghost" onClick={onClose} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Welcome
      </Button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center text-white" style={{ background: BRAND }}>
          <h1 className="text-xl font-bold">INDEPENDENT AGENT AGREEMENT</h1>
          <p className="text-white/80 text-sm mt-1">Everence Wealth</p>
        </div>

        <ScrollArea className="h-[60vh]">
          <div className="p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
            {/* Preamble */}
            <p>
              This Independent Agent Agreement (the "<strong>Agreement</strong>") is effective as of{" "}
              <span className="font-semibold underline">{today}</span> (the "Effective Date"), by and between
              Everence Wealth LLC (the "<strong>Company</strong>"), and{" "}
              <span className="font-semibold underline">{fullName}</span> (the "<strong>Consultant</strong>").
            </p>
            <p>
              <strong>WHEREAS</strong>, the Company is in the business of recruiting, training, and supervising
              independent insurance agents for the purpose of marketing and selling various insurance and
              financial products; and
            </p>
            <p>
              <strong>WHEREAS</strong>, the Consultant desires to serve as an independent agent for the Company
              and to market and sell such products under the terms and conditions set forth herein;
            </p>
            <p>
              <strong>NOW, THEREFORE</strong>, in consideration of the mutual promises and covenants contained
              herein, and for other good and valuable consideration, the receipt and sufficiency of which are
              hereby acknowledged, the parties agree as follows:
            </p>

            {/* Section I */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>I. TERM</h3>
            <p>
              This Agreement shall commence on the Effective Date and shall continue until terminated by either
              party in accordance with Section XII of this Agreement. This Agreement may be renewed or extended
              by mutual written consent of the parties.
            </p>

            {/* Section II */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>II. PERFORMANCE OF SERVICES</h3>
            <p>
              The Consultant agrees to perform the following services for the Company: (a) market and sell
              insurance and financial products offered by the Company's contracted carriers; (b) solicit
              applications for insurance policies and related products; (c) provide accurate and complete
              information to prospective clients; (d) comply with all applicable laws, regulations, and carrier
              guidelines; and (e) maintain all required licenses and certifications.
            </p>

            {/* Section III */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>III. COMPENSATION</h3>
            <p><strong>A.</strong> The Consultant shall be compensated on a commission-only basis as set forth in the Company's compensation schedule, which may be amended from time to time.</p>
            <p><strong>B.</strong> Commissions shall be paid only on business that is issued, placed, and for which premiums have been collected by the applicable carrier.</p>
            <p><strong>C.</strong> The Company reserves the right to charge back commissions on policies that lapse or are cancelled within the first twelve (12) months of issuance.</p>
            <p><strong>D.</strong> The Consultant acknowledges and agrees that commission levels are determined based on production volume, product type, and the Company's agreement with each respective carrier.</p>

            {/* Section IV */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>IV. CONFLICTS OF INTEREST</h3>
            <p>
              The Consultant agrees to disclose any potential conflicts of interest to the Company promptly.
              The Consultant shall not engage in any activity that would create a conflict of interest with the
              Company's business or that would adversely affect the Company's relationships with its carriers or clients.
            </p>

            {/* Section V */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>V. EQUIPMENT, TOOLS, AND TRAINING</h3>
            <p>
              The Consultant shall be responsible for providing their own equipment, tools, and supplies
              necessary to perform services under this Agreement. The Company may, at its discretion, provide
              access to training programs, marketing materials, and technology platforms to assist the
              Consultant in performing their duties.
            </p>

            {/* Section VI */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>VI. CONFIDENTIAL INFORMATION: RECORDS</h3>
            <p>
              The Consultant acknowledges that during the course of this Agreement, the Consultant may have
              access to confidential and proprietary information of the Company, including but not limited to
              client lists, marketing strategies, compensation structures, business plans, and carrier
              agreements. The Consultant agrees to maintain the confidentiality of such information during and
              after the term of this Agreement.
            </p>

            {/* Section VII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>VII. NO SOLICITATION</h3>
            <p>
              During the term of this Agreement and for a period of twelve (12) months following termination,
              the Consultant shall not directly or indirectly solicit, recruit, or hire any employee, agent, or
              contractor of the Company, or encourage any such individual to leave the Company's service.
            </p>

            {/* Section VIII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>VIII. UNIQUE NATURE OF CONSULTANT'S SERVICES</h3>
            <p>
              The Consultant acknowledges that the services to be rendered under this Agreement are unique and
              personal in nature, and that the Company would suffer irreparable harm in the event of a breach
              of this Agreement. Accordingly, the Company shall be entitled to seek equitable relief, including
              injunction and specific performance, in addition to any other remedies available at law.
            </p>

            {/* Section IX */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>IX. INDEPENDENT CONTRACTOR RELATIONSHIP</h3>
            <p>
              The Consultant is an independent contractor and not an employee, partner, or agent of the Company
              for any purpose. The Consultant shall be solely responsible for the payment of all taxes,
              including self-employment taxes, and shall not be entitled to any employee benefits, including but
              not limited to health insurance, retirement benefits, or workers' compensation.
            </p>

            {/* Section X */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>X. OWNERSHIP OF COMPANY NAMES, SERVICE MARKS, AND MATERIALS</h3>
            <p>
              The Consultant acknowledges that all Company names, logos, service marks, trademarks, marketing
              materials, and other intellectual property are the exclusive property of the Company. The
              Consultant is granted a limited, non-exclusive license to use such materials solely in connection
              with the performance of services under this Agreement.
            </p>

            {/* Section XI */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XI. INDEMNIFICATION</h3>
            <p>
              The Consultant agrees to indemnify, defend, and hold harmless the Company, its officers,
              directors, employees, and agents from and against any and all claims, damages, losses, costs,
              and expenses (including reasonable attorneys' fees) arising out of or related to the Consultant's
              performance of services under this Agreement.
            </p>

            {/* Section XII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XII. TERMINATION</h3>
            <p>
              Either party may terminate this Agreement at any time, with or without cause, by providing thirty
              (30) days' written notice to the other party. Upon termination, all rights and obligations of the
              parties shall cease, except for those provisions that by their nature are intended to survive termination.
            </p>

            {/* Section XIII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XIII. AGENT RELEASE</h3>
            <p>
              Upon termination of this Agreement, the Consultant hereby releases the Company from any and all
              claims, demands, and causes of action, whether known or unknown, arising out of or related to
              this Agreement, except for any unpaid commissions that have been earned and are due at the time of termination.
            </p>

            {/* Section XIV */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XIV. RESOLUTION OF DISPUTES</h3>
            <p>
              Any dispute arising out of or relating to this Agreement shall first be submitted to mediation in
              accordance with the rules of the American Arbitration Association. If mediation is unsuccessful,
              the dispute shall be submitted to binding arbitration in the state where the Company's principal
              office is located.
            </p>

            {/* Section XV */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XV. ENTIRE AGREEMENT</h3>
            <p>
              This Agreement constitutes the entire agreement between the parties with respect to the subject
              matter hereof and supersedes all prior and contemporaneous agreements, understandings, and
              representations, whether written or oral.
            </p>

            {/* Section XVI */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XVI. SEVERABILITY</h3>
            <p>
              If any provision of this Agreement is found to be invalid or unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>

            {/* Section XVII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XVII. REPRESENTATION BY COUNSEL</h3>
            <p>
              Each party acknowledges that it has had the opportunity to seek independent legal counsel prior
              to executing this Agreement and has either done so or voluntarily chosen not to do so.
            </p>

            {/* Section XVIII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XVIII. NOTICES</h3>
            <p>
              All notices required or permitted under this Agreement shall be in writing and shall be delivered
              personally, sent by certified mail, return receipt requested, or sent by overnight courier to the
              addresses set forth below or to such other address as either party may designate in writing.
            </p>

            {/* Section XIX */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XIX. WAIVER</h3>
            <p>
              The failure of either party to enforce any provision of this Agreement shall not constitute a
              waiver of that party's right to enforce that provision or any other provision of this Agreement at
              a later time.
            </p>

            {/* Section XX */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XX. ASSIGNMENT</h3>
            <p>
              This Agreement may not be assigned by the Consultant without the prior written consent of the
              Company. The Company may assign this Agreement to any successor entity without the Consultant's consent.
            </p>

            {/* Section XXI */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XXI. GOVERNING LAW</h3>
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of the State of
              Florida, without regard to its conflict of laws principles.
            </p>

            {/* Section XXII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XXII. FORUM SELECTION</h3>
            <p>
              The parties agree that any legal proceedings arising out of or relating to this Agreement shall be
              brought exclusively in the state or federal courts located in the State of Florida.
            </p>

            {/* Section XXIII */}
            <h3 className="font-bold text-base" style={{ color: BRAND }}>XXIII. EXECUTION IN COUNTERPARTS</h3>
            <p>
              This Agreement may be executed in counterparts, each of which shall be deemed an original, and
              all of which together shall constitute one and the same agreement.
            </p>

            {/* Exhibit A */}
            <h3 className="font-bold text-base mt-8" style={{ color: BRAND }}>EXHIBIT A: CARRIER SCHEDULE</h3>
            <p>
              The list of contracted carriers and associated commission schedules shall be provided separately
              and may be updated from time to time at the Company's discretion. The Consultant acknowledges
              that carrier appointments are subject to each carrier's individual requirements and approval
              processes.
            </p>

            {/* Signature Block */}
            <div className="border-t-2 border-gray-200 pt-8 mt-8 space-y-6">
              <h3 className="font-bold text-lg text-center" style={{ color: BRAND }}>
                SIGNATURE PAGE
              </h3>

              <p className="text-center text-sm text-gray-500">
                IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.
              </p>

              {/* Consultant Section */}
              <div className="border rounded-xl p-6 space-y-4">
                <h4 className="font-bold" style={{ color: BRAND }}>CONSULTANT</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{" "}
                    <span className="font-semibold">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>{" "}
                    <span className="font-semibold">{today}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: BRAND }}>
                    Consultant Signature <span className="text-red-500">*</span>
                  </label>
                  <SignaturePad onChange={setSignature} value={signature} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: BRAND }}>
                    Consultant Initials <span className="text-red-500">*</span>
                  </label>
                  <SignaturePad onChange={setInitials} value={initials} />
                </div>
              </div>

              {/* Company Section */}
              <div className="border rounded-xl p-6 space-y-4 bg-gray-50">
                <h4 className="font-bold" style={{ color: BRAND }}>EVERENCE WEALTH LLC</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Authorized Representative:</span>{" "}
                    <span className="text-gray-400 italic">Pending</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>{" "}
                    <span className="text-gray-400 italic">Pending</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">
                    Company Signature
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg h-[80px] flex items-center justify-center bg-white">
                    <p className="text-sm text-gray-400 italic">Signed by Everence Wealth admin after submission</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">
                    Company Initials
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg h-[60px] flex items-center justify-center bg-white">
                    <p className="text-sm text-gray-400 italic">Pending admin signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Submit Bar */}
        <div className="border-t p-4 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">
            {!signature && !initials
              ? "Please provide your signature and initials above"
              : !signature
              ? "Please provide your signature above"
              : !initials
              ? "Please provide your initials above"
              : "Ready to submit"}
          </p>
          <Button
            size="lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="text-white font-semibold gap-2 px-8 rounded-xl"
            style={{ background: canSubmit ? BRAND : undefined }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Sign & Submit Agreement
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
