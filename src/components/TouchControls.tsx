import React from 'react';
import { Stance } from '../game/types';
import { Sword, Zap, Shield, Sparkles, Flame, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface TouchControlsProps {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  onSwitchStance: (stance: Stance) => void;
  currentStance: Stance;
  canGrapple: boolean;
  canZanshin: boolean;
  isLivingWeaponReady: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onKeyDown,
  onKeyUp,
  onSwitchStance,
  currentStance,
  canGrapple,
  canZanshin,
  isLivingWeaponReady,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex items-end justify-between px-3 py-2 select-none z-30 pointer-events-auto">
      {/* Left: Movement and Stance quick buttons */}
      <div className="flex flex-col gap-2">
        {/* Stance mini row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSwitchStance('HIGH')}
            className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs border ${
              currentStance === 'HIGH'
                ? 'bg-[#e63946] border-[#ff4d6d] text-white shadow-[0_0_8px_rgba(230,57,70,0.8)]'
                : 'bg-[#1b1d2e] border-[#333] text-[#8d99ae]'
            }`}
          >
            上
          </button>
          <button
            onClick={() => onSwitchStance('MID')}
            className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs border ${
              currentStance === 'MID'
                ? 'bg-[#3a86ff] border-[#70d6ff] text-white shadow-[0_0_8px_rgba(58,134,255,0.8)]'
                : 'bg-[#1b1d2e] border-[#333] text-[#8d99ae]'
            }`}
          >
            中
          </button>
          <button
            onClick={() => onSwitchStance('LOW')}
            className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs border ${
              currentStance === 'LOW'
                ? 'bg-[#06d6a0] border-[#52b788] text-white shadow-[0_0_8px_rgba(6,214,160,0.8)]'
                : 'bg-[#1b1d2e] border-[#333] text-[#8d99ae]'
            }`}
          >
            下
          </button>
        </div>

        {/* Direction buttons */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); onKeyDown('a'); }}
            onTouchEnd={(e) => { e.preventDefault(); onKeyUp('a'); }}
            onMouseDown={() => onKeyDown('a')}
            onMouseUp={() => onKeyUp('a')}
            onMouseLeave={() => onKeyUp('a')}
            className="w-14 h-14 rounded-xl bg-[#1b1d2e]/90 active:bg-[#e63946] border border-[#3a86ff]/40 flex items-center justify-center text-[#f5f3f4] active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onKeyDown('d'); }}
            onTouchEnd={(e) => { e.preventDefault(); onKeyUp('d'); }}
            onMouseDown={() => onKeyDown('d')}
            onMouseUp={() => onKeyUp('d')}
            onMouseLeave={() => onKeyUp('d')}
            className="w-14 h-14 rounded-xl bg-[#1b1d2e]/90 active:bg-[#e63946] border border-[#3a86ff]/40 flex items-center justify-center text-[#f5f3f4] active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Right: Combat action cluster */}
      <div className="flex items-center gap-2">
        {/* Living weapon trigger */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onKeyDown('q'); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyUp('q'); }}
          onMouseDown={() => onKeyDown('q')}
          onMouseUp={() => onKeyUp('q')}
          disabled={!isLivingWeaponReady}
          className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center text-[10px] font-bold ${
            isLivingWeaponReady
              ? 'bg-[#d90429] border-[#ffbe0b] text-[#ffbe0b] shadow-[0_0_12px_rgba(255,190,11,0.9)] animate-pulse'
              : 'bg-[#1a1a1a]/70 border-[#333] text-[#555]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>九十九</span>
        </button>

        {/* Guard */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onKeyDown('l'); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyUp('l'); }}
          onMouseDown={() => onKeyDown('l')}
          onMouseUp={() => onKeyUp('l')}
          onMouseLeave={() => onKeyUp('l')}
          className="w-12 h-12 rounded-xl bg-[#1f2421]/90 active:bg-[#3a86ff] border border-[#3a86ff]/50 flex flex-col items-center justify-center text-[#70d6ff] text-xs font-bold active:scale-95 shadow-lg"
        >
          <Shield className="w-4 h-4" />
          <span>防禦</span>
        </button>

        {/* Roll / Ki Pulse (殘心) */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onKeyDown(' '); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyUp(' '); }}
          onMouseDown={() => onKeyDown(' ')}
          onMouseUp={() => onKeyUp(' ')}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-xs font-black active:scale-95 shadow-xl border ${
            canZanshin
              ? 'bg-[#00f5d4] text-black border-white shadow-[0_0_15px_rgba(0,245,212,0.9)] animate-bounce'
              : 'bg-[#0f172a] text-[#f8f9fa] border-[#38bdf8]/40'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${canZanshin ? 'animate-spin' : ''}`} />
          <span>{canZanshin ? '殘心！' : '翻滾'}</span>
        </button>

        {/* Light Attack (J) */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onKeyDown('j'); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyUp('j'); }}
          onMouseDown={() => onKeyDown('j')}
          onMouseUp={() => onKeyUp('j')}
          className="w-13 h-13 rounded-xl bg-[#2b2d42] active:bg-[#3a86ff] border border-[#64748b] flex flex-col items-center justify-center text-[#f8f9fa] text-xs font-bold active:scale-95 shadow-lg"
        >
          <Sword className="w-5 h-5" />
          <span>輕斬</span>
        </button>

        {/* Heavy / Grapple Attack (K) */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onKeyDown('k'); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyUp('k'); }}
          onMouseDown={() => onKeyDown('k')}
          onMouseUp={() => onKeyUp('k')}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-black active:scale-95 shadow-xl border ${
            canGrapple
              ? 'bg-[#ff0055] text-white border-white shadow-[0_0_18px_rgba(255,0,85,0.9)] animate-bounce'
              : 'bg-[#660708] text-white border-[#e63946]'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>{canGrapple ? '處決！' : '重斬'}</span>
        </button>
      </div>
    </div>
  );
};
