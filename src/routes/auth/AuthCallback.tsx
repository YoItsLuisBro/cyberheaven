import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type OtpType =
  | "email"
  | "recovery"
  | "invite"
  | "email_change"
  | "signup"
  | "magiclink";
function isOtpType(x: string): x is OtpType {
  return [
    "email",
    "recovery",
    "invite",
    "email_change",
    "signup",
    "magiclink",
  ].includes(x);
}

export function AuthCallback() {
  const nav = useNavigate();
  const [status, setStatus] = React.useState("VERIFYING…");

  React.useEffect(() => {
    async function run() {
      try {
        const url = new URL(window.location.href);

        const code = url.searchParams.get("code");
        const tokenHash =
          url.searchParams.get("token_hash") ?? url.searchParams.get("token");
        const type = url.searchParams.get("type");

        // 1) PKCE code exchange
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        // 2) Email verification / recovery links often use token_hash + type
        else if (tokenHash && type && isOtpType(type)) {
          const { error } = await supabase.auth.verifyOtp({
            type: type === "signup" ? "email" : type, // normalize older types
            token_hash: tokenHash,
          });
          if (error) throw error;
        } else {
          // 3) Fallback
          await supabase.auth.getSession();
        }

        setStatus("DONE. SENDING YOU HOME…");
        nav("/", { replace: true });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";

        // PKCE hint from Supabase docs: must be same browser/device
        if (msg.toLowerCase().includes("code verifier")) {
          setStatus(
            "VERIFICATION FAILED. OPEN THE LINK IN THE SAME BROWSER/DEVICE WHERE YOU SIGNED UP (NOT INCOGNITO).",
          );
        } else {
          setStatus("VERIFICATION FAILED. TRY THE LINK AGAIN OR LOG IN.");
        }
      }
    }

    void run();
  }, [nav]);

  return <div className="page">{status}</div>;
}
