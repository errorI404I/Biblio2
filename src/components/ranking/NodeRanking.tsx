"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils/time";

type RankingEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalSeconds: number;
};

type RankingRpcRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_seconds: number | string;
};

type NodeRankingProps = {
  nodeId: string;
  initialRanking: RankingEntry[];
};

export function NodeRanking({
  nodeId,
  initialRanking,
}: NodeRankingProps) {
  const [ranking, setRanking] =
    useState<RankingEntry[]>(initialRanking);

  useEffect(() => {
    const supabase = createClient();

    const refreshRanking = async () => {
      const { data, error } = await supabase.rpc(
        "get_node_ranking",
        {
          p_node_id: nodeId,
        }
      );

      if (error) {
        console.error(
          "Error refreshing ranking:",
          error
        );

        return;
      }

      const rows =
        (data ?? []) as RankingRpcRow[];

      const mapped = rows.map((entry) => ({
        userId: entry.user_id,
        displayName: entry.display_name,
        avatarUrl: entry.avatar_url,
        totalSeconds: Number(
          entry.total_seconds
        ),
      }));

      setRanking(mapped);
    };

    const channel = supabase
      .channel(`ranking:${nodeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_presence",
          filter: `node_id=eq.${nodeId}`,
        },
        () => {
          refreshRanking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nodeId]);

  if (ranking.length === 0) {
    return (
      <p className="mt-2 text-sm text-slate-600">
        Todavía no hay datos de ranking.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {ranking.map((entry, index) => (
        <div
          key={entry.userId}
          className="flex items-center justify-between rounded-md border border-slate-200 p-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 font-semibold text-slate-700">
              {index + 1}.
            </span>

            <div>
              <p className="font-medium text-slate-900">
                {entry.displayName}
              </p>

              <p className="text-sm text-slate-500">
                {formatDuration(
                  entry.totalSeconds
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}