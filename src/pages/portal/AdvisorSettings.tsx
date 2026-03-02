import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Camera, Loader2, User } from "lucide-react";

export default function AdvisorSettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Photo upload state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [advisorId, setAdvisorId] = useState<string | null>(null);

  // Load current advisor photo
  useEffect(() => {
    const loadAdvisorPhoto = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: portalUser } = await supabase
        .from("portal_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("role", "advisor")
        .maybeSingle();

      if (!portalUser) return;

      const { data: advisor } = await supabase
        .from("advisors")
        .select("id, photo_url")
        .eq("portal_user_id", portalUser.id)
        .maybeSingle();

      if (advisor) {
        setAdvisorId(advisor.id);
        setPhotoUrl(advisor.photo_url);
      }
    };
    loadAdvisorPhoto();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !advisorId) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${advisorId}/headshot-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("advisor-photos")
        .upload(filename, file, { contentType: file.type, cacheControl: "31536000", upsert: true });

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

      setPhotoUrl(newUrl);
      toast({ title: "Success", description: "Your photo has been updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload photo", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Success", description: "Your password has been updated" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "#1A4D3E", fontFamily: "'Playfair Display', serif" }}>
        Settings
      </h1>

      {/* Photo Upload Card */}
      <Card className="max-w-lg shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a professional headshot. This will appear on your public workshop landing pages.
          </p>
          <div className="flex items-center gap-6">
            {/* Photo preview */}
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: photoUrl ? "transparent" : "linear-gradient(135deg, #1A4D3E, #2D6B5A)" }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Your photo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white/60" />
                )}
              </div>
              {/* Gold ring around photo */}
              {photoUrl && (
                <div
                  className="absolute -inset-[3px] rounded-2xl pointer-events-none"
                  style={{ border: "3px solid #EDDB77" }}
                />
              )}
            </div>

            {/* Upload button */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all hover:opacity-90"
                style={{ background: "#1A4D3E", color: "white" }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    {photoUrl ? "Change Photo" : "Upload Photo"}
                  </>
                )}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG · Max 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="max-w-lg shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] rounded-2xl border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="rounded-xl"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={loading} className="w-full rounded-xl">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
