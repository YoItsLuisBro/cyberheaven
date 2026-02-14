import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function VerifiedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isVerified } = useAuth();

  if (loading) return <div className="page">LOADING…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isVerified) return <Navigate to="/verify" replace />;
  return <>{children}</>;
}
