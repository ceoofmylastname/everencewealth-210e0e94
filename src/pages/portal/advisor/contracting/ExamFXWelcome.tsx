import { ExternalLink } from "lucide-react";

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

export default function ExamFXWelcome({ firstName }: ExamFXWelcomeProps) {
  const currentYear = new Date().getFullYear();

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
