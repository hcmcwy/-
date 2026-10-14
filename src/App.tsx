/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Participant, DrawRecord, WheelConfig } from './types';
import { SpinWheel } from './components/SpinWheel';
import { WinnerModal } from './components/WinnerModal';
import { JsonEditorModal } from './components/JsonEditorModal';
import { ParticipantTable } from './components/ParticipantTable';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal } from './components/SettingsModal';
import { SAMPLE_TEMPLATES, parseParticipantsJson } from './utils/templates';
import { soundFx } from './utils/audio';
import {
  Sparkles,
  Settings,
  Code2,
  Users,
  History,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gift,
} from 'lucide-react';

const STORAGE_KEY_PARTICIPANTS = 'lucky_wheel_participants_v1';
const STORAGE_KEY_HISTORY = 'lucky_wheel_history_v1';
const STORAGE_KEY_CONFIG = 'lucky_wheel_config_v1';

export default function App() {
  // Load initial participants
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const defaultData = parseParticipantsJson(SAMPLE_TEMPLATES[0].json);
    return defaultData.success ? defaultData.participants : [];
  });

  // History records
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Config settings
  const [config, setConfig] = useState<WheelConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      spinDuration: 5,
      soundEnabled: true,
      confettiEnabled: true,
      currentPrize: '幸運大獎',
      autoOpenWinnerModal: true,
    };
  });

  // UI state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'history'>('table');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(drawHistory));
  }, [drawHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    soundFx.enabled = config.soundEnabled;
  }, [config]);

  // Handle spin finish from Wheel
  const handleSpinEnd = useCallback((winner: Participant) => {
    setCurrentWinner(winner);
  }, []);

  // User decides to KEEP winner in the list
  const handleKeepWinner = (winner: Participant) => {
    const newRecord: DrawRecord = {
      id: `draw-${Date.now()}`,
      round: drawHistory.length + 1,
      winner,
      action: 'kept',
      timestamp: Date.now(),
      prizeTitle: config.currentPrize,
    };

    setDrawHistory((prev) => [newRecord, ...prev]);
    setCurrentWinner(null);
  };

  // User decides to REMOVE winner from the list
  const handleRemoveWinner = (winner: Participant) => {
    const newRecord: DrawRecord = {
      id: `draw-${Date.now()}`,
      round: drawHistory.length + 1,
      winner,
      action: 'removed',
      timestamp: Date.now(),
      prizeTitle: config.currentPrize,
    };

    setDrawHistory((prev) => [newRecord, ...prev]);
    setParticipants((prev) => prev.filter((p) => p.id !== winner.id));
    setCurrentWinner(null);
  };

  // Re-add participant from history
  const handleReAddParticipant = (p: Participant) => {
    if (!participants.some((item) => item.id === p.id)) {
      setParticipants((prev) => [...prev, p]);
    }
  };

  // Reset to default sample
  const handleResetParticipants = () => {
    if (window.confirm('確定要將抽獎名單重置為預設的尾牙春酒名單嗎？')) {
      const sample = parseParticipantsJson(SAMPLE_TEMPLATES[0].json);
      if (sample.success) {
        setParticipants(sample.participants);
      }
    }
  };

  // Clear draw history
  const handleClearHistory = () => {
    if (window.confirm('確定要清空所有中獎歷史紀錄嗎？')) {
      setDrawHistory([]);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            幸
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            幸運轉盤抽獎系統
          </span>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('table')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'table' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            名單管理 ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'history' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            中獎紀錄 ({drawHistory.length})
          </button>
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            JSON 匯入 / 匯出
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            抽獎參數設定
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>輸入 JSON 名單</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner Strip: Current prize headline & quick controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>目前抽獎輪次：第 {drawHistory.length + 1} 輪</span>
                <span aria-hidden="true">·</span>
                <span>抽中者可自由選擇「保留」或「移取」</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{config.currentPrize || '幸運大獎'}</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs text-amber-400/80 hover:text-amber-300 font-normal hover:underline"
                >
                  (更改獎項)
                </button>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !config.soundEnabled;
                soundFx.enabled = next;
                setConfig({ ...config, soundEnabled: next });
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={config.soundEnabled ? '關閉音效' : '開啟音效'}
            >
              {config.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={isFullscreen ? '結束全螢幕' : '全螢幕投影模式'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>設定</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Wheel Stage (Left) & Management HUD (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Lucky Draw Wheel Canvas Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden min-h-[540px]">
            {/* Ambient Radial Spotlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <SpinWheel
              participants={participants}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              duration={config.spinDuration}
            />

            {/* Quick Wheel Bottom Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleResetParticipants}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設範本名單</span>
              </button>

              <button
                onClick={() => setIsJsonModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/30 hover:bg-blue-900/40 rounded-lg border border-blue-900/40 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>貼上自訂 JSON 名單</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tabbed Data Management (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Tab switch control */}
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('table')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'table'
                    ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>現有名單 ({participants.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'history'
                    ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>中獎紀錄 ({drawHistory.length})</span>
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="h-[480px]">
              {activeTab === 'table' ? (
                <ParticipantTable
                  participants={participants}
                  onUpdateParticipants={setParticipants}
                  onOpenJsonEditor={() => setIsJsonModalOpen(true)}
                />
              ) : (
                <HistoryPanel
                  records={drawHistory}
                  onReAddParticipant={handleReAddParticipant}
                  onClearHistory={handleClearHistory}
                  activeParticipants={participants}
                />
              )}
            </div>

            {/* Quick Helper Instructions Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>抽獎運作說明</span>
              </div>
              <p className="leading-relaxed">
                1. 點擊「輸入 JSON 名單」可一鍵貼上任何格式的 JSON 清單或套用內建範本。
              </p>
              <p className="leading-relaxed">
                2. 輪盤停定後會彈出恭喜視窗，您可以點擊「保留」讓得主繼續留在轉盤，或「移取」將其剔除以避免重複中獎。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        幸運轉盤抽獎系統 · 支援 JSON 快速匯入、權重計算與得主保留/移取名單控制
      </footer>

      {/* Modals */}
      <WinnerModal
        winner={currentWinner}
        roundNumber={drawHistory.length + 1}
        prizeTitle={config.currentPrize}
        onKeep={handleKeepWinner}
        onRemove={handleRemoveWinner}
        confettiEnabled={config.confettiEnabled}
      />

      <JsonEditorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        participants={participants}
        onSave={(newParticipants) => {
          setParticipants(newParticipants);
          setActiveTab('table');
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={setConfig}
      />
    </div>
  );
}
