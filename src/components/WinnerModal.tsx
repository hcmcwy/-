import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Participant } from '../types';
import { soundFx } from '../utils/audio';
import { Trophy, CheckCircle2, UserMinus, Sparkles } from 'lucide-react';

interface WinnerModalProps {
  winner: Participant | null;
  roundNumber: number;
  prizeTitle?: string;
  onKeep: (winner: Participant) => void;
  onRemove: (winner: Participant) => void;
  confettiEnabled?: boolean;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  roundNumber,
  prizeTitle = '幸運大獎',
  onKeep,
  onRemove,
  confettiEnabled = true,
}) => {
  useEffect(() => {
    if (!winner || !confettiEnabled) return;

    // Trigger celebratory multi-stage confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.65 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#FEF08A', '#F43F5E', '#8B5CF6'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [winner, confettiEnabled]);

  if (!winner) return null;

  const handleKeep = () => {
    soundFx.playKeepSound();
    onKeep(winner);
  };

  const handleRemove = () => {
    soundFx.playRemoveSound();
    onRemove(winner);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Subtle decorative glowing background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon / Stage */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>第 {roundNumber} 輪抽獎結果</span>
            <span aria-hidden="true">·</span>
            <span>{prizeTitle}</span>
          </div>

          <p className="text-sm text-slate-400">恭喜幸運得主出爐！</p>

          {/* Winner Hero Card */}
          <div className="w-full my-6 p-6 rounded-xl bg-gradient-to-b from-slate-800/90 to-slate-800/40 border border-amber-500/40 text-center shadow-inner">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 tracking-tight">
              {winner.name}
            </h2>

            {(winner.department || winner.note) && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-300">
                {winner.department && (
                  <span className="font-medium text-slate-200">{winner.department}</span>
                )}
                {winner.department && winner.note && <span aria-hidden="true">·</span>}
                {winner.note && <span className="text-slate-400">{winner.note}</span>}
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            請選擇後續處置方式：是否要保留該得主在輪盤中繼續參與後續抽獎？
          </p>

          {/* Core Decision Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {/* Option 1: Keep in list */}
            <button
              onClick={handleKeep}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 hover:border-emerald-500/60 active:scale-[0.98] transition-all text-left"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-1">
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>保留名單中</span>
              </div>
              <span className="text-xs text-slate-400 text-center">
                保留在輪盤中，下一輪仍有機會抽中
              </span>
            </button>

            {/* Option 2: Remove from list */}
            <button
              onClick={handleRemove}
              className="group flex flex-col items-center justify-center p-4 rounded-xl border border-red-900/60 bg-red-950/40 hover:bg-red-900/50 hover:border-red-500/80 active:scale-[0.98] transition-all text-left"
            >
              <div className="flex items-center gap-2 text-red-400 font-bold text-base mb-1">
                <UserMinus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>移取名單 (移除)</span>
              </div>
              <span className="text-xs text-red-200/70 text-center">
                從轉盤名單中移出，不再重複中獎
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
