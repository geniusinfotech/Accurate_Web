"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const code = searchParams.get("code");

      if (error) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          errorDescription ||
            error ||
            "Google sign-in was cancelled or encountered an issue.",
        );
        return;
      }

      try {
        // If an authorization code was returned directly to the frontend URL,
        // perform Server-Side Authorization Code exchange via the backend
        if (code) {
          const redirectUri = window.location.origin + window.location.pathname;
          await apiRequest("/api/auth/google", {
            method: "POST",
            body: JSON.stringify({ code, redirectUri }),
          });
        }

        // Refresh client auth context to synchronize user claims and cookies
        await refreshAuth();

        if (!isMounted) return;
        setStatus("success");

        // Smooth redirect to home
        setTimeout(() => {
          router.replace("/");
        }, 600);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          err?.message ||
            "Failed to complete Google authentication. Please try again.",
        );
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, refreshAuth, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#edf2fe] text-[#244892]">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[#0e1117]">
              Signing in with Google
            </h2>
            <p className="text-sm text-[#244892]">
              Completing secure authentication. Please wait a moment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0e1117]">Welcome back!</h2>
            <p className="text-sm text-[#244892]">
              You have signed in successfully. Redirecting you to Accurate
              Liquid...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-[#da3f51]">
              <AlertCircle className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0e1117]">
              Authentication Failed
            </h2>
            <p className="text-sm text-[#244892]">{errorMessage}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-[#244892] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1b3773]"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#244892]" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
