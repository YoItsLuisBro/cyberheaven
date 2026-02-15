import React from "react";

export type ToastKind = "OK" | "WARN" | "ERR";

export type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
};

export type ToastApi = {
  push: (kind: ToastKind, message: string) => void;
};

export const ToastContext = React.createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
