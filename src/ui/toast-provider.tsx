import React from "react";
import {
  ToastContext,
  type Toast,
  type ToastApi,
  type ToastKind,
} from "./toast-context";

function uid() {
  return crypto.randomUUID();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const api = React.useMemo<ToastApi>(() => {
    return {
      push(kind: ToastKind, message: string) {
        const id = uid();
        setToasts((t) => [...t, { id, kind, message }]);
        window.setTimeout(() => {
          setToasts((t) => t.filter((x) => x.id !== id));
        }, 3200);
      },
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toastStack" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <div className="toastK">{t.kind}</div>
            <div className="toastM">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
