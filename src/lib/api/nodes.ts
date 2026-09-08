import { createClient } from "@/lib/supabase/server";
import type { UserNode } from "@/types/node";

export async function getCurrentUserNodes(): Promise<UserNode[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("node_memberships")
    .select(`
      role,
      nodes (
        id,
        name,
        description,
        validation_method,
        latitude,
        longitude,
        radius_meters,
        wifi_public_ip,
        grace_period_seconds,
        timezone,
        is_ranking_visible,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error loading user nodes:", error);
    return [];
  }

  return data
    .map((membership) => {
      const node = Array.isArray(membership.nodes)
        ? membership.nodes[0]
        : membership.nodes;

      if (!node) {
        return null;
      }

      return {
        id: node.id,
        name: node.name,
        description: node.description,
        validationMethod: node.validation_method,
        latitude: node.latitude,
        longitude: node.longitude,
        radiusMeters: node.radius_meters,
        wifiPublicIp: node.wifi_public_ip,
        gracePeriodSeconds: node.grace_period_seconds,
        timezone: node.timezone,
        isRankingVisible: node.is_ranking_visible,
        isActive: node.is_active,
        createdAt: node.created_at,
        updatedAt: node.updated_at,
        role: membership.role,
      };
    })
    .filter((node): node is UserNode => node !== null);
}

export async function getUserNodeById(
  nodeId: string
): Promise<UserNode | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("node_memberships")
    .select(`
      role,
      nodes (
        id,
        name,
        description,
        validation_method,
        latitude,
        longitude,
        radius_meters,
        wifi_public_ip,
        grace_period_seconds,
        timezone,
        is_ranking_visible,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .eq("node_id", nodeId)
    .single();

  if (error || !data?.nodes) {
    return null;
  }

  const node = Array.isArray(data.nodes)
    ? data.nodes[0]
    : data.nodes;

  if (!node) {
    return null;
  }

  return {
    id: node.id,
    name: node.name,
    description: node.description,
    validationMethod: node.validation_method,
    latitude: node.latitude,
    longitude: node.longitude,
    radiusMeters: node.radius_meters,
    wifiPublicIp: node.wifi_public_ip,
    gracePeriodSeconds: node.grace_period_seconds,
    timezone: node.timezone,
    isRankingVisible: node.is_ranking_visible,
    isActive: node.is_active,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    role: data.role,
  };
}

export async function getCurrentUserAdminNodes(): Promise<UserNode[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("node_memberships")
    .select(`
      role,
      nodes (
        id,
        name,
        description,
        validation_method,
        latitude,
        longitude,
        radius_meters,
        wifi_public_ip,
        grace_period_seconds,
        timezone,
        is_ranking_visible,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .eq("role", "ADMIN");

  if (error) {
    console.error("Error loading admin nodes:", error);
    return [];
  }

  return data
    .map((membership) => {
      const node = Array.isArray(membership.nodes)
        ? membership.nodes[0]
        : membership.nodes;

      if (!node) {
        return null;
      }

      return {
        id: node.id,
        name: node.name,
        description: node.description,
        validationMethod: node.validation_method,
        latitude: node.latitude,
        longitude: node.longitude,
        radiusMeters: node.radius_meters,
        wifiPublicIp: node.wifi_public_ip,
        gracePeriodSeconds: node.grace_period_seconds,
        timezone: node.timezone,
        isRankingVisible: node.is_ranking_visible,
        isActive: node.is_active,
        createdAt: node.created_at,
        updatedAt: node.updated_at,
        role: membership.role,
      };
    })
    .filter((node): node is UserNode => node !== null);
}
export async function getAdminNodeById(
  nodeId: string
): Promise<UserNode | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("node_memberships")
    .select(`
      role,
      nodes (
        id,
        name,
        description,
        validation_method,
        latitude,
        longitude,
        radius_meters,
        wifi_public_ip,
        grace_period_seconds,
        timezone,
        is_ranking_visible,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .eq("node_id", nodeId)
    .eq("role", "ADMIN")
    .single();
    console.log("ADMIN NODE DATA:", data);
console.log("ADMIN NODE ERROR:", error);

  if (error || !data?.nodes) {
    return null;
  }

  const node = Array.isArray(data.nodes)
    ? data.nodes[0]
    : data.nodes;

  if (!node) {
    return null;
  }

  return {
    id: node.id,
    name: node.name,
    description: node.description,
    validationMethod: node.validation_method,
    latitude: node.latitude,
    longitude: node.longitude,
    radiusMeters: node.radius_meters,
    wifiPublicIp: node.wifi_public_ip,
    gracePeriodSeconds: node.grace_period_seconds,
    timezone: node.timezone,
    isRankingVisible: node.is_ranking_visible,
    isActive: node.is_active,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    role: data.role,
  };
}