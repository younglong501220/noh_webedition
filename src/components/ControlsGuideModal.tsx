import React from 'react';
import { X, Zap, Shield, Sparkles, RefreshCw, Flame, Crosshair } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141414] border border-[#660708] rounded-lg p-6 shadow-[0_0_30px_rgba(186,24,27,0.5)] text-[#f5f3f4]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#8d99ae] hover:text-white hover:bg-[#2b2b2b] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6 border-b border-[#2b2b2b] pb-3">
          <h2 className="text-xl font-bold font-['Noto_Serif_TC'] text-[#e63946] flex items-center gap-2">
            <span>戰國生存秘傳書</span>
            <span className="text-xs text-[#a8dadc] font-normal border-l border-[#444] pl-2">
              《仁王》核心戰鬥奧義
            </span>
          </h2>
          <p className="text-xs text-[#adb5bd] mt-1">
            熟習架勢變化、殘心流轉與弱點刺擊，方能在妖魔橫行的亂世落命之刻中奪得生機。
          </p>
        </div>

        {/* Section 1: Three Stances */}
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold text-sm text-[#ffd166] mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#ffd166]" />
              <span>一、三段架勢切換 (按鍵 1 / 2 / 3)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-[#1b1013] border border-[#e63946]/40 rounded">
                <div className="font-bold text-[#e63946] flex items-center justify-between mb-1">
                  <span>上段 (強攻)</span>
                  <span className="text-[10px] bg-[#e63946]/20 px-1 rounded">1</span>
                </div>
                <p className="text-xs text-[#ced4da] leading-relaxed">
                  傷害與精力削減最高，攻擊範圍大。能輕易崩解敵人防禦，但出刀慢且消耗精力極大。
                </p>
              </div>

              <div className="p-3 bg-[#0d1b2a] border border-[#3a86ff]/40 rounded">
                <div className="font-bold text-[#70d6ff] flex items-center justify-between mb-1">
                  <span>中段 (均衡/守)</span>
                  <span className="text-[10px] bg-[#3a86ff]/20 px-1 rounded">2</span>
                </div>
                <p className="text-xs text-[#ced4da] leading-relaxed">
                  攻守兼備，格擋時精力消耗減半！面對未知攻擊或強敵連擊時最穩健的架勢。
                </p>
              </div>

              <div className="p-3 bg-[#081c15] border border-[#06d6a0]/40 rounded">
                <div className="font-bold text-[#06d6a0] flex items-center justify-between mb-1">
                  <span>下段 (迅捷/連擊)</span>
                  <span className="text-[10px] bg-[#06d6a0]/20 px-1 rounded">3</span>
                </div>
                <p className="text-xs text-[#ced4da] leading-relaxed">
                  出刀極快，翻滾迴避精力消耗最少、無敵幀充裕，適合快速突刺牽制與躲避重擊。
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Ki Pulse */}
          <div className="p-3.5 bg-[#0a1128] border border-[#0077b6]/50 rounded">
            <h3 className="font-bold text-sm text-[#00f5d4] mb-1.5 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>二、殘心與常世祓除 (按鍵 空白鍵)</span>
            </h3>
            <p className="text-xs text-[#ced4da] leading-relaxed mb-2">
              出刀後精力條會留下<strong className="text-white">白色潛在精力</strong>，且角色身旁會出現收縮的光環。在光環剛好收聚時按下【空白鍵】，即可發動【完美殘心】：
            </p>
            <ul className="text-xs text-[#a8dadc] space-y-1 list-disc list-inside">
              <li>瞬間回收全部消耗精力，並額外獎勵 25% 額外精力！</li>
              <li>立即祓除身邊妖怪留下的黑紫霧池（常世），恢復正常精力回復速度！</li>
              <li>大幅累積九十九武器精華（Amrita）。</li>
            </ul>
          </div>

          {/* Section 3: Grapple & Horn Break */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#250902] border border-[#d90429]/50 rounded">
              <h3 className="font-bold text-sm text-[#ff4d6d] mb-1.5 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4" />
                <span>三、氣絕處決 (按鍵 K)</span>
              </h3>
              <p className="text-xs text-[#ced4da] leading-relaxed">
                將敵人精力打空後，敵人會陷入無法動彈的虛脫氣絕狀態（全身冒出劇烈紅光）。此時貼近按下【K 鍵】，即可觸發極高威力的「近身刺擊」！
              </p>
            </div>

            <div className="p-3.5 bg-[#1f1604] border border-[#ffbe0b]/50 rounded">
              <h3 className="font-bold text-sm text-[#ffbe0b] mb-1.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>四、妖鬼破角秘訣</span>
              </h3>
              <p className="text-xs text-[#ced4da] leading-relaxed">
                第二陣的妖鬼頭頂長著金角。在正面對峙時，切換為<strong className="text-[#ffd166]">【上段】</strong>並按下<strong className="text-[#ffd166]">【重攻擊 K】</strong>垂直斬下，可一擊斬斷其金角，令其精力直接歸零倒地！
              </p>
            </div>
          </div>

          {/* Section 4: Living Weapon */}
          <div className="p-3.5 bg-[#2b0914] border border-[#ff0055]/50 rounded">
            <h3 className="font-bold text-sm text-[#ffbe0b] mb-1.5 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#ffbe0b]" />
              <span>五、九十九武器·炎神降臨 (按鍵 Q)</span>
            </h3>
            <p className="text-xs text-[#ced4da] leading-relaxed">
              透過擊敗敵人與完美殘心蓄滿精華槽（100%）後，按下【Q 鍵】即可解放守護靈！10 秒內刀刃燃起金炎，所有招式不消耗精力、傷害大幅提升，並減少 50% 受到的傷害！
            </p>
          </div>
        </div>

        {/* Footer OK button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#ba181b] to-[#e63946] text-white font-bold rounded hover:opacity-90 transition-opacity cursor-pointer text-xs"
          >
            領悟奧義，返回戰場
          </button>
        </div>
      </div>
    </div>
  );
};
