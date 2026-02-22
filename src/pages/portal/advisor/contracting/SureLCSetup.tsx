import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  PlayCircle, ExternalLink, Upload, CheckCircle2, Loader2,
  ShieldCheck, AlertTriangle, Image as ImageIcon, Trophy, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Confetti Engine (self-contained, no deps) ────────────────
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const colors = ["#C9A84C", "#1A4D3E", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#82E0AA"];
  
  interface Particle {
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; rotation: number; rotSpeed: number;
    gravity: number; drag: number; shape: number; opacity: number;
  }

  const particles: Particle[] = [];
  const count = 200;

  // Shoot from both sides
  for (let i = 0; i < count; i++) {
    const fromLeft = i < count / 2;
    particles.push({
      x: fromLeft ? -10 : canvas.width + 10,
      y: canvas.height * (0.2 + Math.random() * 0.4),
      vx: (fromLeft ? 1 : -1) * (8 + Math.random() * 14),
      vy: -(4 + Math.random() * 10),
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.15 + Math.random() * 0.1,
      drag: 0.97 + Math.random() * 0.02,
      shape: Math.floor(Math.random() * 3),
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 180;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      if (frame > maxFrames * 0.6) p.opacity = Math.max(0, p.opacity - 0.02);

      if (p.opacity <= 0) continue;
      alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 0) {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    frame++;
    if (alive && frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(draw);
}

const BRAND = "#1A4D3E";
const ACCENT = "#C9A84C";
const SURELC_STEP_ID = "1e83a6c7-2d4f-4d09-b04f-4ee86fc47ac5";

const LINKS = [
  {
    key: "surelc_video_1",
    url: "https://www.youtube.com/watch?v=6Sc1qas71SU",
    label: "SureLC - Producer Registration Video Instructions",
    description: "Step-by-step instructions on how to register for a SureLC account",
    icon: PlayCircle,
    logDesc: "Watched SureLC Producer Registration video",
  },
  {
    key: "surelc_video_2",
    url: "https://www.youtube.com/watch?v=xWrbs1tcxsI",
    description: "Watch to understand how to select carriers and track appointment stages",
    label: "SureLC - How To Create A Contract Request",
    icon: PlayCircle,
    logDesc: "Watched SureLC Contract Request video",
  },
  {
    key: "surelc_register",
    url: "https://accounts.surancebay.com/oauth/authorize?redirect_uri=https:%2F%2Fsurelc.surancebay.com%2Fproducer%2Foauth%3FreturnUrl%3D%252Fprofile%252Fcontact-info%253FgaId%253D1031%2526gaId%253D1031%2526branch%253DAgora%252520Assurance%252520Solutions%2526branchVisible%253Dtrue%2526branchEditable%253Dfalse%2526branchRequired%253Dtrue%2526autoAdd%253Dfalse%2526requestMethod%253DGET&gaId=1031&client_id=surecrmweb&response_type=code&sessionId=ce45a5e2-44f3-47c7-898e-8235eff1096c&trigger_link=z7aLxcldHoywJvFk94z4",
    label: "Create Your SureLC Profile",
    description: "Click below to create your SureLC profile and get started",
    icon: ExternalLink,
    logDesc: "Clicked SureLC Registration link",
  },
];

interface SureLCSetupProps {
  agentId: string;
  firstName: string;
}

export default function SureLCSetup({ agentId, firstName }: SureLCSetupProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();

  // Restore persisted state on mount
  useEffect(() => {
    async function loadState() {
      try {
        const [logsRes, stepRes, docRes] = await Promise.all([
          supabase
            .from("contracting_activity_logs")
            .select("metadata")
            .eq("agent_id", agentId)
            .eq("action", "link_clicked"),
          supabase
            .from("contracting_agent_steps")
            .select("status")
            .eq("agent_id", agentId)
            .eq("step_id", SURELC_STEP_ID)
            .maybeSingle(),
          supabase
            .from("contracting_documents")
            .select("file_name")
            .eq("agent_id", agentId)
            .eq("step_id", SURELC_STEP_ID)
            .limit(1),
        ]);

        // Restore clicked links
        if (logsRes.data) {
          const clicked = new Set<string>();
          logsRes.data.forEach((log: any) => {
            const meta = log.metadata;
            if (meta && typeof meta === "object" && "link_type" in meta) {
              clicked.add(meta.link_type as string);
            }
          });
          setClickedLinks(clicked);
        }

        // Restore screenshot state
        if (stepRes.data?.status === "completed") {
          setScreenshotUploaded(true);
        }
        if (docRes.data && docRes.data.length > 0) {
          setScreenshotName(docRes.data[0].file_name);
        }
      } catch (err) {
        console.error("Error loading SureLC state:", err);
      } finally {
        setLoadingState(false);
      }
    }
    loadState();
  }, [agentId]);

  function getEmbedUrl(youtubeUrl: string) {
    const match = youtubeUrl.match(/[?&]v=([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : youtubeUrl;
  }

  // Track link click (fire-and-forget)
  function handleLinkClick(link: typeof LINKS[number]) {
    const isVideo = link.key.startsWith("surelc_video");

    if (isVideo) {
      setActiveVideo(prev => prev === link.key ? null : link.key);
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }

    // Non-blocking activity log
    setClickedLinks(prev => new Set(prev).add(link.key));
    supabase
      .from("contracting_activity_logs")
      .insert({
        agent_id: agentId,
        performed_by: agentId,
        action: "link_clicked",
        description: link.logDesc,
        metadata: {
          link_type: link.key,
          url: link.url,
          clicked_at: new Date().toISOString(),
        },
      })
      .then(null, (err) => console.error("Activity log error:", err));
  }

  // Upload screenshot
  async function handleUpload(file: File) {
    if (uploading) return;
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${agentId}/surelc/${Date.now()}_${safeName}`;

      // 1. Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from("contracting-documents")
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      // 2. Insert document record
      await supabase.from("contracting_documents").insert({
        agent_id: agentId,
        step_id: SURELC_STEP_ID,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        uploaded_by: agentId,
      });

      // 3. Mark step completed (triggers auto_advance_pipeline_stage)
      await supabase.from("contracting_agent_steps").upsert(
        {
          agent_id: agentId,
          step_id: SURELC_STEP_ID,
          status: "completed",
          completed_at: new Date().toISOString(),
          completed_by: agentId,
        },
        { onConflict: "agent_id,step_id" }
      );

      // 4. Activity log
      await supabase.from("contracting_activity_logs").insert({
        agent_id: agentId,
        performed_by: agentId,
        action: "document_uploaded",
        description: `Uploaded SureLC completion screenshot: ${file.name}`,
        metadata: {
          step_id: SURELC_STEP_ID,
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
        },
      });

      // 5. Notify manager via edge function
      supabase.functions
        .invoke("notify-contracting-step", {
          body: {
            agentId,
            stepTitle: "SureLC Setup Screenshot",
            action: "completed",
          },
        })
        .then(null, (err) => console.error("Notification error:", err));

      setScreenshotUploaded(true);
      setScreenshotName(file.name);
      toast.success("Screenshot uploaded! Click the button below to celebrate! 🎉");
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  if (loadingState) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* ── Header Banner ─────────────────────────────────── */}
      <div
        className="rounded-2xl p-8 text-white text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #2D6B5A 100%)` }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: ACCENT, transform: "translate(30%, -30%)" }} />
        <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-white/90" />
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Congratulations, {firstName}!
        </h1>
        <p className="text-white/80 text-sm">You've completed Step 1. Let's finish your onboarding.</p>
      </div>

      {/* ── Letter Body ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          <span className="font-semibold text-lg" style={{ color: BRAND }}>Hello {firstName},</span>
        </p>
        <p>
          Welcome to the <strong>Everence Wealth</strong>!
        </p>
        <p>
          {firstName}, congratulations on taking the first step in your journey with us by applying for the
          position and signing your agent agreement! We're excited to have you on board and look forward to
          supporting your success as you embark on this new opportunity. Welcome to the team!
        </p>

        {/* Step Indicator */}
        <div
          className="rounded-xl p-5 border-l-4"
          style={{ borderColor: ACCENT, background: "#FEFCE8" }}
        >
          <p className="font-bold text-base mb-1" style={{ color: BRAND }}>
            Next Steps: Getting Appointed with the Carriers. Steps 2 of 2
          </p>
          <p className="text-sm text-gray-600">
            {firstName}, please carefully review the videos below to fully understand the correct process
            for selecting carriers and accurately tracking each application's stage. This is critical to
            ensuring compliance and avoiding costly errors.
          </p>
        </div>

        {/* ── Action Buttons ──────────────────────────────── */}
        <div className="space-y-4">
          {LINKS.map((link, idx) => {
            const isClicked = clickedLinks.has(link.key);
            const Icon = link.icon;
            const isRegister = link.key === "surelc_register";

            return (
              <div key={link.key}>
                {/* Section description */}
                {idx === 0 && (
                  <p className="text-sm text-gray-600 mb-3 font-medium">
                    Step-by-step instructions on how to register for a SureLC account:
                  </p>
                )}
                {idx === 1 && (
                  <p className="text-sm text-gray-600 mb-3 mt-2">
                    Please watch the video below to ensure you fully understand how to select your carriers
                    and track the stages of your appointment.
                  </p>
                )}
                {idx === 2 && (
                  <p className="text-sm text-gray-600 mb-3 mt-2 font-medium">
                    Please click the button below to create your SureLC Profile:
                  </p>
                )}

                <button
                  onClick={() => handleLinkClick(link)}
                  className="w-full group relative rounded-xl border-2 p-5 text-left transition-all hover:shadow-md hover:translate-y-[-1px]"
                  style={{
                    borderColor: isClicked
                      ? "#22c55e"
                      : isRegister
                      ? BRAND
                      : ACCENT,
                    background: isRegister && !isClicked
                      ? `linear-gradient(135deg, ${BRAND} 0%, #2D6B5A 100%)`
                      : isClicked
                      ? "#f0fdf4"
                      : "#fffef5",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center"
                      style={{
                        background: isClicked
                          ? "#dcfce7"
                          : isRegister
                          ? "rgba(255,255,255,0.15)"
                          : `${ACCENT}20`,
                      }}
                    >
                      {isClicked ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Icon
                          className="h-6 w-6"
                          style={{ color: isRegister ? "#fff" : ACCENT }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: isRegister && !isClicked ? "#fff" : BRAND }}
                      >
                        {isRegister ? "Click to Register" : "Click to watch"} |{" "}
                        {link.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{
                          color: isRegister && !isClicked ? "rgba(255,255,255,0.7)" : "#6b7280",
                        }}
                      >
                        {link.description}
                      </p>
                    </div>
                    {isClicked && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full shrink-0">
                        ✓ Done
                      </span>
                    )}
                  </div>
                </button>

                {/* Inline video iframe */}
                {link.key.startsWith("surelc_video") && activeVideo === link.key && (
                  <div className="mt-3 rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={getEmbedUrl(link.url)}
                        title={link.label}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Screenshot Upload ───────────────────────────── */}
        <div className="pt-4 space-y-3">
          <div
            className="rounded-xl p-4 border-l-4"
            style={{ borderColor: BRAND, background: "#f0fdf4" }}
          >
            <p className="text-sm font-semibold" style={{ color: BRAND }}>
              Upload SureLC Completion Screenshot
            </p>
            <p className="text-xs text-gray-600 mt-1">
              After completing your SureLC profile, take a screenshot and upload it below to proceed.
            </p>
          </div>

          {screenshotUploaded ? (
            <div className="space-y-4">
              {/* Success indicator */}
              <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                <p className="font-semibold text-green-700 text-sm">Screenshot Uploaded!</p>
                {screenshotName && (
                  <p className="text-xs text-green-600">{screenshotName}</p>
                )}
              </div>

              {/* Celebration Button or Celebration Card */}
              {!showCelebration ? (
                <button
                  onClick={() => {
                    setShowCelebration(true);
                    fireConfetti();
                    // Fire again after a beat for extra drama
                    setTimeout(() => fireConfetti(), 600);
                    setTimeout(() => fireConfetti(), 1200);
                    // Reload after celebration
                    setTimeout(() => window.location.reload(), 5000);
                  }}
                  className="w-full rounded-xl p-5 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 animate-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #E8C74A 50%, ${ACCENT} 100%)`,
                    backgroundSize: "200% 200%",
                    boxShadow: `0 0 30px ${ACCENT}40, 0 4px 20px rgba(0,0,0,0.15)`,
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Trophy className="h-7 w-7" />
                    <span>🎉 Complete Your Onboarding 🎉</span>
                    <Sparkles className="h-7 w-7" />
                  </div>
                </button>
              ) : (
                <div
                  className="rounded-2xl p-8 text-center text-white space-y-4 animate-scale-in relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND} 0%, #2D6B5A 40%, #1A6B5A 100%)`,
                    boxShadow: `0 0 60px ${ACCENT}30, 0 8px 32px rgba(0,0,0,0.2)`,
                  }}
                >
                  {/* Decorative circles */}
                  <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-10" style={{ background: ACCENT, transform: "translate(-40%, -40%)" }} />
                  <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: ACCENT, transform: "translate(30%, 30%)" }} />
                  <div className="absolute top-1/2 right-4 w-20 h-20 rounded-full opacity-5" style={{ background: "#fff" }} />

                  {/* Trophy icon */}
                  <div
                    className="mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-fade-in"
                    style={{ background: `${ACCENT}30`, border: `3px solid ${ACCENT}` }}
                  >
                    <Trophy className="h-10 w-10" style={{ color: ACCENT }} />
                  </div>

                  {/* Main text */}
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <p className="text-3xl md:text-4xl font-black tracking-tight">
                      🎉 CONGRATULATIONS 🎉
                    </p>
                    <p className="text-2xl md:text-3xl font-extrabold" style={{ color: ACCENT }}>
                      {firstName}!
                    </p>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <p className="text-xl md:text-2xl font-bold">
                      You're officially a{" "}
                      <span style={{ color: ACCENT }} className="underline decoration-2 underline-offset-4">
                        Gladiator in a Suit
                      </span>
                      . 🛡️
                    </p>
                  </div>

                  <div className="animate-fade-in pt-2" style={{ animationDelay: "700ms" }}>
                    <p className="text-lg md:text-xl font-semibold text-white/90">
                      Let's go help families, <span style={{ color: ACCENT }}>{firstName}</span>! 💪🔥
                    </p>
                  </div>

                  <div className="animate-fade-in pt-3" style={{ animationDelay: "1000ms" }}>
                    <p className="text-sm text-white/60">
                      Your onboarding is complete. Redirecting you to your dashboard…
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                dragActive ? "border-green-400 bg-green-50 scale-[1.01]" : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
                disabled={uploading}
              />
              {uploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: BRAND }} />
                  <p className="text-sm text-gray-500">Uploading…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">
                    Drag & drop your screenshot here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Carrier Warning ─────────────────────────────── */}
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: "#FEF3C7" }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{firstName}</strong>, be sure to only request the carriers that are cleared by your
            manager. Completing additional contracting will greatly slow down your contracting process.
          </p>
        </div>

        {/* ── Closing ─────────────────────────────────────── */}
        <div className="pt-2">
          <p className="text-sm text-gray-600">Best Regards,</p>
          <p className="font-semibold" style={{ color: BRAND }}>
            Everence Wealth
          </p>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4 space-y-1">
        <p>Everence Wealth - 2 -</p>
        <p>Copyright &copy; {currentYear} Everence Wealth, All rights reserved.</p>
      </div>
    </div>
  );
}
