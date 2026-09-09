import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { next } = await searchParams;

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

        <GoogleLoginButton next={next} />
      </div>
    </main>
  );
}