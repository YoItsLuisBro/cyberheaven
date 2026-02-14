import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function AuthCallback() {
  const nav = useNavigate();
  const [status, setStatus] = React.useState("VERIFYING…");

  React.useEffect(() => {
    async function run() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // PKCE email verification returns `?code=...`
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Fallback: ensure we have a session if the provider used a different flow.
          await supabase.auth.getSession();
        }

        setStatus("DONE. SENDING YOU HOME…");
        nav("/", { replace: true });
      } catch {
        setStatus("VERIFICATION FAILED. TRY THE LINK AGAIN OR LOG IN.");
      }
    }

    void run();
  }, [nav]);

  return <div className="page">{status}</div>;
}
