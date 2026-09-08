import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold">
            Tracking Presence
          </h1>

          <p className="mt-2 text-gray-600">
            Iniciá sesión para continuar
          </p>
        </div>

        <GoogleLoginButton />
      </div>
    </main>
  );
}