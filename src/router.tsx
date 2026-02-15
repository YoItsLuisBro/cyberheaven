import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./app/AppShell";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { VerifiedRoute } from "./app/VerifiedRoute";
import { Deadline } from "./routes/Deadline";
import { Home } from "./routes/Home";
import { Logbook } from "./routes/Logbook";
import { Profile } from "./routes/Profile";
import { AuthCallback } from "./routes/auth/AuthCallback";
import { ForgotPassword } from "./routes/auth/ForgotPassword";
import { Login } from "./routes/auth/Login";
import { ResetPassword } from "./routes/auth/ResetPassword";
import { Signup } from "./routes/auth/Signup";
import { VerifyEmail } from "./routes/auth/VerifyEmail";
import { Settings } from "./routes/Settings";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot", element: <ForgotPassword /> },

  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/auth/reset", element: <ResetPassword /> },
  

  // Signed in but not verified can access this
  {
    path: "/verify",
    element: (
      <ProtectedRoute>
        <VerifyEmail />
      </ProtectedRoute>
    ),
  },

  // App requires verified email
  {
    path: "/",
    element: (
      <VerifiedRoute>
        <AppShell />
      </VerifiedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "deadline", element: <Deadline /> },
      { path: "logbook", element: <Logbook /> },
      { path: "profile", element: <Profile /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
]);
