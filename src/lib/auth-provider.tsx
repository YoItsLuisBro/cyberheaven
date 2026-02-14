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
      // 1) Try fetch
      const res = await fetchMyProfile(user.id);
      if (res.error) throw res.error;

      // 2) If missing, create it and fetch again
      if (!res.data) {
        const up = await supabase
          .schema("core")
          .from("profiles")
          .upsert({ id: user.id }, { onConflict: "id" });

        if (up.error) throw up.error;

        const res2 = await fetchMyProfile(user.id);
        if (res2.error) throw res2.error;

        // Guard: could still be null if RLS denies or something is wrong
        if (!res2.data) {
          setProfile(null);
          setAvatarUrl(null);
          return;
        }

        setProfile(res2.data);

        if (res2.data.avatar_path) {
          const url = await signedAvatarUrl(res2.data.avatar_path);
          setAvatarUrl(url);
        } else {
          setAvatarUrl(null);
        }

        return;
      }

      // 3) Normal path
      setProfile(res.data);

      if (res.data.avatar_path) {
        const url = await signedAvatarUrl(res.data.avatar_path);
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
