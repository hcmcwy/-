import React from 'react';
import { WheelConfig } from '../types';
import { Settings, Volume2, VolumeX, Sparkles, Clock, Gift, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WheelConfig;
  onUpdateConfig: (newConfig: WheelConfig) => void;
}

const PRIZE_SUGGESTIONS = [
  '特等獎 · 頂級旗艦手機',
  '頭獎 · 雙人來回機票',
  '二獎 · 4K 智慧液晶電視',
  '三獎 · 降噪藍牙耳機',
  '幸運獎 · 萬元電子禮券',
  '同樂紅包 · 發財金',
  '課堂回答 · 加分機會',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !config.soundEnabled;
    soundFx.enabled = next;
    onUpdateConfig({ ...config, soundEnabled: next });
    if (next) soundFx.playTick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">輪盤與抽獎設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Current Prize Name */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-slate-200 mb-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>當前抽獎獎項標題</span>
            </label>
            <input
              type="text"
              value={config.currentPrize}
              onChange={(e) => onUpdateConfig({ ...config, currentPrize: e.target.value })}
              placeholder="例如：特等獎、幸運紅包..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRIZE_SUGGESTIONS.map((pz) => (
                <button
                  key={pz}
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, currentPrize: pz })}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {pz.split(' · ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Spin Duration */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-slate-200 mb-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>轉動持續時間：{config.spinDuration} 秒</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, spinDuration: sec })}
                  className={`py-1.5 font-semibold rounded-lg border transition-all ${
                    config.spinDuration === sec
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {sec} 秒
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="font-semibold text-slate-200">轉動與中獎音效</div>
                  <div className="text-[11px] text-slate-500">機械指針摩擦滴答聲與得主歡呼旋律</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  config.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Confetti Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-slate-200">中獎彩色彩帶特效</div>
                  <div className="text-[11px] text-slate-500">得主公佈時噴灑慶祝碎紙花</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ ...config, confettiEnabled: !config.confettiEnabled })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  config.confettiEnabled ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.confettiEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
