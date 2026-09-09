import { LogoutButton } from "@/components/auth/LogoutButton";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-300 bg-white px-6 py-4 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">
        Tracking Presence
      </h1>

      <LogoutButton />
    </header>
  );
}