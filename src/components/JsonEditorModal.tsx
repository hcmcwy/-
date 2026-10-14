import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import {
  parseParticipantsJson,
  exportParticipantsToJson,
  SAMPLE_TEMPLATES,
} from '../utils/templates';
import {
  Code2,
  Upload,
  Download,
  Sparkles,
  AlertCircle,
  Check,
  X,
  FileText,
  Copy,
} from 'lucide-react';

interface JsonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onSave: (newParticipants: Participant[]) => void;
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
  isOpen,
  onClose,
  participants,
  onSave,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with current participants when opened
  useEffect(() => {
    if (isOpen) {
      const exported = exportParticipantsToJson(participants);
      setJsonText(exported);
      validate(exported);
    }
  }, [isOpen, participants]);

  const validate = (text: string) => {
    if (!text.trim()) {
      setValidationError('內容為空，請輸入 JSON 名單。');
      setParsedPreviewCount(0);
      return false;
    }
    const result = parseParticipantsJson(text);
    if (!result.success) {
      setValidationError(result.error || '無效的 JSON 格式');
      setParsedPreviewCount(0);
      return false;
    }
    setValidationError(null);
    setParsedPreviewCount(result.participants.length);
    return true;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    validate(val);
  };

  // Format JSON
  const handlePrettify = () => {
    try {
      const obj = JSON.parse(jsonText);
      const formatted = JSON.stringify(obj, null, 2);
      setJsonText(formatted);
      validate(formatted);
    } catch {
      // ignore if invalid
    }
  };

  // Load a sample template
  const handleSelectTemplate = (templateJson: string) => {
    setJsonText(templateJson);
    validate(templateJson);
  };

  // Upload .json file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        validate(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download .json file
  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucky-draw-participants-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Apply changes
  const handleApply = () => {
    const result = parseParticipantsJson(jsonText);
    if (result.success && result.participants.length > 0) {
      onSave(result.participants);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[760px] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">JSON 名單輸入與編輯</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>支援字串陣列或物件陣列</span>
                <span aria-hidden="true">·</span>
                <span>自動辨識姓名、部門與權重</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Template Selector */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          {/* Preset templates */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">範本載入：</span>
            {SAMPLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.json)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors whitespace-nowrap"
                title={tmpl.description}
              >
                {tmpl.title}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>匯入 .json</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="下載目前 JSON 檔案"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載</span>
            </button>

            <button
              onClick={handlePrettify}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="自動排版 JSON"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>格式化</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="複製 JSON 內容"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative flex-1 p-6 overflow-hidden flex flex-col bg-slate-950/80">
          <textarea
            value={jsonText}
            onChange={handleTextChange}
            spellCheck={false}
            className="w-full flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none overflow-y-auto leading-relaxed shadow-inner"
            placeholder="請貼上或輸入 JSON 抽獎名單..."
          />

          {/* Validation Feedback Banner */}
          <div className="mt-3 flex items-center justify-between">
            {validationError ? (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-900/50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-900/40">
                <Check className="w-4 h-4 shrink-0" />
                <span>語法有效 · 解析出 {parsedPreviewCount} 位抽獎對象</span>
              </div>
            )}

            <div className="text-xs text-slate-500 font-mono">
              字元數: {jsonText.length.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>範例格式：["王大明", "李小美"] 或 [&#123; "name": "王大明", "weight": 2 &#125;]</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={Boolean(validationError) || parsedPreviewCount === 0}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                validationError || parsedPreviewCount === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 active:scale-95'
              }`}
            >
              套用至轉盤 ({parsedPreviewCount} 人)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
