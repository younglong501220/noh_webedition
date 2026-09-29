import React from 'react';
import { Volume2, VolumeX, BookOpen, BarChart3, RotateCcw } from 'lucide-react';
import { sound } from '../game/audio';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenStats: () => void;
  onRestart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenStats,
  onRestart,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 py-3 border-b border-[#2b2b2b] bg-[#0d0d0d]/80 backdrop-blur-sm z-30">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3">
        <span className="font-['Cinzel'] tracking-wider text-xl font-black text-[#e63946] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(230,57,70,0.5)]">
          仁王 <span className="text-xs tracking-widest text-[#a8dadc] font-normal border-l border-[#444] pl-2">落命之刻</span>
        </span>
      </div>

      {/* Zone 2: Navigation actions */}
      <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#f5f3f4]">
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 hover:text-[#e63946] transition-colors py-1 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#e63946]" />
          <span>戰鬥傳書</span>
        </button>
        <button
          onClick={onOpenStats}
          className="flex items-center gap-1.5 hover:text-[#e63946] transition-colors py-1 cursor-pointer"
        >
          <BarChart3 className="w-4 h-4 text-[#ffd166]" />
          <span>戰果統計</span>
        </button>
        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 hover:text-[#e63946] transition-colors py-1 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#06d6a0]" />
          <span>重新開局</span>
        </button>
      </nav>

      {/* Zone 3: Primary action & sound */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleMute}
          aria-label={isMuted ? '解除靜音' : '靜音'}
          className={`p-2 rounded border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
            isMuted
              ? 'bg-[#1c1917] text-[#adb5bd] border-[#343a40]'
              : 'bg-[#1b263b] text-[#70d6ff] border-[#3a86ff]/40 shadow-[0_0_10px_rgba(58,134,255,0.2)]'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden md:inline">{isMuted ? '靜音' : '音效開啟'}</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="sm:hidden p-2 rounded border border-[#660708] bg-[#1a0a0d] text-[#e63946] text-xs font-bold"
        >
          傳書
        </button>
      </div>
    </header>
  );
};
