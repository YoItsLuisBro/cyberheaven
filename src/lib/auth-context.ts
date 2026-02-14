import React from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "./profile";

export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;

  isVerified: boolean;

  profile: Profile | null;
  profileLoading: boolean;
  avatarUrl: string | null;
  refreshProfile: () => Promise<void>;

  signOut: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthState | undefined>(
  undefined,
);

export function isEmailVerified(user: User | null): boolean {
  if (!user) return false;
  // Supabase email auth uses email_confirmed_at; some projects also have confirmed_at.
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
