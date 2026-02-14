import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page">LOADING…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
