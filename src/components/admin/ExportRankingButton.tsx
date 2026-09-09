"use client";

type ExportRankingButtonProps = {
  nodeId: string;
};

export function ExportRankingButton({
  nodeId,
}: ExportRankingButtonProps) {
  const handleExport = () => {
    window.location.href =
      `/api/admin/nodes/${nodeId}/ranking-export`;
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
    >
      Exportar ranking a Excel
    </button>
  );
}