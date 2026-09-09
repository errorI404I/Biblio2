"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type UserMenuProps = {
  email?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
  isAdminMode: boolean;
};

export function UserMenu({
  email,
  avatarUrl,
  displayName,
  isAdminMode,
}: UserMenuProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    document.cookie =
      "app_mode=user; path=/; max-age=31536000; samesite=lax";

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  function enterAdminMode() {
    document.cookie =
      "app_mode=admin; path=/; max-age=31536000; samesite=lax";

    setOpen(false);

    router.push("/admin");
    router.refresh();
  }

  function exitAdminMode() {
    document.cookie =
      "app_mode=user; path=/; max-age=31536000; samesite=lax";

    setOpen(false);

    router.push("/dashboard");
    router.refresh();
  }

  const fallbackLetter =
    displayName?.charAt(0).toUpperCase() ??
    email?.charAt(0).toUpperCase() ??
    "?";

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        aria-label="Abrir menú de usuario"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          fallbackLetter
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-base font-semibold text-slate-700">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  fallbackLetter
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {displayName ?? "Usuario"}
                </p>

                <p className="truncate text-sm text-slate-500">
                  {email}
                </p>
              </div>
            </div>

            {isAdminMode && (
              <div className="mt-3">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Modo administrador
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <Link
              href="/profile"
              onClick={() =>
                setOpen(false)
              }
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Mi perfil
            </Link>

            {!isAdminMode ? (
              <button
                type="button"
                onClick={enterAdminMode}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Entrar en modo administrador
              </button>
            ) : (
              <button
                type="button"
                onClick={exitAdminMode}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Salir del modo administrador
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {loggingOut
                ? "Cerrando sesión..."
                : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}