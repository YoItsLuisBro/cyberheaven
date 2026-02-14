import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./app/AppShell";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { Deadline } from "./routes/Deadline";
import { Home } from "./routes/Home";
import { Logbook } from "./routes/Logbook";
import { Profile } from "./routes/Profile";
import { AuthCallback } from "./routes/auth/AuthCallback";
import { Login } from "./routes/auth/Login";
import { Signup } from "./routes/auth/Signup";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/auth/callback", element: <AuthCallback /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "deadline", element: <Deadline /> },
      { path: "logbook", element: <Logbook /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);
