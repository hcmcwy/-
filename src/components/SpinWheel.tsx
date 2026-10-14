import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Participant } from '../types';
import { soundFx } from '../utils/audio';
import { Play, Sparkles } from 'lucide-react';

interface SpinWheelProps {
  participants: Participant[];
  onSpinEnd: (winner: Participant) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  duration?: number; // seconds
}

// Curated 12-color harmonious palette
const SLICE_COLORS = [
  '#2563EB', // Blue
  '#E11D48', // Crimson
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#EA580C', // Orange
  '#9333EA', // Purple
  '#0D9488', // Teal
  '#DC2626', // Red
  '#4F46E5', // Indigo
  '#CA8A04', // Gold
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  participants,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
  duration = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const [needleDeflection, setNeedleDeflection] = useState<number>(0);

  // Compute slice angles based on weights
  const totalWeight = participants.reduce((sum, p) => sum + (p.weight || 1), 0);

  const getSliceIntervals = useCallback(() => {
    let acc = 0;
    return participants.map((p, index) => {
      const sliceAngle = ((p.weight || 1) / (totalWeight || 1)) * 2 * Math.PI;
      const startAngle = acc;
      const endAngle = acc + sliceAngle;
      acc = endAngle;
      return {
        participant: p,
        index,
        startAngle,
        endAngle,
        sliceAngle,
        color: p.color || SLICE_COLORS[index % SLICE_COLORS.length],
      };
    });
  }, [participants, totalWeight]);

  // Render canvas wheel
  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 520;
      const center = size / 2;
      const radius = center - 24;

      ctx.clearRect(0, 0, size, size);

      if (participants.length === 0) {
        // Empty state
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#1E293B';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '16px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('名單為空，請先匯入名單', center, center);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotation);

      const slices = getSliceIntervals();

      // Draw outer rim shadow & bezel
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius + 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#F59E0B'; // golden bezel
      ctx.stroke();
      ctx.restore();

      // Draw slices
      slices.forEach((slice) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, slice.startAngle, slice.endAngle);
        ctx.closePath();

        ctx.fillStyle = slice.color;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();

        // Render participant text & department
        ctx.save();
        const midAngle = slice.startAngle + slice.sliceAngle / 2;
        ctx.rotate(midAngle);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';

        // Dynamic font sizing depending on count
        const fontSize = participants.length > 25 ? 12 : participants.length > 15 ? 14 : 16;
        ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;

        // Shadow for maximum contrast
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const maxTextLen = participants.length > 20 ? 8 : 12;
        let displayName = slice.participant.name;
        if (displayName.length > maxTextLen) {
          displayName = displayName.substring(0, maxTextLen) + '…';
        }

        ctx.fillText(displayName, radius - 20, 0);

        // Optional subtitle (department or weight note) if slice angle is large enough
        if (slice.sliceAngle > 0.35 && slice.participant.department) {
          ctx.font = '10px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillText(slice.participant.department.substring(0, 8), radius - 20, 16);
        }

        ctx.restore();
      });

      // Outer golden dots around the rim
      const dotCount = Math.max(24, Math.min(48, participants.length * 2));
      for (let i = 0; i < dotCount; i++) {
        const dotAngle = (i / dotCount) * 2 * Math.PI;
        const dotX = Math.cos(dotAngle) * (radius + 5);
        const dotY = Math.sin(dotAngle) * (radius + 5);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FEF08A';
        ctx.fill();
      }

      // Center decorative disk
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, 2 * Math.PI);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, 2 * Math.PI);
      ctx.fillStyle = '#1E293B';
      ctx.fill();

      ctx.restore();
    },
    [participants, getSliceIntervals]
  );

  // Resize canvas for sharp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 520;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Spin trigger
  const spin = useCallback(() => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);

    const slices = getSliceIntervals();

    // Select random winner by weight
    const rand = Math.random() * totalWeight;
    let accumulated = 0;
    let winnerIndex = 0;
    for (let i = 0; i < participants.length; i++) {
      accumulated += participants[i].weight || 1;
      if (rand <= accumulated) {
        winnerIndex = i;
        break;
      }
    }

    const chosenSlice = slices[winnerIndex];
    const winner = chosenSlice.participant;

    // Pick random landing offset strictly inside the slice wedge (avoiding edges)
    const margin = chosenSlice.sliceAngle * 0.15;
    const randomWithinSlice =
      chosenSlice.startAngle + margin + Math.random() * (chosenSlice.sliceAngle - 2 * margin);

    // Pointer is located at top (1.5 * Math.PI).
    // Target rotation:
    const baseTargetAngle = 1.5 * Math.PI - randomWithinSlice;

    // Current angle normalized
    const currentAngle = currentAngleRef.current;
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;

    // Ensure forward spin
    let delta = (baseTargetAngle - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
    if (delta <= 0) {
      delta += 2 * Math.PI;
    }
    const finalAngle = currentAngle + extraSpins + delta;

    const startRot = currentAngle;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let lastTickAngle = currentAngle;

    // Quintic ease-out for ultra smooth mechanical slowing
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOut(progress);
      const rot = startRot + (finalAngle - startRot) * eased;

      currentAngleRef.current = rot;
      drawWheel(rot);

      // Sound tick when passing slice boundaries
      // Angle under pointer:
      const pointerAngle = (1.5 * Math.PI - (rot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const angleMoved = Math.abs(rot - lastTickAngle);
      const averageSliceAngle = (2 * Math.PI) / participants.length;

      if (angleMoved >= averageSliceAngle * 0.8) {
        lastTickAngle = rot;
        soundFx.playTick(1 + (1 - progress) * 0.5);
        // Needle deflects backward then bounces
        setNeedleDeflection(-14 * (1 - progress * 0.6));
        setTimeout(() => setNeedleDeflection(0), 40);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // Finished
        currentAngleRef.current = finalAngle;
        drawWheel(finalAngle);
        setNeedleDeflection(0);
        setIsSpinning(false);
        soundFx.playWinFanfare();
        onSpinEnd(winner);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [
    isSpinning,
    participants,
    getSliceIntervals,
    totalWeight,
    duration,
    setIsSpinning,
    drawWheel,
    onSpinEnd,
  ]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Top Pointer Needle */}
      <div
        className="absolute top-2 z-20 transition-transform duration-75 origin-top pointer-events-none drop-shadow-md"
        style={{
          transform: `translateX(-50%) rotate(${needleDeflection}deg)`,
          left: '50%',
        }}
      >
        <svg
          width="42"
          height="48"
          viewBox="0 0 42 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 46L6 10C6 10 9 2 21 2C33 2 36 10 36 10L21 46Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="2.5"
          />
          <circle cx="21" cy="14" r="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Main Wheel Canvas */}
      <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] lg:w-[500px] lg:h-[500px] flex items-center justify-center rounded-full shadow-2xl border-4 border-slate-800 bg-slate-950/60 p-1">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
          className="rounded-full cursor-pointer transition-transform"
          onClick={spin}
          title={participants.length > 0 ? '點擊或按下方按鈕開始轉動抽獎' : '請先加入抽獎名單'}
        />

        {/* Center Interactive Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning || participants.length === 0}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all duration-200 z-10 shadow-xl ${
            isSpinning
              ? 'bg-amber-600 text-amber-100 cursor-not-allowed scale-95 opacity-90'
              : participants.length === 0
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/25 cursor-pointer ring-4 ring-amber-300/40'
          }`}
          aria-label="開始旋轉輪盤"
        >
          {isSpinning ? (
            <span className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              抽獎中
            </span>
          ) : (
            <>
              <Play className="w-5 h-5 fill-slate-950 mb-0.5" />
              <span className="font-extrabold tracking-wider">抽獎</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Spin Trigger Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>共有 {participants.length} 位在席候選人</span>
        <span aria-hidden="true">·</span>
        <span>點擊圓心或按鈕旋轉</span>
      </div>
    </div>
  );
};
