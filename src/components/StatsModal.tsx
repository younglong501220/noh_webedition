import React from 'react';
import { X, Award, Flame, RefreshCw, Crosshair, ShieldAlert } from 'lucide-react';
import { CombatStats } from '../game/types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CombatStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const durationSec = Math.max(
    1,
    Math.floor(((stats.endTime || Date.now()) - stats.startTime) / 1000)
  );

  // Calculate combat rating
  let grade = 'C';
  const score =
    stats.perfectZanshinCount * 25 +
    stats.grappleCount * 40 +
    stats.yokaiPurifiedCount * 30 +
    stats.enemiesDefeated * 50 +
    stats.maxCombo * 5;

  if (score > 450) grade = 'S+';
  else if (score > 320) grade = 'S';
  else if (score > 220) grade = 'A';
  else if (score > 120) grade = 'B';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#d4af37] rounded-lg p-6 shadow-[0_0_30px_rgba(212,175,55,0.4)] text-[#f5f3f4]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#8d99ae] hover:text-white hover:bg-[#2b2b2b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5 border-b border-[#2b2b2b] pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-['Noto_Serif_TC'] text-[#ffd166] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#ffd166]" />
              <span>討魔戰鬥實績評定</span>
            </h2>
            <p className="text-xs text-[#adb5bd] mt-0.5">
              此番戰陣中的刀劍技藝與殘心發揮評定
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#2b1f06] border border-[#ffd166]/50 rounded-lg px-3 py-1">
            <span className="text-[10px] text-[#ffd166] font-bold">武士階位</span>
            <span className="text-2xl font-black font-['Cinzel'] text-[#ffd166]">{grade}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#1a1a1a] rounded border border-[#333] flex items-center gap-3">
            <div className="p-2 bg-[#d90429]/20 rounded text-[#e63946]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[#adb5bd]">累計總輸出傷害</div>
              <div className="text-base font-bold font-mono text-[#f8f9fa]">
                {stats.damageDealt.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] rounded border border-[#333] flex items-center gap-3">
            <div className="p-2 bg-[#3a86ff]/20 rounded text-[#3a86ff]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[#adb5bd]">完美殘心成功數</div>
              <div className="text-base font-bold font-mono text-[#00f5d4]">
                {stats.perfectZanshinCount} 次
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] rounded border border-[#333] flex items-center gap-3">
            <div className="p-2 bg-[#ff0055]/20 rounded text-[#ff0055]">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[#adb5bd]">氣絕近身刺擊數</div>
              <div className="text-base font-bold font-mono text-[#ff0055]">
                {stats.grappleCount} 次
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] rounded border border-[#333] flex items-center gap-3">
            <div className="p-2 bg-[#7209b7]/20 rounded text-[#b5179e]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[#adb5bd]">常世祓除淨化數</div>
              <div className="text-base font-bold font-mono text-[#70d6ff]">
                {stats.yokaiPurifiedCount} 處
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] rounded border border-[#333] flex items-center gap-3">
            <div>
              <div className="text-[#adb5bd]">最高連擊數 (Combo)</div>
              <div className="text-base font-bold font-mono text-[#ffd166]">
                {stats.maxCombo} 連斬
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a1a1a] rounded border border-[#333] flex items-center gap-3">
            <div>
              <div className="text-[#adb5bd]">陣營交鋒時長</div>
              <div className="text-base font-bold font-mono text-[#f8f9fa]">
                {durationSec} 秒
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2b2b2b] hover:bg-[#3b3b3b] text-white font-bold rounded transition-colors cursor-pointer text-xs"
          >
            關閉戰報
          </button>
        </div>
      </div>
    </div>
  );
};
