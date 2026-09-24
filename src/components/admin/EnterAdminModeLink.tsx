"use client";

import { useRouter } from "next/navigation";

export function EnterAdminModeLink() {
  const router = useRouter();

  function enterAdminMode() {
    document.cookie =
      "app_mode=admin; path=/; max-age=31536000; samesite=lax";
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={enterAdminMode}
      className="mt-5 font-semibold text-amber-700"
    >
      Ir a administración →
    </button>
  );
}
