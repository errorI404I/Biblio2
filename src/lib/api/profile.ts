import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/user";

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      avatar_url,
      bio,
      created_at,
      updated_at
    `)
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error loading profile:", error);
    return null;
  }

  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}