import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User, Camera, Save, LogOut, Crown, CreditCard, Shield, Mail, Loader2,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Settings() {
  const navigate = useNavigate();
  const { isPro } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url);
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(url);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (displayName.trim().length === 0) {
      toast.error("Display name cannot be empty");
      return;
    }
    if (displayName.trim().length > 50) {
      toast.error("Display name must be under 50 characters");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) return null;

  const initials = (displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and account</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card-premium">
          <CardHeader>
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> Profile
            </CardTitle>
            <CardDescription>Your public profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar className="h-20 w-20 ring-2 ring-border/50">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                  ) : (
                    <Camera className="h-5 w-5 text-foreground" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{displayName || "No name set"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs mt-1 h-7 px-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Change photo"}
                </Button>
              </div>
            </div>

            <Separator className="bg-border/30" />

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                className="bg-secondary/50 border-border/50"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-secondary/30 border-border/30 text-muted-foreground"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="btn-gradient">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card-premium">
          <CardHeader>
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" /> Subscription
            </CardTitle>
            <CardDescription>Manage your plan and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isPro ? "bg-primary/20" : "bg-secondary/50"}`}>
                  {isPro ? <Crown className="h-5 w-5 text-primary" /> : <Shield className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{isPro ? "Pro Plan" : "Free Plan"}</p>
                  <p className="text-xs text-muted-foreground">{isPro ? "$9/month • All features unlocked" : "Basic features"}</p>
                </div>
              </div>
              {isPro ? (
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Manage
                </Button>
              ) : (
                <Button size="sm" className="btn-gradient" onClick={() => navigate("/pricing")}>
                  Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card-premium">
          <CardHeader>
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
