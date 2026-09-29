import React from 'react';
import { Player, Enemy, Stance } from '../game/types';
import { Flame, Shield, Zap, Sparkles } from 'lucide-react';

interface HUDProps {
  player: Player;
  currentWave: number;
  maxWaves: number;
  boss?: Enemy;
  onSwitchStance: (stance: Stance) => void;
  onActivateLivingWeapon: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  currentWave,
  maxWaves,
  boss,
  onSwitchStance,
  onActivateLivingWeapon,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const kiPercent = Math.max(0, Math.min(100, (player.ki / player.maxKi) * 100));
  const potentialKiPercent = Math.max(
    0,
    Math.min(100, ((player.ki + player.potentialKi) / player.maxKi) * 100)
  );
  const amritaPercent = Math.min(100, (player.amrita / player.maxAmrita) * 100);

  return (
    <div className="pointer-events-none select-none absolute inset-0 flex flex-col justify-between p-4 z-20">
      {/* Top Left: Player Status Bar */}
      <div className="flex flex-col gap-2 max-w-sm">
        {/* HP Bar */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#f5f3f4] drop-shadow">
            <span className="flex items-center gap-1 text-[#2a9d8f]">
              <span className="text-[10px] bg-[#1a3832] px-1 rounded border border-[#2a9d8f]/50">HP</span>
              <span>體力</span>
            </span>
            <span className="font-mono text-[11px] text-[#e0e1dd]">
              {Math.ceil(player.hp)} / {player.maxHp}
            </span>
          </div>
          <div className="w-64 sm:w-72 h-3.5 bg-[#1a1a1a]/90 rounded-sm border border-[#333] overflow-hidden p-[1px] shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <div
              className="h-full bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#52b788] transition-all duration-75"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Ki (Stamina) Bar */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#f5f3f4] drop-shadow">
            <span className="flex items-center gap-1 text-[#3a86ff]">
              <span className="text-[10px] bg-[#102340] px-1 rounded border border-[#3a86ff]/50">KI</span>
              <span>精力</span>
              {player.isWinded && (
                <span className="text-[#e63946] animate-pulse text-[10px] bg-[#3a0808] px-1 rounded">
                  氣絕！
                </span>
              )}
              {player.canZanshin && (
                <span className={`text-[10px] px-1.5 rounded animate-bounce ${player.perfectZanshinWindow ? 'bg-[#00f5d4] text-black font-black' : 'bg-[#70d6ff] text-black font-bold'}`}>
                  {player.perfectZanshinWindow ? '完美殘心 [SPACE]' : '殘心可'}
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-[#e0e1dd]">
              {Math.ceil(player.ki)} / {player.maxKi}
            </span>
          </div>

          <div className="relative w-64 sm:w-72 h-3 bg-[#1a1a1a]/90 rounded-sm border border-[#333] overflow-hidden p-[1px] shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {/* Potential Recoverable Ki White Flash */}
            {player.potentialKi > 0 && (
              <div
                className={`absolute top-[1px] bottom-[1px] left-[1px] transition-all duration-75 ${
                  player.perfectZanshinWindow
                    ? 'bg-gradient-to-r from-[#00f5d4] to-white animate-pulse'
                    : 'bg-white/80'
                }`}
                style={{ width: `${potentialKiPercent}%` }}
              />
            )}

            {/* Current Active Ki */}
            <div
              className="relative h-full bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] transition-all duration-75"
              style={{ width: `${kiPercent}%` }}
            />
          </div>
        </div>

        {/* Stance Selector and Living Weapon Row */}
        <div className="pointer-events-auto flex items-center gap-3 mt-1">
          {/* Stances */}
          <div className="flex items-center gap-1 bg-[#121212]/90 p-1 rounded border border-[#2b2b2b] shadow-lg backdrop-blur-sm">
            <button
              onClick={() => onSwitchStance('HIGH')}
              className={`px-2 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1 ${
                player.stance === 'HIGH'
                  ? 'bg-gradient-to-b from-[#e63946] to-[#9d0208] text-white shadow-[0_0_10px_rgba(230,57,70,0.8)] border border-[#ff4d6d]'
                  : 'text-[#8d99ae] hover:text-[#f5f3f4] hover:bg-[#222]'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>上段</span>
              <span className="text-[10px] opacity-70">(1)</span>
            </button>

            <button
              onClick={() => onSwitchStance('MID')}
              className={`px-2 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1 ${
                player.stance === 'MID'
                  ? 'bg-gradient-to-b from-[#3a86ff] to-[#023e8a] text-white shadow-[0_0_10px_rgba(58,134,255,0.8)] border border-[#70d6ff]'
                  : 'text-[#8d99ae] hover:text-[#f5f3f4] hover:bg-[#222]'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>中段</span>
              <span className="text-[10px] opacity-70">(2)</span>
            </button>

            <button
              onClick={() => onSwitchStance('LOW')}
              className={`px-2 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1 ${
                player.stance === 'LOW'
                  ? 'bg-gradient-to-b from-[#06d6a0] to-[#0a9396] text-white shadow-[0_0_10px_rgba(6,214,160,0.8)] border border-[#52b788]'
                  : 'text-[#8d99ae] hover:text-[#f5f3f4] hover:bg-[#222]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>下段</span>
              <span className="text-[10px] opacity-70">(3)</span>
            </button>
          </div>

          {/* Living Weapon (九十九武器) Button */}
          <button
            onClick={onActivateLivingWeapon}
            disabled={player.amrita < player.maxAmrita || player.isLivingWeaponActive}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer border ${
              player.isLivingWeaponActive
                ? 'bg-gradient-to-r from-[#ffbe0b] to-[#fb5607] text-black border-[#ffbe0b] shadow-[0_0_15px_rgba(255,190,11,0.9)] animate-pulse'
                : player.amrita >= player.maxAmrita
                ? 'bg-gradient-to-r from-[#d90429] to-[#ffbe0b] text-white border-[#ffbe0b] shadow-[0_0_12px_rgba(255,190,11,0.8)] animate-bounce'
                : 'bg-[#1a1a1a]/80 text-[#6c757d] border-[#333]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#ffbe0b]" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] font-bold">九十九武器</span>
              <span className="text-[9px] font-mono">
                {player.isLivingWeaponActive
                  ? `解放中 (${Math.ceil(player.livingWeaponTimer / 60)}s)`
                  : player.amrita >= player.maxAmrita
                  ? '按 Q 解放！'
                  : `${Math.floor(amritaPercent)}%`}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Top Center: Boss Health Bar (Wave 3) */}
      {boss && currentWave === maxWaves && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 flex flex-col items-center gap-1">
          <div className="flex items-center justify-between w-full text-xs font-bold text-[#ffbe0b] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <span className="tracking-widest text-sm font-['Noto_Serif_TC']">{boss.name}</span>
            <span className="text-[10px] text-[#adb5bd]">{boss.title}</span>
          </div>

          {/* Boss HP Bar */}
          <div className="w-full h-3 bg-[#111] border border-[#660708] rounded-sm overflow-hidden p-[1px] shadow-[0_0_12px_rgba(230,57,70,0.6)]">
            <div
              className="h-full bg-gradient-to-r from-[#590d22] via-[#800f2f] to-[#ff4d6d] transition-all duration-75"
              style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
            />
          </div>

          {/* Boss Ki Bar */}
          <div className="w-full h-1.5 bg-[#111] border border-[#222] rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                boss.isWinded ? 'bg-[#ff0055] animate-pulse' : 'bg-[#70d6ff]'
              }`}
              style={{ width: `${Math.max(0, (boss.ki / boss.maxKi) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Area: Controls Hotkey Reminder */}
      <div className="w-full flex items-center justify-between text-[11px] text-[#adb5bd] drop-shadow">
        <div className="hidden sm:flex items-center gap-3 bg-[#000000]/60 px-3 py-1.5 rounded border border-[#2b2b2b]">
          <span>移動: <kbd className="text-[#e63946] font-bold">A</kbd> / <kbd className="text-[#e63946] font-bold">D</kbd></span>
          <span>輕斬: <kbd className="text-[#e63946] font-bold">J</kbd></span>
          <span>重斬/刺擊: <kbd className="text-[#e63946] font-bold">K</kbd></span>
          <span>防禦: <kbd className="text-[#e63946] font-bold">L</kbd></span>
          <span>翻滾/殘心: <kbd className="text-[#e63946] font-bold">空白鍵</kbd></span>
          <span>九十九武器: <kbd className="text-[#ffbe0b] font-bold">Q</kbd></span>
        </div>

        <div className="text-right ml-auto text-xs font-semibold text-[#f5f3f4] bg-[#000000]/60 px-3 py-1.5 rounded border border-[#2b2b2b]">
          當前架勢特性: {player.stance === 'HIGH' ? '上段·重擊崩解破防' : player.stance === 'MID' ? '中段·格擋精力減半' : '下段·疾速連擊極敏'}
        </div>
      </div>
    </div>
  );
};
