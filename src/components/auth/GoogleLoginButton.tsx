"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error al iniciar sesión con Google:", error);
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