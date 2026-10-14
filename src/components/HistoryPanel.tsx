import React from 'react';
import { DrawRecord, Participant } from '../types';
import { History, RotateCcw, Download, Trash2, CheckCircle2, UserMinus } from 'lucide-react';

interface HistoryPanelProps {
  records: DrawRecord[];
  onReAddParticipant: (p: Participant) => void;
  onClearHistory: () => void;
  activeParticipants: Participant[];
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  records,
  onReAddParticipant,
  onClearHistory,
  activeParticipants,
}) => {
  const activeIds = new Set(activeParticipants.map((p) => p.id));

  // Export records as CSV
  const handleExportCsv = () => {
    if (records.length === 0) return;
    const headers = ['輪次', '得主姓名', '部門', '備註', '獎項', '後續處置', '抽中時間'];
    const rows = records.map((r) => [
      r.round,
      `"${r.winner.name.replace(/"/g, '""')}"`,
      `"${(r.winner.department || '').replace(/"/g, '""')}"`,
      `"${(r.winner.note || '').replace(/"/g, '""')}"`,
      `"${(r.prizeTitle || '').replace(/"/g, '""')}"`,
      r.action === 'kept' ? '保留名單' : '移取名單',
      new Date(r.timestamp).toLocaleString(),
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucky-draw-records-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">抽獎中獎紀錄</h3>
          <span className="text-xs text-slate-400">共 {records.length} 筆紀錄</span>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="匯出中獎名單 CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>匯出 CSV</span>
              </button>

              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="清空中獎紀錄"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] p-3 space-y-2.5">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
            <p className="text-xs">尚無任何中獎紀錄</p>
            <p className="text-[11px] text-slate-600 mt-1">轉動輪盤抽出幸運得主後，紀錄將即時顯示於此</p>
          </div>
        ) : (
          records.map((record) => {
            const isCurrentlyInWheel = activeIds.has(record.winner.id);
            return (
              <div
                key={record.id}
                className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-8 h-8 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20 font-mono">
                    R{record.round}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{record.winner.name}</span>
                      {record.winner.department && (
                        <span className="text-xs text-slate-400">{record.winner.department}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{record.prizeTitle || '幸運大獎'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span aria-hidden="true">·</span>
                      {record.action === 'kept' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          保留在輪盤中
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <UserMinus className="w-3 h-3" />
                          已從名單移取
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Re-add button if removed and not currently in wheel */}
                {record.action === 'removed' && !isCurrentlyInWheel && (
                  <button
                    onClick={() => onReAddParticipant(record.winner)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-colors whitespace-nowrap"
                    title="重新將此得主加回轉盤"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>加回名單</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
