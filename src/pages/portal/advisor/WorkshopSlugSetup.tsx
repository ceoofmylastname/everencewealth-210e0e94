import { useState, useEffect, useCallback, useRef } from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, ExternalLink, Pencil, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BRAND_GREEN = "#1A4D3E";
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BASE_URL = "everencewealth.com";

type ValidationState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function WorkshopSlugSetup() {
  const { portalUser, loading: authLoading } = usePortalAuth();
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch advisor + slug data
  const fetchData = useCallback(async () => {
    if (!portalUser) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const { data: advisor, error: advErr } = await supabase
        .from("advisors")
        .select("id, first_name, last_name")
        .eq("auth_user_id", portalUser.auth_user_id)
        .limit(1)
        .maybeSingle();
      if (advErr) throw advErr;
      if (!advisor) throw new Error("Advisor record not found");

      setAdvisorId(advisor.id);
      setAdvisorName({ first: advisor.first_name, last: advisor.last_name });

      const { data: slug, error: slugErr } = await supabase
        .from("advisor_slugs")
        .select("slug")
        .eq("advisor_id", advisor.id)
        .eq("is_active", true)
        .maybeSingle();
      if (slugErr) throw slugErr;

      setExistingSlug(slug?.slug ?? null);
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

    const candidates = [
      `${f}-${l}`,
      `${f}${l}`,
      `${f}-${l.charAt(0)}`,
    ];

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
      toast.success("Landing page created!");
      setExistingSlug(slugInput);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create landing page");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${BASE_URL}/${existingSlug}`);
    toast.success("URL copied to clipboard");
  };

  const handlePreview = () => {
    window.open(`/${existingSlug}`, "_blank");
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

          <div
            className="border p-8"
            style={{ borderColor: BRAND_GREEN, borderRadius: 0 }}
          >
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
              Edit
            </button>
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
            Create My Landing Page
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
