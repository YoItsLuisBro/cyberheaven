import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { router } from "./router";
import { ToastProvider } from "./ui/toast";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { FocusProvider } from "./lib/focus";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <FocusProvider>
            <RouterProvider router={router} />
          </FocusProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
