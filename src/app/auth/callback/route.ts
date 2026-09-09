import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code =
    requestUrl.searchParams.get("code");

  const next =
    requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(
        code
      );

    if (!error) {
      const destination =
        next &&
        next.startsWith("/") &&
        !next.startsWith("//")
          ? next
          : "/dashboard";

      return NextResponse.redirect(
        new URL(
          destination,
          requestUrl.origin
        )
      );
    }

    console.error(
      "Auth callback error:",
      error
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=auth_callback",
      requestUrl.origin
    )
  );
}