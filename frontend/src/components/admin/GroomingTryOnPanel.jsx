import { Trash2, RefreshCw, ExternalLink, Scissors } from "lucide-react";

function SessionTable({ rows, type, onDelete, deletingId }) {
  if (!rows.length) {
    return (
      <p className="text-center text-slate-500 py-8 text-sm">
        No {type} sessions yet. They appear after a successful AI swap.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead>
          <tr className="bg-slate-800/50">
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">User</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Style</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Result</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-800/30">
              <td className="px-4 py-3 text-slate-300">#{row.id}</td>
              <td className="px-4 py-3">
                <div className="text-slate-200">{row.username || "Guest"}</div>
                <div className="text-xs text-slate-500">{row.email || "—"}</div>
              </td>
              <td className="px-4 py-3 text-slate-200">
                {type === "hairstyle" ? (
                  <>
                    <span className="font-medium">{row.hairStyleLabel}</span>
                    <span className="text-xs text-slate-500 block">
                      {row.gender} · #{row.styleId} · {row.hairStyle}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">{row.beardLabel}</span>
                    <span className="text-xs text-slate-500 block">
                      #{row.styleId} · {row.beard}
                      {row.sourceType === "hairstyle_result" && " · from hair result"}
                    </span>
                  </>
                )}
              </td>
              <td className="px-4 py-3">
                {row.resultImageUrl ? (
                  <a
                    href={row.resultImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  disabled={deletingId === row.id}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/30 disabled:opacity-50"
                  title="Delete record"
                >
                  {deletingId === row.id ? (
                    <div className="size-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GroomingTryOnPanel({
  hairstyleTryOns,
  beardTryOns,
  groomingStats,
  loading,
  deletingId,
  onRefresh,
  onDeleteHairstyle,
  onDeleteBeard,
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
              <Scissors size={20} className="text-white" />
            </div>
            Hair & Beard Try-On Logs
          </h2>
          <p className="text-sm text-slate-400 mt-2 ml-13">
            {groomingStats
              ? `${groomingStats.totalHairstyle || 0} hairstyles · ${groomingStats.totalBeard || 0} beards`
              : "Loading stats…"}
            {groomingStats &&
              ` · ${groomingStats.recentHairstyle || 0} hair / ${groomingStats.recentBeard || 0} beard (7d)`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-500 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Hairstyle swaps</h3>
        <SessionTable
          rows={hairstyleTryOns}
          type="hairstyle"
          onDelete={onDeleteHairstyle}
          deletingId={deletingId}
        />
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Beard swaps</h3>
        <SessionTable
          rows={beardTryOns}
          type="beard"
          onDelete={onDeleteBeard}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}
