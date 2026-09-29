export type Stance = 'HIGH' | 'MID' | 'LOW';

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type EnemyType = 'samurai' | 'yoki' | 'boss';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'blood' | 'petal' | 'ember' | 'ki' | 'shockwave';
  alpha?: number;
}

export interface DamageNumber {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export interface TokoyoPuddle {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  pulseOffset: number;
}

export interface Hitbox {
  x: number;
  y: number;
  w: number;
  h: number;
  dmg: number;
  kiDmg: number;
  isHeavy: boolean;
  knockback: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  dir: 1 | -1; // 1 = right, -1 = left
  hp: number;
  maxHp: number;
  ki: number;
  maxKi: number;
  kiRecoverRate: number;
  stance: Stance;

  // Ki Pulse (殘心)
  potentialKi: number;
  zanshinTimer: number;
  zanshinMax: number;
  canZanshin: boolean;
  perfectZanshinWindow: boolean;

  // Combat States
  isAttacking: boolean;
  attackType: 'LIGHT' | 'HEAVY' | 'GRAPPLE' | 'LIVING_SLASH';
  attackTimer: number;
  attackDuration: number;
  attackComboStep: number;
  comboResetTimer: number;
  isGuarding: boolean;
  isDodging: boolean;
  dodgeTimer: number;
  isWinded: boolean;
  windedTimer: number;
  invulnerableTimer: number;

  // Living Weapon (九十九武器)
  amrita: number;
  maxAmrita: number;
  isLivingWeaponActive: boolean;
  livingWeaponTimer: number;
  maxLivingWeaponDuration: number;

  // Visuals
  trail: { x: number; y: number; dir: number; stance: Stance; alpha: number }[];
}

export interface Enemy {
  id: number;
  type: EnemyType;
  name: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  dir: 1 | -1;
  hp: number;
  maxHp: number;
  ki: number;
  maxKi: number;
  state: 'IDLE' | 'CHASE' | 'ATTACK_PREP' | 'ATTACKING' | 'RECOVER' | 'WINDED' | 'HORN_BROKEN';
  stateTimer: number;
  attackTimer: number;
  attackCooldown: number;
  isWinded: boolean;
  windedTimer: number;
  hasHorn: boolean; // For Yoki
  color: string;
  currentAttack: string;
  isAttacking: boolean;
}

export interface CombatStats {
  damageDealt: number;
  damageTaken: number;
  perfectZanshinCount: number;
  regularZanshinCount: number;
  grappleCount: number;
  yokaiPurifiedCount: number;
  enemiesDefeated: number;
  maxCombo: number;
  startTime: number;
  endTime: number;
}
