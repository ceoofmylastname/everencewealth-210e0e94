import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isBefore, startOfToday } from "date-fns";
import { CalendarIcon, Info, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern" },
  { value: "America/Chicago", label: "Central" },
  { value: "America/Denver", label: "Mountain" },
  { value: "America/Los_Angeles", label: "Pacific" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
];

const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = [];
  for (let h = 1; h <= 12; h++) {
    for (const m of ["00", "15", "30", "45"]) {
      for (const p of ["AM", "PM"]) {
        const label = `${h}:${m} ${p}`;
        options.push({ value: label, label });
      }
    }
  }
  return options;
})();

interface FormErrors {
  title?: string;
  workshop_date?: string;
  workshop_time?: string;
  duration?: string;
  max_attendees?: string;
}

export default function WorkshopCreate() {
  const { portalUser, loading: authLoading } = usePortalAuth();
  const navigate = useNavigate();

  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [hasSlug, setHasSlug] = useState<boolean | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("Tax-Free Retirement Workshop");
  const [description, setDescription] = useState("");
  const [customHeadline, setCustomHeadline] = useState("");
  const [customSubheadline, setCustomSubheadline] = useState("");
  const [workshopDate, setWorkshopDate] = useState<Date | undefined>();
  const [workshopTime, setWorkshopTime] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [duration, setDuration] = useState(60);
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch advisor + slug data
  useEffect(() => {
    if (authLoading || !portalUser) return;
    (async () => {
      try {
        const { data: advisor, error: advErr } = await supabase
          .from("advisors")
          .select("id")
          .eq("auth_user_id", portalUser.auth_user_id)
          .limit(1)
          .maybeSingle();
        if (advErr) throw advErr;
        if (!advisor) {
          setDataError("Advisor profile not found.");
          setDataLoading(false);
          return;
        }
        setAdvisorId(advisor.id);

        const { data: slug, error: slugErr } = await supabase
          .from("advisor_slugs")
          .select("id")
          .eq("advisor_id", advisor.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (slugErr) throw slugErr;
        setHasSlug(!!slug);
      } catch (err: any) {
        setDataError(err.message || "Failed to load data.");
      } finally {
        setDataLoading(false);
      }
    })();
  }, [authLoading, portalUser]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = "Title is required";
    else if (title.length > 200) e.title = "Max 200 characters";
    if (!workshopDate) e.workshop_date = "Date is required";
    else if (isBefore(workshopDate, startOfToday())) e.workshop_date = "Must be a future date";
    if (!workshopTime) e.workshop_time = "Time is required";
    if (duration < 15 || duration > 240) e.duration = "Must be 15–240 minutes";
    if (maxAttendees < 1 || maxAttendees > 1000) e.max_attendees = "Must be 1–1,000";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched({ title: true, workshop_date: true, workshop_time: true, duration: true, max_attendees: true });
    if (Object.keys(v).length > 0) return;
    if (!advisorId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("workshops").insert({
        advisor_id: advisorId,
        title: title.trim(),
        description: description.trim() || null,
        workshop_date: format(workshopDate!, "yyyy-MM-dd"),
        workshop_time: workshopTime,
        timezone,
        duration_minutes: duration,
        max_attendees: maxAttendees,
        custom_headline: customHeadline.trim() || null,
        custom_subheadline: customSubheadline.trim() || null,
        status: "scheduled",
      });
      if (error) throw error;

      // Fetch the newly created workshop ID to navigate to its detail page
      const { data: newWorkshop } = await supabase
        .from("workshops")
        .select("id")
        .eq("advisor_id", advisorId)
        .eq("title", title.trim())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      toast.success("Workshop created! You can now add your Zoom link from the workshop detail page.");
      if (newWorkshop?.id) {
        navigate(`/portal/advisor/workshops/${newWorkshop.id}`);
      } else {
        navigate("/portal/advisor/workshops");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create workshop.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  // Re-validate on change when touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) setErrors(validate());
  }, [title, workshopDate, workshopTime, duration, maxAttendees, touched]);

  if (authLoading || dataLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-destructive">{dataError}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 rounded-none">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto" style={{ fontFamily: "'GeistSans', system-ui, sans-serif" }}>
      {/* Back link */}
      <Link
        to="/portal/advisor/workshops/slug-setup"
        className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
        style={{ color: "#1A4D3E" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Workshops
      </Link>

      <h1 className="text-3xl font-bold mb-2" style={{ color: "#1A4D3E" }}>Create Workshop</h1>

      {/* Slug pre-check */}
      {hasSlug === false && (
        <div className="border p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ borderColor: "#D97706", backgroundColor: "#FFFBEB" }}>
          <Info className="h-5 w-5 shrink-0" style={{ color: "#D97706" }} />
          <div className="flex-1">
            <p className="font-medium" style={{ color: "#92400E" }}>You need to set up your workshop landing page URL first.</p>
          </div>
          <Button asChild className="rounded-none text-white" style={{ backgroundColor: "#1A4D3E" }}>
            <Link to="/portal/advisor/workshops/slug-setup">Set Up Landing Page</Link>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={cn(hasSlug === false && "opacity-50 pointer-events-none")}>
        {/* Section 1: Basic Details */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#1A4D3E" }}>Basic Details</h2>

          <div className="space-y-5">
            <div>
              <Label htmlFor="title" className="font-medium">Workshop Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => markTouched("title")}
                maxLength={200}
                className="mt-1 rounded-none h-12 text-base"
              />
              {touched.title && errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
              <p className="text-muted-foreground text-xs mt-1">{title.length}/200</p>
            </div>

            <div>
              <Label htmlFor="description" className="font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what attendees will learn..."
                maxLength={1000}
                className="mt-1 rounded-none min-h-[120px] text-base"
              />
              <p className="text-muted-foreground text-xs mt-1">{description.length}/1000</p>
            </div>

            <div>
              <Label htmlFor="headline" className="font-medium">Custom Headline</Label>
              <Input
                id="headline"
                value={customHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                placeholder="Build Tax-Free Retirement Wealth"
                maxLength={150}
                className="mt-1 rounded-none h-12 text-base"
              />
              <p className="text-muted-foreground text-xs mt-1">This will appear on your workshop landing page · {customHeadline.length}/150</p>
            </div>

            <div>
              <Label htmlFor="subheadline" className="font-medium">Custom Subheadline</Label>
              <Input
                id="subheadline"
                value={customSubheadline}
                onChange={(e) => setCustomSubheadline(e.target.value)}
                placeholder="Join us for a complimentary workshop"
                maxLength={200}
                className="mt-1 rounded-none h-12 text-base"
              />
              <p className="text-muted-foreground text-xs mt-1">{customSubheadline.length}/200</p>
            </div>
          </div>
        </section>

        <hr className="mb-10 border-border" />

        {/* Section 2: Schedule */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#1A4D3E" }}>Schedule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date */}
            <div>
              <Label className="font-medium">Workshop Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => markTouched("workshop_date")}
                    className={cn(
                      "w-full mt-1 rounded-none h-12 justify-start text-left text-base font-normal",
                      !workshopDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {workshopDate ? format(workshopDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={workshopDate}
                    onSelect={(d) => { setWorkshopDate(d); markTouched("workshop_date"); }}
                    disabled={(date) => isBefore(date, startOfToday())}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {touched.workshop_date && errors.workshop_date && <p className="text-destructive text-sm mt-1">{errors.workshop_date}</p>}
            </div>

            {/* Time */}
            <div>
              <Label className="font-medium">Workshop Time <span className="text-destructive">*</span></Label>
              <Select value={workshopTime} onValueChange={(v) => { setWorkshopTime(v); markTouched("workshop_time"); }}>
                <SelectTrigger className="mt-1 rounded-none h-12 text-base">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.workshop_time && errors.workshop_time && <p className="text-destructive text-sm mt-1">{errors.workshop_time}</p>}
            </div>

            {/* Timezone */}
            <div>
              <Label className="font-medium">Timezone <span className="text-destructive">*</span></Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1 rounded-none h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration" className="font-medium">Duration <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  onBlur={() => markTouched("duration")}
                  min={15}
                  max={240}
                  className="rounded-none h-12 text-base"
                />
                <span className="text-muted-foreground text-sm whitespace-nowrap">minutes</span>
              </div>
              {touched.duration && errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration}</p>}
            </div>

            {/* Max Attendees */}
            <div>
              <Label htmlFor="max_attendees" className="font-medium">Max Attendees <span className="text-destructive">*</span></Label>
              <Input
                id="max_attendees"
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
                onBlur={() => markTouched("max_attendees")}
                min={1}
                max={1000}
                className="mt-1 rounded-none h-12 text-base"
              />
              {touched.max_attendees && errors.max_attendees && <p className="text-destructive text-sm mt-1">{errors.max_attendees}</p>}
            </div>
          </div>
        </section>

        <hr className="mb-10 border-border" />

        {/* Section 3: Zoom Details */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#1A4D3E" }}>Zoom Meeting Details</h2>
          <div className="border p-5 flex gap-3" style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}>
            <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#6B7280" }} />
            <div>
              <p className="font-medium text-foreground">Add your Zoom link after creating this workshop</p>
              <p className="text-muted-foreground text-sm mt-1">
                Once you create this workshop, you'll be taken to the workshop detail page where you can enter your Zoom Join URL and Passcode. This link will be included in the 10-minute reminder email sent to registrants.
              </p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || hasSlug === false}
          className="w-full h-14 text-lg font-semibold rounded-none text-white"
          style={{ backgroundColor: "#1A4D3E" }}
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          {isSubmitting ? "Creating…" : "Create Workshop"}
        </Button>
      </form>
    </div>
  );
}
