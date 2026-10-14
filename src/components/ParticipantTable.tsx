import React, { useState } from 'react';
import { Participant } from '../types';
import { Search, Plus, Trash2, Edit2, Check, X, Users } from 'lucide-react';

interface ParticipantTableProps {
  participants: Participant[];
  onUpdateParticipants: (updated: Participant[]) => void;
  onOpenJsonEditor: () => void;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  onUpdateParticipants,
  onOpenJsonEditor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editWeight, setEditWeight] = useState(1);
  const [editNote, setEditNote] = useState('');

  // Quick add form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newWeight, setNewWeight] = useState(1);

  const filtered = participants.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.note && p.note.toLowerCase().includes(q))
    );
  });

  const totalWeight = participants.reduce((sum, p) => sum + (p.weight || 1), 0);

  const handleDelete = (id: string) => {
    onUpdateParticipants(participants.filter((p) => p.id !== id));
  };

  const handleStartEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDept(p.department || '');
    setEditWeight(p.weight || 1);
    setEditNote(p.note || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateParticipants(
      participants.map((p) =>
        p.id === id
          ? {
              ...p,
              name: editName.trim(),
              department: editDept.trim() || undefined,
              weight: Math.max(1, editWeight),
              note: editNote.trim() || undefined,
            }
          : p
      )
    );
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newP: Participant = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      department: newDept.trim() || undefined,
      weight: Math.max(1, newWeight),
    };

    onUpdateParticipants([...participants, newP]);
    setNewName('');
    setNewDept('');
    setNewWeight(1);
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Table Header / Action Strip */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">名單列表管理</h3>
          <span className="text-xs text-slate-400">
            {participants.length} 人 · 權重合計 {totalWeight}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增候選人</span>
          </button>

          <button
            onClick={onOpenJsonEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span>JSON 編輯</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜尋姓名、部門或備註..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            清除
          </button>
        )}
      </div>

      {/* Quick Add Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="p-3 bg-slate-800/60 border-b border-slate-700/80 flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="姓名 *"
            className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 flex-1 min-w-[120px]"
          />
          <input
            type="text"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="部門/班級 (選填)"
            className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 w-28"
          />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">權重:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
              className="w-12 px-1.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 text-center"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            加入
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white"
          >
            取消
          </button>
        </form>
      )}

      {/* Participants Table Body */}
      <div className="flex-1 overflow-y-auto max-h-[380px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <p className="text-xs">尚無符合的抽獎名單</p>
            <button
              onClick={onOpenJsonEditor}
              className="mt-2 text-xs text-blue-400 hover:underline"
            >
              點此開啟 JSON 編輯器匯入範本
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 sticky top-0 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2 px-3 w-8">#</th>
                <th className="py-2 px-3">姓名</th>
                <th className="py-2 px-3">部門 / 備註</th>
                <th className="py-2 px-3 text-center w-16">權重</th>
                <th className="py-2 px-3 text-right w-20">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p, idx) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-100">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs w-full text-white"
                        />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editDept}
                            onChange={(e) => setEditDept(e.target.value)}
                            placeholder="部門"
                            className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs w-24 text-white"
                          />
                          <input
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="備註"
                            className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs flex-1 text-white"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {p.department && (
                            <span className="text-slate-300 font-medium">{p.department}</span>
                          )}
                          {p.department && p.note && <span className="text-slate-600">·</span>}
                          {p.note && <span className="text-slate-500">{p.note}</span>}
                          {!p.department && !p.note && <span className="text-slate-600">-</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value))}
                          className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs text-center text-white"
                        />
                      ) : (
                        <span className="font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                          {p.weight || 1}x
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(p.id)}
                            className="p-1 rounded text-emerald-400 hover:bg-emerald-950/50"
                            title="儲存"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded text-slate-400 hover:bg-slate-800"
                            title="取消"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="編輯"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
