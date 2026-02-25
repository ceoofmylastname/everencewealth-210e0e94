import { useState, useEffect, useCallback, useRef } from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, ExternalLink, Pencil, Check, X, Loader2, RefreshCw, Camera, User, Mail, Phone, Calendar, Plus, LayoutDashboard, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const BRAND_GREEN = "#1A4D3E";
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BASE_URL = "everencewealth.com";

type ValidationState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function WorkshopSlugSetup() {
  const { portalUser, loading: authLoading } = usePortalAuth();
  const navigate = useNavigate();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [advisorName, setAdvisorName] = useState<{ first: string; last: string } | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form state
  const [slugInput, setSlugInput] = useState("");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Profile editing state
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [nextWorkshop, setNextWorkshop] = useState<{ title: string; date: string; time: string } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch advisor + slug data
  const fetchData = useCallback(async () => {
    if (!portalUser) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const { data: advisor, error: advErr } = await supabase
        .from("advisors")
        .select("id, first_name, last_name, email, phone, photo_url")
        .eq("auth_user_id", portalUser.auth_user_id)
        .limit(1)
        .maybeSingle();
      if (advErr) throw advErr;
      if (!advisor) throw new Error("Advisor record not found");

      setAdvisorId(advisor.id);
      setAdvisorName({ first: advisor.first_name, last: advisor.last_name });
      setProfileEmail(advisor.email || "");
      setProfilePhone(advisor.phone || "");
      setProfilePhotoUrl(advisor.photo_url);

      const { data: slug, error: slugErr } = await supabase
        .from("advisor_slugs")
        .select("slug")
        .eq("advisor_id", advisor.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (slugErr) throw slugErr;
      setExistingSlug(slug?.slug ?? null);

      // Fetch next upcoming workshop
      const { data: workshop } = await supabase
        .from("workshops")
        .select("title, workshop_date, workshop_time")
        .eq("advisor_id", advisor.id)
        .gte("workshop_date", new Date().toISOString().split("T")[0])
        .order("workshop_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (workshop) {
        setNextWorkshop({
          title: workshop.title,
          date: workshop.workshop_date,
          time: workshop.workshop_time || "",
        });
      }
    } catch (err: any) {
      console.error("Error loading workshop data:", err);
      setPageError(err.message || "Failed to load data");
    } finally {
      setPageLoading(false);
    }
  }, [portalUser]);

  useEffect(() => {
    if (!authLoading && portalUser) fetchData();
    else if (!authLoading && !portalUser) setPageLoading(false);
  }, [authLoading, portalUser, fetchData]);

  // Generate suggestions when advisor name is loaded
  useEffect(() => {
    if (!advisorName || existingSlug) return;
    const f = advisorName.first.toLowerCase().replace(/[^a-z0-9]/g, "");
    const l = advisorName.last.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!f || !l) return;

    const candidates = [`${f}-${l}`, `${f}${l}`, `${f}-${l.charAt(0)}`];

    setSuggestionsLoading(true);
    Promise.all(
      candidates.map(async (s) => {
        const { data } = await supabase
          .from("advisor_slugs")
          .select("id")
          .eq("slug", s)
          .eq("is_active", true)
          .maybeSingle();
        return data ? null : s;
      })
    ).then((results) => {
      setSuggestions(results.filter(Boolean) as string[]);
      setSuggestionsLoading(false);
    });
  }, [advisorName, existingSlug]);

  // Validate slug input
  const validateSlug = (value: string): { valid: boolean; message: string } => {
    if (value.length === 0) return { valid: false, message: "" };
    if (value.length < 3) return { valid: false, message: "Must be 3-50 characters" };
    if (value.length > 50) return { valid: false, message: "Must be 3-50 characters" };
    if (value.startsWith("-") || value.endsWith("-")) return { valid: false, message: "Cannot start or end with hyphen" };
    if (!SLUG_REGEX.test(value)) return { valid: false, message: "Only lowercase letters, numbers, and hyphens" };
    return { valid: true, message: "" };
  };

  const checkAvailability = useCallback(async (slug: string) => {
    setValidationState("checking");
    try {
      const { data } = await supabase
        .from("advisor_slugs")
        .select("id")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (data) {
        setValidationState("taken");
        setValidationMessage("This URL is already taken");
      } else {
        setValidationState("available");
        setValidationMessage("Available! ✓");
      }
    } catch {
      setValidationState("idle");
      setValidationMessage("Could not check availability");
    }
  }, []);

  const handleSlugChange = (raw: string) => {
    const value = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const { valid, message } = validateSlug(value);
    if (!valid) {
      setValidationState(message ? "invalid" : "idle");
      setValidationMessage(message);
      return;
    }
    setValidationState("checking");
    setValidationMessage("");
    debounceRef.current = setTimeout(() => checkAvailability(value), 500);
  };

  const handleCreate = async () => {
    if (!advisorId || validationState !== "available") return;
    setIsCreating(true);
    try {
      // If editing, deactivate the old slug first
      if (isEditing && existingSlug) {
        const { error: deactivateErr } = await supabase
          .from("advisor_slugs")
          .update({ is_active: false })
          .eq("advisor_id", advisorId)
          .eq("slug", existingSlug)
          .eq("is_active", true);
        if (deactivateErr) throw deactivateErr;
      }

      const { error } = await supabase.from("advisor_slugs").insert({
        advisor_id: advisorId,
        slug: slugInput.trim().toLowerCase(),
        is_active: true,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("This URL was just taken. Please try another.");
          setValidationState("taken");
          setValidationMessage("This URL was just taken");
        } else {
          throw error;
        }
        return;
      }
      toast.success(isEditing ? "URL updated!" : "Landing page created!");
      setExistingSlug(slugInput);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save URL");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!advisorId || !existingSlug) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("advisor_slugs")
        .update({ is_active: false })
        .eq("advisor_id", advisorId)
        .eq("slug", existingSlug)
        .eq("is_active", true);
      if (error) throw error;
      toast.success("URL deleted");
      setExistingSlug(null);
      setShowDeleteConfirm(false);
      setSlugInput("");
      setValidationState("idle");
      setValidationMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete URL");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${BASE_URL}/${existingSlug}`);
    toast.success("URL copied to clipboard");
  };

  const handlePreview = () => {
    window.open(`/${existingSlug}`, "_blank");
  };

  // Profile handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !advisorId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${advisorId}/headshot-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("advisor-photos")
        .upload(filename, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("advisor-photos")
        .getPublicUrl(filename);

      const newUrl = publicUrlData?.publicUrl;
      if (!newUrl) throw new Error("Failed to get public URL");

      const { error: updateError } = await supabase
        .from("advisors")
        .update({ photo_url: newUrl })
        .eq("id", advisorId);
      if (updateError) throw updateError;

      setProfilePhotoUrl(newUrl);
      toast.success("Photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!advisorId) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("advisors")
        .update({ email: profileEmail, phone: profilePhone })
        .eq("id", advisorId);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Loading state
  if (authLoading || pageLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  // Error state
  if (pageError) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-red-600 text-lg">{pageError}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
          style={{ backgroundColor: BRAND_GREEN, borderRadius: 0 }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // Management view
  if (existingSlug && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: BRAND_GREEN }}>
              Your Workshop Landing Page
            </h1>
            <p className="text-green-700 mt-2 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Your workshop landing page is ready!
            </p>
          </div>

          {/* URL Display */}
          <div className="border p-8" style={{ borderColor: BRAND_GREEN, borderRadius: 0 }}>
            <p className="text-sm text-gray-500 mb-2">Your URL</p>
            <p
              className="font-bold break-all"
              style={{ fontSize: "clamp(24px, 4vw, 48px)", color: BRAND_GREEN, lineHeight: 1.2 }}
            >
              {BASE_URL}/{existingSlug}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
              style={{ backgroundColor: BRAND_GREEN, borderRadius: 0 }}
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
            <button
              onClick={handlePreview}
              className="inline-flex items-center gap-2 px-6 py-3 border font-medium"
              style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, borderRadius: 0 }}
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => {
                setIsEditing(true);
                setSlugInput("");
                setValidationState("idle");
                setValidationMessage("");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 border font-medium"
              style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, borderRadius: 0 }}
            >
              <Pencil className="w-4 h-4" />
              Edit URL
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border font-medium text-red-600 border-red-300 hover:bg-red-50 transition-colors"
              style={{ borderRadius: 0 }}
            >
              <Trash2 className="w-4 h-4" />
              Delete URL
            </button>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="border border-red-300 bg-red-50 p-4 space-y-3" style={{ borderRadius: 0 }}>
              <p className="text-sm text-red-800 font-medium">
                Are you sure you want to delete this URL? Your workshop landing page will no longer be accessible at this address.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-white font-medium text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  style={{ borderRadius: 0 }}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2 border font-medium text-sm"
                  style={{ borderColor: "#d1d5db", borderRadius: 0 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Landing Page Profile Section */}
          <div className="border p-6 space-y-6" style={{ borderColor: "#e5e7eb", borderRadius: 0 }}>
            <h2 className="text-xl font-bold" style={{ color: BRAND_GREEN }}>
              Landing Page Profile
            </h2>
            <p className="text-sm text-gray-500">
              This information appears on your public workshop landing page.
            </p>

            {/* Photo + Name row */}
            <div className="flex items-start gap-6">
              <div className="relative group shrink-0">
                <div
                  className="w-24 h-24 overflow-hidden flex items-center justify-center"
                  style={{
                    borderRadius: 0,
                    background: profilePhotoUrl ? "transparent" : `linear-gradient(135deg, ${BRAND_GREEN}, #2D6B5A)`,
                  }}
                >
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Your photo" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white/60" />
                  )}
                </div>
                <label
                  htmlFor="profile-photo-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ borderRadius: 0 }}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </label>
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Name (set by admin)</p>
                <p className="text-lg font-semibold" style={{ color: BRAND_GREEN }}>
                  {advisorName ? `${advisorName.first} ${advisorName.last}` : "—"}
                </p>
                <p className="text-xs text-gray-400">
                  Hover over photo to change · JPG, PNG, WebP · Max 5MB
                </p>
              </div>
            </div>

            {/* Email + Phone fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4" />
                  Display Email
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 border text-sm outline-none focus:ring-2"
                  style={{ borderRadius: 0, borderColor: "#d1d5db" }}
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4" />
                  Display Phone
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2.5 border text-sm outline-none focus:ring-2"
                  style={{ borderRadius: 0, borderColor: "#d1d5db" }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white font-medium text-sm disabled:opacity-50"
              style={{ backgroundColor: BRAND_GREEN, borderRadius: 0 }}
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>

          {/* Workshops Quick Section */}
          <div className="border p-6 space-y-4" style={{ borderColor: "#e5e7eb", borderRadius: 0 }}>
            <h2 className="text-xl font-bold" style={{ color: BRAND_GREEN }}>
              Workshops
            </h2>

            {nextWorkshop && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200" style={{ borderRadius: 0 }}>
                <Calendar className="w-5 h-5 text-green-700 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Next: {nextWorkshop.title}</p>
                  <p className="text-xs text-green-600">
                    {new Date(nextWorkshop.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {nextWorkshop.time && ` · ${nextWorkshop.time}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/portal/advisor/workshops/create")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm"
                style={{ backgroundColor: BRAND_GREEN, borderRadius: 0 }}
              >
                <Plus className="w-4 h-4" />
                Create Workshop
              </button>
              <button
                onClick={() => navigate("/portal/advisor/workshops")}
                className="inline-flex items-center gap-2 px-5 py-2.5 border font-medium text-sm"
                style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, borderRadius: 0 }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Manage Workshops
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Creation / Edit form
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: BRAND_GREEN }}>
            Set Up Your Workshop Landing Page
          </h1>
          <p className="text-gray-600 mt-2">
            Choose a custom URL where clients can register for your workshops
          </p>
        </div>

        {/* Slug input */}
        <div className="space-y-2">
          <label htmlFor="slug-input" className="block text-sm font-medium text-gray-700">
            Your Custom URL
          </label>
          <div className="flex items-stretch border" style={{ borderRadius: 0, borderColor: validationState === "taken" || validationState === "invalid" ? "#dc2626" : validationState === "available" ? "#16a34a" : "#d1d5db" }}>
            <span
              className="flex items-center px-4 text-sm font-medium text-white shrink-0"
              style={{ backgroundColor: BRAND_GREEN, borderRadius: 0 }}
            >
              {BASE_URL}/
            </span>
            <input
              id="slug-input"
              type="text"
              value={slugInput}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="your-name"
              className="flex-1 px-4 py-3 text-lg outline-none bg-transparent"
              style={{ borderRadius: 0 }}
              maxLength={50}
              aria-describedby="slug-validation"
              autoComplete="off"
            />
            <span className="flex items-center px-3">
              {validationState === "checking" && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
              {validationState === "available" && <Check className="w-5 h-5 text-green-600" />}
              {(validationState === "taken" || validationState === "invalid") && <X className="w-5 h-5 text-red-600" />}
            </span>
          </div>
          <p
            id="slug-validation"
            role="alert"
            className={`text-sm ${validationState === "available" ? "text-green-600" : validationState === "taken" || validationState === "invalid" ? "text-red-600" : "text-gray-500"}`}
          >
            {validationMessage || (slugInput.length === 0 ? "Must be 3-50 characters" : "\u00A0")}
          </p>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSlugInput(s);
                    setValidationState("available");
                    setValidationMessage("Available! ✓");
                  }}
                  className="px-4 py-2 text-sm border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, borderRadius: 0 }}
                >
                  {BASE_URL}/{s}
                </button>
              ))}
            </div>
          </div>
        )}
        {suggestionsLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading suggestions...
          </div>
        )}

        {/* Create button */}
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={validationState !== "available" || isCreating}
            className="inline-flex items-center gap-2 px-8 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND_GREEN, borderRadius: 0 }}
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? "Update URL" : "Create My Landing Page"}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setSlugInput("");
                setValidationState("idle");
                setValidationMessage("");
              }}
              className="px-6 py-3 border font-medium"
              style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, borderRadius: 0 }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
