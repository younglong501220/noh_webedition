import { useEffect, useRef, useState, useCallback } from 'react';
import { NiohGameEngine } from './game/engine';
import { GameState, Stance, CombatStats, Player, Enemy } from './game/types';
import { Header } from './components/Header';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { StatsModal } from './components/StatsModal';
import { OverlayScreens } from './components/OverlayScreens';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<NiohGameEngine | null>(null);

  // React UI States
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [playerState, setPlayerState] = useState<Player | null>(null);
  const [bossEnemy, setBossEnemy] = useState<Enemy | undefined>(undefined);
  const [combatStats, setCombatStats] = useState<CombatStats>({
    damageDealt: 0,
    damageTaken: 0,
    perfectZanshinCount: 0,
    regularZanshinCount: 0,
    grappleCount: 0,
    yokaiPurifiedCount: 0,
    enemiesDefeated: 0,
    maxCombo: 0,
    startTime: Date.now(),
    endTime: 0,
  });

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(true);

  // Initialize engine on canvas mount
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new NiohGameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStateChange = (state) => {
      setGameState(state);
    };

    engine.onWaveChange = (wave) => {
      setCurrentWave(wave);
    };

    engine.onStatsChange = (stats) => {
      setCombatStats({ ...stats });
    };

    setPlayerState({ ...engine.player });

    // Game loop
    let animId: number;
    let lastHudSync = 0;

    const loop = (timestamp: number) => {
      engine.update();
      engine.draw();

      // Synchronize HUD state with UI at ~30-40fps to avoid excessive React renders
      if (timestamp - lastHudSync > 24) {
        lastHudSync = timestamp;
        setPlayerState({ ...engine.player });
        setBossEnemy(engine.enemies.find((en) => en.type === 'boss'));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // Handlers
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startGame();
      setGameState('PLAYING');
    }
  }, []);

  const handleSwitchStance = useCallback((stance: Stance) => {
    if (engineRef.current && engineRef.current.state === 'PLAYING') {
      engineRef.current.switchStance(stance);
    }
  }, []);

  const handleActivateLivingWeapon = useCallback(() => {
    if (engineRef.current && engineRef.current.state === 'PLAYING') {
      engineRef.current.activateLivingWeapon();
    }
  }, []);

  const handleTouchKeyDown = useCallback((key: string) => {
    if (!engineRef.current) return;
    const k = key.toLowerCase();
    engineRef.current.keys[k] = true;

    if (engineRef.current.state === 'PLAYING') {
      if (k === 'j') {
        engineRef.current.handleAttack('LIGHT');
      } else if (k === 'k') {
        const grappleTarget = engineRef.current.enemies.find(
          (en) => en.isWinded && Math.abs(en.x - engineRef.current!.player.x) < 95
        );
        if (grappleTarget) {
          engineRef.current.executeGrapple(grappleTarget);
        } else {
          engineRef.current.handleAttack('HEAVY');
        }
      } else if (k === ' ') {
        engineRef.current.handleSpacebar();
      } else if (k === 'q') {
        engineRef.current.activateLivingWeapon();
      }
    }
  }, []);

  const handleTouchKeyUp = useCallback((key: string) => {
    if (engineRef.current) {
      engineRef.current.keys[key.toLowerCase()] = false;
    }
  }, []);

  const canGrapple = Boolean(
    engineRef.current?.enemies.some(
      (en) => en.isWinded && Math.abs(en.x - (playerState?.x || 0)) < 95
    )
  );

  return (
    <div className="min-h-screen bg-[#080708] text-[#f5f3f4] flex flex-col items-center justify-between selection:bg-[#e63946] selection:text-white">
      {/* Top Bar Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenStats={() => {
          if (engineRef.current) {
            setCombatStats({ ...engineRef.current.stats });
          }
          setIsStatsOpen(true);
        }}
        onRestart={handleStartGame}
      />

      {/* Main Game Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl">
        <div className="relative w-full aspect-video max-w-5xl rounded-lg overflow-hidden border-2 border-[#660708] bg-black shadow-[0_0_40px_rgba(186,24,27,0.4),0_0_15px_rgba(0,0,0,0.9)]">
          {/* Game Canvas (Fixed internal res 960x540 for high performance) */}
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full block object-contain"
          />

          {/* Interactive HUD Overlay */}
          {playerState && gameState === 'PLAYING' && (
            <HUD
              player={playerState}
              currentWave={currentWave}
              maxWaves={3}
              boss={bossEnemy}
              onSwitchStance={handleSwitchStance}
              onActivateLivingWeapon={handleActivateLivingWeapon}
            />
          )}

          {/* Start / Game Over / Victory Overlays */}
          <OverlayScreens
            state={gameState}
            stats={combatStats}
            onStart={handleStartGame}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenStats={() => {
              if (engineRef.current) {
                setCombatStats({ ...engineRef.current.stats });
              }
              setIsStatsOpen(true);
            }}
          />
        </div>

        {/* Touch & Quick Controls Section */}
        {showTouchControls && playerState && gameState === 'PLAYING' && (
          <TouchControls
            onKeyDown={handleTouchKeyDown}
            onKeyUp={handleTouchKeyUp}
            onSwitchStance={handleSwitchStance}
            currentStance={playerState.stance}
            canGrapple={canGrapple}
            canZanshin={playerState.canZanshin}
            isLivingWeaponReady={playerState.amrita >= playerState.maxAmrita}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-5xl px-4 py-2 border-t border-[#1c1917] flex items-center justify-between text-[11px] text-[#6c757d]">
        <div>
          <span>致敬 KOEI TECMO《仁王》動作哲學 · </span>
          <span className="text-[#a8dadc]">架勢切換 · 殘心流轉 · 氣絕近身刺擊</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="hover:text-[#adb5bd] cursor-pointer"
          >
            {showTouchControls ? '隱藏觸控鍵' : '顯示觸控鍵'}
          </button>
          <span>100% 網頁純代碼運算</span>
        </div>
      </footer>

      {/* Modals */}
      <ControlsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={combatStats}
      />
    </div>
  );
}
