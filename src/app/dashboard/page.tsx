import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <pre className="mt-4">
        {JSON.stringify(user, null, 2)}
      </pre>
    </main>
  );
}