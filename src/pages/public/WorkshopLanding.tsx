import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";
import {
  Check,
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  Monitor,
  Shield,
  Award,
  Loader2,
  ChevronDown,
} from "lucide-react";

// ── Zod schema ──
const registrationSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50),
  last_name: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});
type RegistrationData = z.infer<typeof registrationSchema>;

// ── Main Component ──
const WorkshopLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Step 1: Resolve slug → advisor_id
  const { data: slugData, isLoading: slugLoading, error: slugError } = useQuery({
    queryKey: ["workshop-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisor_slugs")
        .select("advisor_id")
        .eq("slug", slug!)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Step 2: Get advisor
  const advisorId = slugData?.advisor_id;
  const { data: advisor, isLoading: advisorLoading } = useQuery({
    queryKey: ["workshop-advisor", advisorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisors")
        .select("id, first_name, last_name, email, phone, photo_url, title")
        .eq("id", advisorId!)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!advisorId,
  });

  // Step 3: Get upcoming workshops
  const { data: workshops, isLoading: workshopsLoading } = useQuery({
    queryKey: ["workshop-list", advisorId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("advisor_id", advisorId!)
        .in("status", ["scheduled", "published"])
        .gte("workshop_date", today)
        .order("workshop_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!advisorId,
  });

  // Workshop selection (for multiple)
  const [selectedIdx, setSelectedIdx] = useState(0);
  const workshop = workshops?.[selectedIdx] ?? null;

  // Registration count query
  const { data: regCount } = useQuery({
    queryKey: ["workshop-reg-count", workshop?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("workshop_registrations")
        .select("id", { count: "exact", head: true })
        .eq("workshop_id", workshop!.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!workshop?.id,
  });

  const seatsRemaining = useMemo(() => {
    if (!workshop) return null;
    const max = (workshop as any).max_attendees ?? 50;
    return Math.max(0, max - (regCount ?? 0));
  }, [workshop, regCount]);

  const isFull = seatsRemaining !== null && seatsRemaining <= 0;

  // ── Form State ──
  const [form, setForm] = useState<RegistrationData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown || submitting || isFull || !workshop || !advisorId) return;

    const result = registrationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegistrationData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("workshop_registrations").insert({
        workshop_id: workshop.id,
        advisor_id: advisorId,
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        email: result.data.email,
        phone: result.data.phone || null,
        source_url: window.location.href,
        lead_status: "registered",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You're already registered for this workshop");
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        setForm({ first_name: "", last_name: "", email: "", phone: "" });
        toast.success("You're registered!");
        // Cooldown
        setCooldown(true);
        setTimeout(() => setCooldown(false), 30000);
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  const isLoading = slugLoading || advisorLoading || workshopsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "GeistSans, system-ui, sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1A4D3E" }} />
          <p className="text-sm" style={{ color: "#4A5565" }}>Loading workshop…</p>
        </div>
      </div>
    );
  }

  // ── 404 ──
  if (slugError || !slugData || !advisor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "GeistSans, system-ui, sans-serif" }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#1A4D3E" }}>Workshop page not found</h1>
          <p style={{ color: "#4A5565" }}>The link you followed may be incorrect or expired.</p>
        </div>
      </div>
    );
  }

  // ── No upcoming workshops ──
  if (!workshops || workshops.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "GeistSans, system-ui, sans-serif" }}>
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#1A4D3E" }}>No Upcoming Workshops</h1>
          <p className="text-lg mb-2" style={{ color: "#4A5565" }}>
            {advisor.first_name} {advisor.last_name} doesn't have any upcoming workshops scheduled.
          </p>
          <p style={{ color: "#4A5565" }}>Check back soon!</p>
        </div>
      </div>
    );
  }

  // ── Format helpers ──
  const advisorName = `${advisor.first_name} ${advisor.last_name}`;
  const workshopDate = workshop?.workshop_date
    ? format(new Date(workshop.workshop_date + "T00:00:00"), "EEEE, MMMM d, yyyy")
    : "";
  const rawTime = (workshop as any)?.workshop_time ?? "18:00:00";
  // Format "HH:mm:ss" or "HH:mm" to "h:mm A"
  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  const workshopTime = formatTime(rawTime);
  const rawTimezone = (workshop as any)?.timezone ?? "PST";
  // Convert IANA timezone to abbreviation
  const workshopTimezone = (() => {
    try {
      const abbr = new Intl.DateTimeFormat("en-US", { timeZone: rawTimezone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value;
      return abbr || rawTimezone;
    } catch {
      return rawTimezone;
    }
  })();
  const workshopDuration = (workshop as any)?.duration_minutes ?? 60;
  const headline = (workshop as any)?.custom_headline || "Build Tax-Free Retirement Wealth";
  const subheadline =
    (workshop as any)?.custom_subheadline ||
    `Join ${advisorName} for a complimentary workshop`;

  return (
    <>
      <Helmet>
        <title>{`${advisorName} - Tax-Free Retirement Workshop | Everence Wealth`}</title>
        <meta
          name="description"
          content={`Join ${advisorName} for a complimentary workshop on building tax-free retirement wealth. Learn strategies to eliminate taxes and protect against market volatility.`}
        />
        <meta property="og:title" content={`${advisorName} - Tax-Free Retirement Workshop`} />
        <meta
          property="og:description"
          content={`Join ${advisorName} for a complimentary workshop on building tax-free retirement wealth.`}
        />
      </Helmet>

      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "GeistSans, system-ui, sans-serif" }}
      >
        {/* ── HEADER ── */}
        <header className="border-b" style={{ borderColor: "#E5E7EB" }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center">
            <img
              src="https://everencewealth-beta.vercel.app/logo-icon.png"
              alt="Everence Wealth logo"
              className="h-10 sm:h-12"
            />
          </div>
        </header>

        {/* ── HERO + FORM ── */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Hero content */}
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{ color: "#1A4D3E" }}
              >
                {headline}
              </h1>
              <p className="text-lg sm:text-xl mb-6" style={{ color: "#4A5565" }}>
                {subheadline}
              </p>

              {/* Date/Time prominent */}
              <div
                className="flex flex-col gap-2 mb-8 p-6"
                style={{ background: "#F8FAF9", border: "1px solid #E5E7EB", borderRadius: "0px" }}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                  <span className="text-base sm:text-lg font-medium" style={{ color: "#1A4D3E" }}>
                    {workshopDate} at {workshopTime} {workshopTimezone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                  <span style={{ color: "#4A5565" }}>{workshopDuration}-minute workshop</span>
                </div>
              </div>

              {/* Multiple workshops selector */}
              {workshops.length > 1 && (
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-2" style={{ color: "#1A4D3E" }}>
                    Select a workshop date:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedIdx}
                      onChange={(e) => {
                        setSelectedIdx(Number(e.target.value));
                        setSubmitted(false);
                      }}
                      className="w-full appearance-none px-4 py-3 text-base border bg-white pr-10"
                      style={{
                        borderColor: "#E5E7EB",
                        borderRadius: "0px",
                        color: "#1A4D3E",
                      }}
                    >
                      {workshops.map((w: any, i: number) => (
                        <option key={w.id} value={i}>
                          {w.title} — {format(new Date(w.workshop_date + "T00:00:00"), "MMM d, yyyy")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                      style={{ color: "#4A5565" }}
                    />
                  </div>
                </div>
              )}

              {/* What You'll Learn */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-5" style={{ color: "#1A4D3E" }}>
                  What You'll Learn
                </h2>
                <ul className="space-y-4">
                  {[
                    "How to eliminate taxes on retirement income",
                    "Protect your wealth from market volatility",
                    "The Three Tax Buckets strategy",
                    "Living benefits you can access before age 59½",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                      <span className="text-base sm:text-lg" style={{ color: "#1A4D3E" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div>
              <div
                className="p-6 sm:p-8"
                style={{
                  border: "2px solid #1A4D3E",
                  borderRadius: "0px",
                  background: "#FFFFFF",
                }}
              >
                {submitted ? (
                  <div className="text-center py-8">
                    <div
                      className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                      style={{ background: "#10B981", borderRadius: "0px" }}
                    >
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
                      You're registered! ✓
                    </h3>
                    <p style={{ color: "#4A5565" }}>
                      Check your email for confirmation and calendar invite.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: "#1A4D3E" }}>
                      Reserve Your Spot
                    </h3>

                    {isFull && (
                      <div
                        className="p-4 mb-6 text-center"
                        style={{
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          borderRadius: "0px",
                          color: "#DC2626",
                        }}
                      >
                        <strong>This workshop is full.</strong>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                          First Name <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={form.first_name}
                          onChange={(e) => handleChange("first_name", e.target.value)}
                          disabled={isFull}
                          className="w-full px-4 py-3 text-base border outline-none transition-colors"
                          style={{
                            borderColor: errors.first_name ? "#DC2626" : "#E5E7EB",
                            borderRadius: "0px",
                            color: "#1A4D3E",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#1A4D3E")}
                          onBlur={(e) => (e.target.style.borderColor = errors.first_name ? "#DC2626" : "#E5E7EB")}
                          aria-required="true"
                          aria-invalid={!!errors.first_name}
                        />
                        {errors.first_name && (
                          <p className="text-sm mt-1" style={{ color: "#DC2626" }} role="alert">
                            {errors.first_name}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                          Last Name <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={form.last_name}
                          onChange={(e) => handleChange("last_name", e.target.value)}
                          disabled={isFull}
                          className="w-full px-4 py-3 text-base border outline-none transition-colors"
                          style={{
                            borderColor: errors.last_name ? "#DC2626" : "#E5E7EB",
                            borderRadius: "0px",
                            color: "#1A4D3E",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#1A4D3E")}
                          onBlur={(e) => (e.target.style.borderColor = errors.last_name ? "#DC2626" : "#E5E7EB")}
                          aria-required="true"
                          aria-invalid={!!errors.last_name}
                        />
                        {errors.last_name && (
                          <p className="text-sm mt-1" style={{ color: "#DC2626" }} role="alert">
                            {errors.last_name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                          Email <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          disabled={isFull}
                          className="w-full px-4 py-3 text-base border outline-none transition-colors"
                          style={{
                            borderColor: errors.email ? "#DC2626" : "#E5E7EB",
                            borderRadius: "0px",
                            color: "#1A4D3E",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#1A4D3E")}
                          onBlur={(e) => (e.target.style.borderColor = errors.email ? "#DC2626" : "#E5E7EB")}
                          aria-required="true"
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-sm mt-1" style={{ color: "#DC2626" }} role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A5565" }}>
                          Phone <span className="text-xs" style={{ color: "#9CA3AF" }}>(optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          disabled={isFull}
                          className="w-full px-4 py-3 text-base border outline-none transition-colors"
                          style={{
                            borderColor: "#E5E7EB",
                            borderRadius: "0px",
                            color: "#1A4D3E",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#1A4D3E")}
                          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={submitting || isFull || cooldown}
                        className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold text-white transition-opacity disabled:opacity-50"
                        style={{
                          background: "#1A4D3E",
                          borderRadius: "0px",
                          height: "48px",
                        }}
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Registering…
                          </span>
                        ) : (
                          "Reserve My Spot"
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Workshop Details card */}
              <div
                className="mt-6 p-6"
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "0px",
                  background: "#FFFFFF",
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: "#1A4D3E" }}>
                  Workshop Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                    <span style={{ color: "#4A5565" }}>{workshopDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                    <span style={{ color: "#4A5565" }}>
                      {workshopTime} {workshopTimezone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                    <span style={{ color: "#4A5565" }}>{workshopDuration} minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                    <span style={{ color: "#4A5565" }}>Live Online Workshop via Zoom</span>
                  </div>
                  {seatsRemaining !== null && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 flex-shrink-0" style={{ color: "#1A4D3E" }} />
                      <span
                        className="font-medium"
                        style={{ color: seatsRemaining <= 10 ? "#DC2626" : "#4A5565" }}
                      >
                        {seatsRemaining > 0
                          ? `${seatsRemaining} seats remaining`
                          : "This workshop is full"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ADVISOR CONTACT CARD ── */}
        <section style={{ background: "#F8FAF9" }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: "#1A4D3E" }}>
              Your Workshop Host
            </h2>
            <div
              className="inline-flex items-center gap-6 p-8 transition-shadow hover:shadow-lg"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "0px",
              }}
            >
              {advisor.photo_url ? (
                <img
                  src={advisor.photo_url}
                  alt={`${advisorName} photo`}
                  className="w-20 h-20 object-cover flex-shrink-0"
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <div
                  className="w-20 h-20 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                  style={{ background: "#1A4D3E", borderRadius: "50%" }}
                >
                  {advisor.first_name?.[0]}
                  {advisor.last_name?.[0]}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#1A4D3E" }}>
                  {advisorName}
                </h3>
                <p className="text-sm mb-3" style={{ color: "#4A5565" }}>
                  {advisor.title || "Wealth Strategist"}
                </p>
                <div className="space-y-1.5">
                  <a
                    href={`mailto:${advisor.email}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: "#1A4D3E" }}
                  >
                    <Mail className="w-4 h-4" /> {advisor.email}
                  </a>
                  {advisor.phone && (
                    <a
                      href={`tel:${advisor.phone}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                      style={{ color: "#1A4D3E" }}
                    >
                      <Phone className="w-4 h-4" /> {advisor.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST INDICATORS ── */}
        <section style={{ background: "#1A4D3E" }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: Shield, label: "Independent Fiduciary" },
                { icon: Award, label: "Established 1998" },
                { icon: Users, label: "75+ Carrier Partnerships" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Icon className="w-7 h-7" style={{ color: "#A7F3D0" }} />
                  <span className="text-white font-medium text-sm sm:text-base tracking-wide uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t" style={{ borderColor: "#E5E7EB" }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 text-center">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              © {new Date().getFullYear()} Everence Wealth. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default WorkshopLanding;
