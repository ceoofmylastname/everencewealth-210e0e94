import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

const phoneRegex = /^\(\d{3}\)\s?\d{3}-\d{4}$/;

const schema = z.object({
  assigned_advisor_id: z.string().min(1, "Please select an agent"),
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  marital_status: z.string().min(1, "Please select your marital status"),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().regex(phoneRegex, "Phone must be (000) 000-0000"),
  street_address: z.string().trim().min(1, "Street address is required").max(200),
  address_line_2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(50),
  zip_code: z.string().trim().min(1, "Zip code is required").max(20),
  income_range: z.string().min(1, "Please select your income range"),
  wants_free_consultation: z.string().min(1, "Please select an option"),
  meeting_topics: z.array(z.string()).min(1, "Select at least one topic"),
  availability: z.string().max(1000).optional().or(z.literal("")),
  comments: z.string().max(2000).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const BRAND_GREEN = "#1A4D3E";
const GOLD = "#C8A96E";
const SLATE = "#4A5565";

const maritalOptions = ["Single", "Married", "Separated", "Divorced", "Widowed"];
const incomeOptions = ["Less than $30k", "$30k – $50k", "$50k – $100k", "$100k+"];
const topicOptions = [
  "A comprehensive analysis of my current portfolio and advantages of converting to an indexed plan",
  "Tax-free retirement alternatives to IRAs, 401(k)s, etc.",
  "I want a second opinion on my current retirement plan",
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function ResponseCard() {
  const [advisors, setAdvisors] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      assigned_advisor_id: "",
      first_name: "",
      last_name: "",
      marital_status: "",
      email: "",
      phone: "",
      street_address: "",
      address_line_2: "",
      city: "",
      state: "",
      zip_code: "",
      income_range: "",
      wants_free_consultation: "",
      meeting_topics: [],
      availability: "",
      comments: "",
    },
  });

  const meetingTopics = watch("meeting_topics");

  useEffect(() => {
    supabase
      .from("advisors")
      .select("id, first_name, last_name")
      .eq("is_active", true)
      .order("first_name")
      .then(({ data }) => {
        if (data) setAdvisors(data);
      });
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("response_card_submissions" as any).insert({
        assigned_advisor_id: data.assigned_advisor_id,
        first_name: data.first_name,
        last_name: data.last_name,
        marital_status: data.marital_status,
        email: data.email,
        phone: data.phone,
        street_address: data.street_address || null,
        address_line_2: data.address_line_2 || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        income_range: data.income_range,
        wants_free_consultation: data.wants_free_consultation === "yes",
        meeting_topics: data.meeting_topics,
        availability: data.availability || null,
        comments: data.comments || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTopic = (topic: string) => {
    const current = meetingTopics || [];
    setValue(
      "meeting_topics",
      current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic],
      { shouldValidate: true }
    );
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D3E] focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-semibold mb-1.5";
  const errorClass = "text-red-600 text-xs mt-1";
  const requiredStar = <span className="text-red-500 ml-0.5">*</span>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 py-20">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: BRAND_GREEN }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_GREEN }}>Thank You</h2>
          <p className="text-gray-600">
            Your response has been received. Your agent will be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-8 px-4" style={{ background: BRAND_GREEN }}>
        <div className="max-w-2xl mx-auto text-center">
          <img
            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
            alt="Everence Wealth"
            className="h-10 w-auto mx-auto mb-4 brightness-0 invert"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Response Card</h1>
          <p className="text-white/70 text-sm mt-2">Please complete this form after your presentation</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Agent Select */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>
              Who invited you to this presentation?{requiredStar}
            </label>
            <select {...register("assigned_advisor_id")} className={inputClass}>
              <option value="">Select an agent</option>
              {advisors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
            {errors.assigned_advisor_id && <p className={errorClass}>{errors.assigned_advisor_id.message}</p>}
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: SLATE }}>First Name{requiredStar}</label>
              <input {...register("first_name")} className={inputClass} />
              {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
            </div>
            <div>
              <label className={labelClass} style={{ color: SLATE }}>Last Name{requiredStar}</label>
              <input {...register("last_name")} className={inputClass} />
              {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Marital Status */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>Marital Status{requiredStar}</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {maritalOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: SLATE }}>
                  <input type="radio" value={opt} {...register("marital_status")} className="accent-[#1A4D3E]" />
                  {opt}
                </label>
              ))}
            </div>
            {errors.marital_status && <p className={errorClass}>{errors.marital_status.message}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: SLATE }}>Email Address{requiredStar}</label>
              <input type="email" {...register("email")} className={inputClass} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass} style={{ color: SLATE }}>Phone Number{requiredStar}</label>
              <input
                {...register("phone")}
                className={inputClass}
                placeholder="(000) 000-0000"
                onChange={(e) => setValue("phone", formatPhone(e.target.value), { shouldValidate: true })}
              />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <label className={labelClass} style={{ color: SLATE }}>Address{requiredStar}</label>
            <input {...register("street_address")} placeholder="Street Address" className={inputClass} />
            {errors.street_address && <p className={errorClass}>{errors.street_address.message}</p>}
            <input {...register("address_line_2")} placeholder="Street Address Line 2 (optional)" className={inputClass} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <input {...register("city")} placeholder="City" className={inputClass} />
                {errors.city && <p className={errorClass}>{errors.city.message}</p>}
              </div>
              <div>
                <input {...register("state")} placeholder="State" className={inputClass} />
                {errors.state && <p className={errorClass}>{errors.state.message}</p>}
              </div>
              <div>
                <input {...register("zip_code")} placeholder="Zip Code" className={inputClass} />
                {errors.zip_code && <p className={errorClass}>{errors.zip_code.message}</p>}
              </div>
            </div>
          </div>

          {/* Income */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>Household Income{requiredStar}</label>
            <div className="space-y-2 mt-1">
              {incomeOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: SLATE }}>
                  <input type="radio" value={opt} {...register("income_range")} className="accent-[#1A4D3E]" />
                  {opt}
                </label>
              ))}
            </div>
            {errors.income_range && <p className={errorClass}>{errors.income_range.message}</p>}
          </div>

          {/* Consultation */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>
              I would like to take advantage of a FREE Consultation and Financial Analysis{requiredStar}
            </label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: SLATE }}>
                <input type="radio" value="yes" {...register("wants_free_consultation")} className="accent-[#1A4D3E]" />
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: SLATE }}>
                <input type="radio" value="no" {...register("wants_free_consultation")} className="accent-[#1A4D3E]" />
                No
              </label>
            </div>
            {errors.wants_free_consultation && <p className={errorClass}>{errors.wants_free_consultation.message}</p>}
          </div>

          {/* Meeting Topics */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>
              Meeting Topics (check all that apply){requiredStar}
            </label>
            <div className="space-y-2 mt-1">
              {topicOptions.map((topic) => (
                <label key={topic} className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: SLATE }}>
                  <input
                    type="checkbox"
                    checked={meetingTopics?.includes(topic) || false}
                    onChange={() => toggleTopic(topic)}
                    className="accent-[#1A4D3E] mt-0.5"
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
            {errors.meeting_topics && <p className={errorClass}>{errors.meeting_topics.message}</p>}
          </div>

          {/* Availability */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>
              Best Day and Time to Meet
            </label>
            <p className="text-xs text-gray-400 mb-1.5">Please provide 2–3 available times</p>
            <textarea {...register("availability")} rows={3} className={inputClass} />
          </div>

          {/* Comments */}
          <div>
            <label className={labelClass} style={{ color: SLATE }}>
              Additional Comments or Questions
            </label>
            <textarea {...register("comments")} rows={3} className={inputClass} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-60"
            style={{ background: submitting ? "#6B7280" : BRAND_GREEN }}
          >
            {submitting ? "Submitting..." : "Submit Response Card"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-6 text-center border-t border-gray-100">
        <p className="text-xs" style={{ color: SLATE }}>
          © {new Date().getFullYear()} Everence Wealth. All rights reserved.
        </p>
      </div>
    </div>
  );
}
