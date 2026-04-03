import { useState, useRef } from "react";
import { ExternalLink, Upload, Loader2, CheckCircle2, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BRAND = "#1A4D3E";
const ACCENT = "#C9A84C";

interface ExamFXWelcomeProps {
  firstName: string;
  agentId: string;
}

const steps = [
  {
    title: "Create an ExamFX Account",
    items: [
      <>Go to ExamFX's Website: <a href="https://www.examfx.com" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-1" style={{ color: BRAND }}>examfx.com <ExternalLink className="h-3 w-3" /></a>.</>,
      'Click on "Sign Up" or "Register": This will direct you to the registration page.',
      'Choose Your Exam Type: Select "Life Insurance" as your course.',
      "Select Your State: Licensing requirements vary by state, so choose the correct one.",
      "Select Course Package: ExamFX offers different packages, including self-study, video lectures, and live webinars.",
      null, // promo code callout inserted separately
      "Create an Account: Enter personal details such as name, email, and phone number.",
      "Make Payment: Complete the checkout process.",
    ],
  },
  {
    title: "Access the Course",
    items: [
      "Log In: Go to the ExamFX homepage and log in with your credentials.",
      "Navigate to Your Dashboard: You'll see access to your purchased course materials.",
      "Start the Pre-Licensing Course:",
      "  • Watch the video lectures.",
      "  • Read the study materials.",
      "  • Complete the chapter quizzes.",
    ],
  },
  {
    title: "Register for the Live Class",
    items: [
      "Find the Live Class Option: Go to your ExamFX dashboard.",
      'Select "Live Online Class": ExamFX offers scheduled live webinars.',
      "Choose a Date and Time: Pick a session that works for your schedule.",
      "Confirm Your Registration: You'll receive an email with login details.",
    ],
  },
  {
    title: "Complete the Course & Practice Exams",
    items: [
      "Attend the Live Class: Engage and take notes.",
      "Complete All Required Modules: Finish all lessons and quizzes.",
      "Take the Simulated Exam: This practice test mimics the actual licensing exam.",
      "Achieve a Passing Score: Some states require a minimum course completion score.",
    ],
  },
  {
    title: "Schedule the State Exam",
    items: [
      "Check State Requirements: Some states require a certificate of completion before scheduling the exam.",
      "Register with Your State's Testing Provider (e.g., Pearson VUE, Prometric).",
      "Schedule Your Exam Date: Choose an in-person or online proctored exam.",
      "Pay the Exam Fee: Fees vary by state.",
    ],
  },
  {
    title: "Take and Pass the Licensing Exam",
    items: [
      "Arrive Early for In-Person Exams: Bring necessary identification.",
      "Complete the Exam: Usually consists of multiple-choice questions.",
      "Receive Your Results: Some states provide immediate results.",
    ],
  },
];

export default function ExamFXWelcome({ firstName, agentId }: ExamFXWelcomeProps) {
  const currentYear = new Date().getFullYear();
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLicenseUpload(file: File) {
    if (uploading) return;
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${agentId}/license/${Date.now()}_${safeName}`;

      // 1. Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from("contracting-documents")
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      // 2. Call upgrade-license edge function
      const { data, error: fnErr } = await supabase.functions.invoke("upgrade-license", {
        body: {
          agentId,
          fileName: file.name,
          filePath,
          fileSize: file.size,
        },
      });

      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      setUploadComplete(true);
      toast.success("License uploaded! Redirecting to your next step...");

      // Reload after a short delay so the dashboard re-fetches the updated is_licensed
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error("License upload error:", err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleLicenseUpload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLicenseUpload(file);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl p-8 text-white text-center" style={{ background: BRAND }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Hello {firstName}, Welcome to Everence Wealth!
        </h1>
        <p className="text-white/80 text-sm">ExamFX Licensing Onboarding</p>
      </div>

      {/* Steps Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-8 space-y-7 text-gray-700 leading-relaxed">
        {steps.map((step, idx) => (
          <div key={idx}>
            {/* Step Header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shrink-0"
                style={{ background: BRAND }}
              >
                {idx + 1}
              </span>
              <h2 className="text-lg font-semibold" style={{ color: BRAND }}>
                {step.title}
              </h2>
            </div>

            {/* Step Items */}
            <ul className="ml-11 space-y-1.5 text-sm">
              {step.items.map((item, i) => {
                if (item === null) {
                  // Promo code callout
                  return (
                    <li key={i}>
                      <div
                        className="rounded-lg px-4 py-3 my-2 text-sm font-medium"
                        style={{ border: `2px solid ${ACCENT}`, background: `${ACCENT}15` }}
                      >
                        <span className="font-semibold" style={{ color: BRAND }}>
                          Promo Code | Email:
                        </span>{" "}
                        <a
                          href="mailto:info@agoraassurancesolutions.com"
                          className="underline"
                          style={{ color: BRAND }}
                        >
                          info@agoraassurancesolutions.com
                        </a>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={i} className="text-gray-600">
                    {typeof item === "string" && item.startsWith("  •") ? (
                      <span className="ml-4 block">{item.trim()}</span>
                    ) : (
                      item
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* License Upload Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-8 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ background: `${ACCENT}20` }}
          >
            <Award className="h-5 w-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: BRAND }}>
              Already Got Your License?
            </h2>
            <p className="text-sm text-gray-500">
              Upload your license document below to continue your onboarding.
            </p>
          </div>
        </div>

        {uploadComplete ? (
          /* Success state */
          <div className="rounded-xl border-2 border-green-400 bg-green-50 p-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <p className="font-semibold text-green-700">License Uploaded Successfully!</p>
            <p className="text-sm text-green-600">
              Redirecting you to the next step...
            </p>
          </div>
        ) : (
          /* Upload dropzone */
          <div
            className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-green-400 bg-green-50 scale-[1.01]"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: BRAND }} />
                <p className="text-sm text-gray-500">Uploading your license...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-gray-400" />
                <p className="text-sm font-medium text-gray-600">
                  Drag & drop your license document here, or click to browse
                </p>
                <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-8 text-center text-gray-600 space-y-2">
        <p className="text-sm">Best regards,</p>
        <p className="font-semibold text-base" style={{ color: BRAND }}>
          Everence Wealth
        </p>
        <p className="text-xs text-gray-400 pt-2">
          © {currentYear} Everence Wealth. All rights reserved.
        </p>
      </div>
    </div>
  );
}
