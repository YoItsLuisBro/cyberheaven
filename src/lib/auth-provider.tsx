import type { Session } from "@supabase/supabase-js";
import React from "react";
import { AuthContext, isEmailVerified } from "./auth-context";
import { fetchMyProfile, signedAvatarUrl, type Profile } from "./profile";
import { supabase } from "./supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const user = session?.user ?? null;
  const verified = isEmailVerified(user);

  const refreshProfile = React.useCallback(async () => {
    if (!user) {
      setProfile(null);
      setAvatarUrl(null);
      return;
    }

    setProfileLoading(true);
    try {
      // Try fetch profile
      const res = await fetchMyProfile();

      // If missing, create (trigger should do this; this is a safety net)
      if (res.error) {
        await supabase.schema("core").from("profiles").insert({ id: user.id });
      }

      const res2 = await fetchMyProfile();
      if (res2.error) throw res2.error;

      setProfile(res2.data);

      if (res2.data.avatar_path) {
        const url = await signedAvatarUrl(res2.data.avatar_path);
        setAvatarUrl(url);
      } else {
        setAvatarUrl(null);
      }
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
      },
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isVerified: verified,
        profile,
        profileLoading,
        avatarUrl,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
