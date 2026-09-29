import React from 'react';
import { GameState, CombatStats } from '../game/types';
import { Play, RotateCcw, Trophy, Award, BookOpen } from 'lucide-react';

interface OverlayScreensProps {
  state: GameState;
  stats: CombatStats;
  onStart: () => void;
  onOpenGuide: () => void;
  onOpenStats: () => void;
}

export const OverlayScreens: React.FC<OverlayScreensProps> = ({
  state,
  stats,
  onStart,
  onOpenGuide,
  onOpenStats,
}) => {
  if (state === 'PLAYING') return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-center select-none">
      {/* 1. START SCREEN */}
      {state === 'START' && (
        <div className="max-w-md w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center">
            <span className="text-[#adb5bd] text-xs tracking-[0.3em] uppercase mb-1 font-['Cinzel']">
              Action Soul Tribute
            </span>
            <h1 className="text-4xl sm:text-5xl font-black font-['Noto_Serif_TC'] text-[#e63946] drop-shadow-[0_0_20px_rgba(230,57,70,0.8)] tracking-wider">
              仁王：落命之刻
            </h1>
            <p className="text-sm text-[#a8dadc] mt-2 font-['Noto_Serif_TC']">
              掌握「三段架勢」與「殘心之理」，於戰國冥界斬滅惡鬼
            </p>
          </div>

          <div className="w-full bg-[#16161a]/90 border border-[#660708] rounded-lg p-4 text-left text-xs space-y-2 text-[#ced4da] shadow-xl">
            <div className="flex items-center gap-2 text-[#ffd166] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd166]" />
              <span>上 / 中 / 下段 三段架勢隨心切換 (按鍵 1, 2, 3)</span>
            </div>
            <div className="flex items-center gap-2 text-[#00f5d4] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4]" />
              <span>抓準刀鋒收招時機發動「殘心」，祓除常世黑池 (空白鍵)</span>
            </div>
            <div className="flex items-center gap-2 text-[#ff0055] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055]" />
              <span>削空敵人精力陷入氣絕，發動必殺「近身刺擊處決」 (K 鍵)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={onStart}
              className="w-full sm:flex-1 py-3 px-6 rounded bg-gradient-to-r from-[#ba181b] via-[#e63946] to-[#ba181b] text-white font-bold text-base shadow-[0_0_20px_rgba(230,57,70,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>踏入戰陣 (開始遊戲)</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="w-full sm:w-auto py-3 px-4 rounded bg-[#1e1e24] hover:bg-[#2b2d42] text-[#f5f3f4] text-xs font-bold border border-[#444] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#ffd166]" />
              <span>招式指引</span>
            </button>
          </div>

          <div className="text-[11px] text-[#6c757d]">
            提示：也可直接按 <kbd className="text-[#f5f3f4] font-bold">空白鍵</kbd> 或 <kbd className="text-[#f5f3f4] font-bold">Enter</kbd> 迅速開戰
          </div>
        </div>
      )}

      {/* 2. GAME OVER SCREEN (落命) */}
      {state === 'GAMEOVER' && (
        <div className="max-w-md w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center">
            <h1 className="text-6xl sm:text-7xl font-black font-['Noto_Serif_TC'] text-[#d90429] drop-shadow-[0_0_30px_rgba(217,4,41,0.9)] tracking-[0.2em]">
              落 命
            </h1>
            <span className="text-xs text-[#8d99ae] tracking-widest mt-2 uppercase font-['Cinzel']">
              Moment of Defeat
            </span>
            <p className="text-sm text-[#ced4da] mt-3">
              刀劍無情，武士之魂於冥界重聚。整頓架勢，捲土重來！
            </p>
          </div>

          <div className="w-full p-3.5 bg-[#1a0a0d] border border-[#660708] rounded text-left text-xs text-[#adb5bd] space-y-1">
            <div className="text-[#e63946] font-bold mb-1">戰鬥心得提示：</div>
            <p>• 遇到凶猛攻擊時，切換至<strong className="text-white">【中段】</strong>可大幅降低格擋損耗的精力。</p>
            <p>• 攻擊後務必把握時機按<strong className="text-white">【空白鍵】</strong>殘心，精力枯竭會陷入極端危險的氣絕！</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={onStart}
              className="w-full sm:flex-1 py-3 px-6 rounded bg-gradient-to-r from-[#660708] to-[#d90429] text-white font-bold text-base shadow-[0_0_20px_rgba(217,4,41,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>重整旗鼓，再次挑戰</span>
            </button>

            <button
              onClick={onOpenStats}
              className="w-full sm:w-auto py-3 px-4 rounded bg-[#1f1604] hover:bg-[#3d2c08] text-[#ffd166] text-xs font-bold border border-[#ffd166]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>查看戰報</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. VICTORY SCREEN (討魔成功) */}
      {state === 'VICTORY' && (
        <div className="max-w-md w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-[#ffbe0b]/10 rounded-full border border-[#ffbe0b]/40 mb-2">
              <Trophy className="w-10 h-10 text-[#ffbe0b]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-['Noto_Serif_TC'] text-[#ffbe0b] drop-shadow-[0_0_25px_rgba(255,190,11,0.8)] tracking-wider">
              討 魔 成 功
            </h1>
            <p className="text-sm text-[#e0e1dd] mt-2">
              落武者、妖鬼與怨靈鬼皆已伏誅！戰國冥世暫得清寧。
            </p>
          </div>

          <div className="w-full bg-[#18181b]/90 border border-[#d4af37]/60 rounded-lg p-4 text-xs space-y-2 text-[#f5f3f4]">
            <div className="flex justify-between items-center border-b border-[#333] pb-1.5">
              <span className="text-[#adb5bd]">斬殺討滅數</span>
              <span className="font-bold text-[#ffd166]">{stats.enemiesDefeated} 尊凶魔</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#333] pb-1.5">
              <span className="text-[#adb5bd]">完美殘心發動</span>
              <span className="font-bold text-[#00f5d4]">{stats.perfectZanshinCount} 次</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#333] pb-1.5">
              <span className="text-[#adb5bd]">氣絕近身處決</span>
              <span className="font-bold text-[#ff0055]">{stats.grappleCount} 回</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#adb5bd]">祓除淨化常世</span>
              <span className="font-bold text-[#70d6ff]">{stats.yokaiPurifiedCount} 處</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={onStart}
              className="w-full sm:flex-1 py-3 px-6 rounded bg-gradient-to-r from-[#b58315] via-[#ffbe0b] to-[#b58315] text-black font-black text-sm shadow-[0_0_20px_rgba(255,190,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新踏上修羅道</span>
            </button>

            <button
              onClick={onOpenStats}
              className="w-full sm:w-auto py-3 px-4 rounded bg-[#1e1e24] hover:bg-[#2b2d42] text-[#f5f3f4] text-xs font-bold border border-[#444] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#ffd166]" />
              <span>詳細戰果評定</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
