"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    async function completeSignIn() {
      const supabase = createSupabaseBrowserClient();

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const next = url.searchParams.get("next") ?? "/dashboard";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setMessage(error.message);
          window.location.assign(
            `/admin/login?error=${encodeURIComponent(error.message)}`
          );
          return;
        }

        window.location.assign(next);
        return;
      }

      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        const errorMessage = "Missing magic link session tokens.";
        setMessage(errorMessage);
        window.location.assign(
          `/admin/login?error=${encodeURIComponent(errorMessage)}`
        );
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setMessage(error.message);
        window.location.assign(
          `/admin/login?error=${encodeURIComponent(error.message)}`
        );
        return;
      }

      window.history.replaceState(null, "", window.location.pathname);
      window.location.assign(next);
    }

    completeSignIn();
  }, []);

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold">Signing you in</h1>
        <p className="text-gray-600">{message}</p>
      </section>
    </main>
  );
}