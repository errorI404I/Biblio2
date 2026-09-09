"use client";

import { createClient } from "@/lib/supabase/client";

type GoogleLoginButtonProps = {
  next?: string;
};

export function GoogleLoginButton({
  next,
}: GoogleLoginButtonProps) {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const callbackUrl = new URL(
      "/auth/callback",
      window.location.origin
    );

    if (next) {
      callbackUrl.searchParams.set(
        "next",
        next
      );
    }

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            callbackUrl.toString(),
        },
      });

    if (error) {
      console.error(
        "Error al iniciar sesión con Google:",
        error
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="rounded-md border px-4 py-2 font-medium"
    >
      Continuar con Google
    </button>
  );
}