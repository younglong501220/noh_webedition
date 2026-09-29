import { sound } from './audio';
import bgImageSrc from '../assets/images/nioh_sengoku_battlefield_1790696264982.jpg';
import {
  CombatStats,
  DamageNumber,
  Enemy,
  EnemyType,
  GameState,
  Particle,
  Player,
  Stance,
  TokoyoPuddle,
} from './types';

export class NiohGameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public state: GameState = 'START';
  public currentWave: number = 1;
  public maxWaves: number = 3;

  public player: Player;
  public enemies: Enemy[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public tokoyoPuddles: TokoyoPuddle[] = [];
  public stats: CombatStats;

  public screenShake: number = 0;
  public hitPauseFrames: number = 0;
  public currentCombo: number = 0;
  public comboTimer: number = 0;

  // Background asset
  private bgImage: HTMLImageElement | null = null;
  private bgLoaded: boolean = false;

  // Input states
  public keys: Record<string, boolean> = {};

  // Listeners
  public onStateChange?: (state: GameState) => void;
  public onWaveChange?: (wave: number) => void;
  public onStatsChange?: (stats: CombatStats) => void;

  private nextDamageId = 1;
  private nextPuddleId = 1;
  private nextEnemyId = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.player = this.createDefaultPlayer();
    this.stats = this.createInitialStats();

    this.loadAssets();
    this.setupKeyboard();
  }

  private loadAssets() {
    this.bgImage = new Image();
    this.bgImage.src = bgImageSrc;
    this.bgImage.onload = () => {
      this.bgLoaded = true;
    };
  }

  private createDefaultPlayer(): Player {
    return {
      x: 180,
      y: 350,
      w: 46,
      h: 84,
      vx: 0,
      dir: 1,
      hp: 1000,
      maxHp: 1000,
      ki: 350,
      maxKi: 350,
      kiRecoverRate: 1.4,
      stance: 'MID',

      potentialKi: 0,
      zanshinTimer: 0,
      zanshinMax: 60,
      canZanshin: false,
      perfectZanshinWindow: false,

      isAttacking: false,
      attackType: 'LIGHT',
      attackTimer: 0,
      attackDuration: 0,
      attackComboStep: 1,
      comboResetTimer: 0,
      isGuarding: false,
      isDodging: false,
      dodgeTimer: 0,
      isWinded: false,
      windedTimer: 0,
      invulnerableTimer: 0,

      amrita: 30,
      maxAmrita: 100,
      isLivingWeaponActive: false,
      livingWeaponTimer: 0,
      maxLivingWeaponDuration: 600, // 10 seconds at 60fps

      trail: [],
    };
  }

  private createInitialStats(): CombatStats {
    return {
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
    };
  }

  public setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;

      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
      }

      if (this.state === 'START' || this.state === 'GAMEOVER' || this.state === 'VICTORY') {
        if (k === ' ' || k === 'enter') {
          this.startGame();
        }
        return;
      }

      if (this.state === 'PLAYING') {
        // Stance switches
        if (k === '1') this.switchStance('HIGH');
        if (k === '2') this.switchStance('MID');
        if (k === '3') this.switchStance('LOW');

        // Living weapon
        if (k === 'q' || k === 'e') {
          this.activateLivingWeapon();
        }

        // Attacks
        if (k === 'j') {
          this.handleAttack('LIGHT');
        } else if (k === 'k') {
          // Check for Grapple opportunity
          const grappleTarget = this.enemies.find(
            (en) => en.isWinded && Math.abs(en.x - this.player.x) < 95
          );
          if (grappleTarget) {
            this.executeGrapple(grappleTarget);
          } else {
            this.handleAttack('HEAVY');
          }
        }

        // Zanshin or Dodge with Spacebar
        if (e.key === ' ') {
          this.handleSpacebar();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  public startGame() {
    this.player = this.createDefaultPlayer();
    this.stats = this.createInitialStats();
    this.currentWave = 1;
    this.particles = [];
    this.damageNumbers = [];
    this.tokoyoPuddles = [];
    this.currentCombo = 0;
    this.comboTimer = 0;
    this.initWave(this.currentWave);
    this.state = 'PLAYING';
    this.onStateChange?.(this.state);
    this.onWaveChange?.(this.currentWave);
  }

  public initWave(wave: number) {
    this.enemies = [];
    this.tokoyoPuddles = [];
    if (wave === 1) {
      this.enemies.push(this.createEnemy('samurai', 700, 350));
    } else if (wave === 2) {
      this.enemies.push(this.createEnemy('yoki', 720, 330));
    } else if (wave === 3) {
      this.enemies.push(this.createEnemy('boss', 690, 280));
    }
  }

  private createEnemy(type: EnemyType, x: number, y: number): Enemy {
    const id = this.nextEnemyId++;
    if (type === 'samurai') {
      return {
        id,
        type: 'samurai',
        name: '惡鬼落武者',
        title: '戰國背信落單武士',
        x,
        y,
        w: 48,
        h: 84,
        vx: 0,
        dir: -1,
        hp: 900,
        maxHp: 900,
        ki: 280,
        maxKi: 280,
        state: 'IDLE',
        stateTimer: 0,
        attackTimer: 0,
        attackCooldown: 100,
        isWinded: false,
        windedTimer: 0,
        hasHorn: false,
        color: '#d90429',
        currentAttack: 'katana_slash',
        isAttacking: false,
      };
    } else if (type === 'yoki') {
      return {
        id,
        type: 'yoki',
        name: '雙角妖鬼',
        title: '精華侵蝕之魔物',
        x,
        y,
        w: 64,
        h: 105,
        vx: 0,
        dir: -1,
        hp: 1750,
        maxHp: 1750,
        ki: 420,
        maxKi: 420,
        state: 'IDLE',
        stateTimer: 0,
        attackTimer: 0,
        attackCooldown: 90,
        isWinded: false,
        windedTimer: 0,
        hasHorn: true,
        color: '#7b1113',
        currentAttack: 'cleaver_smash',
        isAttacking: false,
      };
    } else {
      return {
        id,
        type: 'boss',
        name: '巨軀怨靈鬼',
        title: '怨念與血海凝聚之鬼神',
        x,
        y,
        w: 100,
        h: 155,
        vx: 0,
        dir: -1,
        hp: 4200,
        maxHp: 4200,
        ki: 750,
        maxKi: 750,
        state: 'IDLE',
        stateTimer: 0,
        attackTimer: 0,
        attackCooldown: 80,
        isWinded: false,
        windedTimer: 0,
        hasHorn: true,
        color: '#2b0914',
        currentAttack: 'iron_ball_slam',
        isAttacking: false,
      };
    }
  }

  public switchStance(newStance: Stance) {
    if (this.player.stance === newStance) return;
    this.player.stance = newStance;
    sound.play('stance_switch');

    // Aura burst on stance switch
    const color =
      newStance === 'HIGH' ? '#ff4d6d' : newStance === 'MID' ? '#3a86ff' : '#06d6a0';
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.player.x + this.player.w / 2,
        y: this.player.y + this.player.h - 10,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4,
        color,
        size: Math.random() * 3 + 2,
        life: 20,
        maxLife: 20,
        type: 'ki',
      });
    }
  }

  public handleAttack(type: 'LIGHT' | 'HEAVY') {
    const p = this.player;
    if (p.isAttacking || p.isDodging || p.isWinded) return;

    let kiCost = 0;
    let duration = 0;

    if (p.isLivingWeaponActive) {
      kiCost = 0;
      duration = type === 'LIGHT' ? 14 : 22;
    } else {
      if (p.stance === 'HIGH') {
        kiCost = type === 'LIGHT' ? 42 : 68;
        duration = type === 'LIGHT' ? 24 : 35;
      } else if (p.stance === 'MID') {
        kiCost = type === 'LIGHT' ? 28 : 48;
        duration = type === 'LIGHT' ? 18 : 26;
      } else {
        kiCost = type === 'LIGHT' ? 16 : 30;
        duration = type === 'LIGHT' ? 12 : 18;
      }
    }

    if (p.ki < kiCost && !p.isLivingWeaponActive) return;

    if (!p.isLivingWeaponActive) {
      p.ki = Math.max(0, p.ki - kiCost);
      p.potentialKi = Math.min(p.maxKi, p.potentialKi + kiCost);
      p.zanshinTimer = p.zanshinMax;
      p.canZanshin = false;
      p.perfectZanshinWindow = false;
    }

    p.isAttacking = true;
    p.attackType = p.isLivingWeaponActive ? 'LIVING_SLASH' : type;
    p.attackDuration = duration;
    p.attackTimer = duration;

    // Advance combo step
    p.attackComboStep = (p.attackComboStep % 3) + 1;
    p.comboResetTimer = 45;

    sound.play(type === 'LIGHT' ? 'slash_light' : 'slash_heavy');
  }

  public handleSpacebar() {
    const p = this.player;
    // Check if in Zanshin timing window
    if (p.canZanshin && p.potentialKi > 0) {
      this.executeZanshin();
    } else if (!p.isDodging && !p.isAttacking && !p.isWinded && (p.ki >= 28 || p.isLivingWeaponActive)) {
      this.startDodge();
    }
  }

  public executeZanshin() {
    const p = this.player;
    const isPerfect = p.zanshinTimer <= 22; // Perfect window near bottom of contraction
    let recovered = p.potentialKi;

    if (isPerfect) {
      recovered = p.potentialKi * 1.3;
      p.amrita = Math.min(p.maxAmrita, p.amrita + 14);
      this.stats.perfectZanshinCount++;
      sound.play('zanshin_perfect');

      // Purify nearby Tokoyo puddles
      const beforeCount = this.tokoyoPuddles.length;
      this.tokoyoPuddles = this.tokoyoPuddles.filter(
        (puddle) => Math.abs(puddle.x - (p.x + p.w / 2)) > 190
      );
      const cleansed = beforeCount - this.tokoyoPuddles.length;
      if (cleansed > 0) {
        this.stats.yokaiPurifiedCount += cleansed;
        this.damageNumbers.push({
          id: this.nextDamageId++,
          x: p.x + p.w / 2,
          y: p.y - 35,
          text: '常世祓除！',
          color: '#00f5d4',
          life: 40,
          maxLife: 40,
          isCrit: true,
        });
      }

      this.damageNumbers.push({
        id: this.nextDamageId++,
        x: p.x + p.w / 2,
        y: p.y - 15,
        text: '完美殘心！',
        color: '#00f5d4',
        life: 35,
        maxLife: 35,
        isCrit: true,
      });

      // Shimmering teal ki particles
      for (let i = 0; i < 28; i++) {
        const ang = (Math.PI * 2 * i) / 28;
        this.particles.push({
          x: p.x + p.w / 2,
          y: p.y + p.h / 2,
          vx: Math.cos(ang) * (Math.random() * 5 + 3),
          vy: Math.sin(ang) * (Math.random() * 5 + 3),
          color: '#00f5d4',
          size: Math.random() * 3 + 2,
          life: 25,
          maxLife: 25,
          type: 'spark',
        });
      }
    } else {
      this.stats.regularZanshinCount++;
      sound.play('zanshin_regular');
      this.damageNumbers.push({
        id: this.nextDamageId++,
        x: p.x + p.w / 2,
        y: p.y - 15,
        text: '殘心',
        color: '#70d6ff',
        life: 25,
        maxLife: 25,
      });

      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x: p.x + p.w / 2 + (Math.random() - 0.5) * 40,
          y: p.y + p.h / 2 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          color: '#70d6ff',
          size: 3,
          life: 20,
          maxLife: 20,
          type: 'ki',
        });
      }
    }

    p.ki = Math.min(p.maxKi, p.ki + recovered);
    p.potentialKi = 0;
    p.canZanshin = false;
    p.zanshinTimer = 0;
  }

  public startDodge() {
    const p = this.player;
    const kiCost = p.stance === 'LOW' ? 16 : p.stance === 'MID' ? 26 : 40;
    if (!p.isLivingWeaponActive) {
      p.ki = Math.max(0, p.ki - kiCost);
    }

    p.isDodging = true;
    p.dodgeTimer = p.stance === 'LOW' ? 14 : 18;
    p.invulnerableTimer = p.stance === 'LOW' ? 12 : 10;
    p.vx = p.dir * (p.stance === 'LOW' ? 9.5 : p.stance === 'MID' ? 7.5 : 6);
    sound.play('dodge');
  }

  public activateLivingWeapon() {
    const p = this.player;
    if (p.amrita < p.maxAmrita || p.isLivingWeaponActive) return;
    p.isLivingWeaponActive = true;
    p.livingWeaponTimer = p.maxLivingWeaponDuration;
    p.amrita = 0;
    p.ki = p.maxKi;
    p.potentialKi = 0;
    this.screenShake = 14;
    sound.play('living_weapon');

    // Sacred burst
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: p.x + p.w / 2,
        y: p.y + p.h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? '#ffbe0b' : '#ff0055',
        size: Math.random() * 4 + 2,
        life: 35,
        maxLife: 35,
        type: 'spark',
      });
    }

    this.damageNumbers.push({
      id: this.nextDamageId++,
      x: p.x + p.w / 2,
      y: p.y - 40,
      text: '九十九武器·炎神解放！',
      color: '#ffbe0b',
      life: 50,
      maxLife: 50,
      isCrit: true,
    });
  }

  public executeGrapple(target: Enemy) {
    const p = this.player;
    p.isAttacking = true;
    p.attackType = 'GRAPPLE';
    p.attackDuration = 48;
    p.attackTimer = 48;
    p.vx = 0;

    // Face target
    p.dir = target.x > p.x ? 1 : -1;

    const baseGrappleDmg = 520 + (p.isLivingWeaponActive ? 250 : 0);
    target.hp -= baseGrappleDmg;
    target.ki = target.maxKi * 0.4;
    target.isWinded = false;
    target.state = 'RECOVER';
    target.stateTimer = 45;

    this.stats.damageDealt += baseGrappleDmg;
    this.stats.grappleCount++;
    this.currentCombo += 3;
    this.comboTimer = 100;
    this.screenShake = 22;
    this.hitPauseFrames = 5;

    sound.play('grapple');

    // Gushing blood fountains
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: target.x + target.w / 2,
        y: target.y + target.h / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 14,
        color: Math.random() > 0.3 ? '#b00000' : '#800000',
        size: Math.random() * 5 + 3,
        life: 40,
        maxLife: 40,
        type: 'blood',
      });
    }

    this.damageNumbers.push({
      id: this.nextDamageId++,
      x: target.x + target.w / 2,
      y: target.y - 30,
      text: `近身刺擊！ ${baseGrappleDmg}`,
      color: '#ff0055',
      life: 55,
      maxLife: 55,
      isCrit: true,
    });
  }

  public update() {
    if (this.state !== 'PLAYING') return;

    if (this.hitPauseFrames > 0) {
      this.hitPauseFrames--;
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake *= 0.86;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.currentCombo = 0;
      }
    }
    if (this.currentCombo > this.stats.maxCombo) {
      this.stats.maxCombo = this.currentCombo;
    }

    const p = this.player;

    // Check if player is standing in Tokoyo
    const inTokoyo = this.tokoyoPuddles.some(
      (puddle) => Math.abs(puddle.x - (p.x + p.w / 2)) < puddle.radius
    );
    const kiRegen = inTokoyo ? 0.25 : p.kiRecoverRate;

    // Living Weapon countdown
    if (p.isLivingWeaponActive) {
      p.livingWeaponTimer--;
      if (p.livingWeaponTimer <= 0) {
        p.isLivingWeaponActive = false;
        this.damageNumbers.push({
          id: this.nextDamageId++,
          x: p.x + p.w / 2,
          y: p.y - 20,
          text: '九十九武器解鎖完畢',
          color: '#adb5bd',
          life: 30,
          maxLife: 30,
        });
      }
    }

    // Invulnerability frames
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer--;
    }

    // Winded state handling (Out of Ki)
    if (p.ki <= 0 && !p.isWinded && !p.isLivingWeaponActive) {
      p.isWinded = true;
      p.windedTimer = 110;
      p.ki = 0;
      sound.play('winded');
      this.damageNumbers.push({
        id: this.nextDamageId++,
        x: p.x + p.w / 2,
        y: p.y - 25,
        text: '氣絕！',
        color: '#e63946',
        life: 40,
        maxLife: 40,
        isCrit: true,
      });
    }

    if (p.isWinded) {
      p.windedTimer--;
      if (p.windedTimer <= 0) {
        p.isWinded = false;
        p.ki = 85;
      }
    } else {
      // Natural Ki regeneration
      if (!p.isAttacking && !p.isDodging && !p.isGuarding) {
        p.ki = Math.min(p.maxKi, p.ki + kiRegen);
      }
    }

    // Guard state
    p.isGuarding =
      (this.keys['l'] || this.keys['guard']) &&
      !p.isAttacking &&
      !p.isDodging &&
      !p.isWinded;

    // Movement
    if (!p.isAttacking && !p.isDodging && !p.isWinded) {
      let speed = p.stance === 'LOW' ? 4.8 : p.stance === 'MID' ? 3.6 : 2.6;
      if (p.isLivingWeaponActive) speed *= 1.2;
      if (p.isGuarding) speed *= 0.45;

      const movingLeft = this.keys['a'] || this.keys['arrowleft'] || this.keys['left'];
      const movingRight = this.keys['d'] || this.keys['arrowright'] || this.keys['right'];

      if (movingLeft) {
        p.vx = -speed;
        p.dir = -1;
      } else if (movingRight) {
        p.vx = speed;
        p.dir = 1;
      } else {
        p.vx = 0;
      }
    }

    // Dodge physics
    if (p.isDodging) {
      p.dodgeTimer--;
      if (p.dodgeTimer <= 0) {
        p.isDodging = false;
        p.vx = 0;
      }
    }

    p.x += p.vx;
    p.x = Math.max(25, Math.min(this.canvas.width - p.w - 25, p.x));

    // Player motion trail
    if (p.isDodging || p.isLivingWeaponActive || p.stance === 'HIGH') {
      p.trail.unshift({
        x: p.x,
        y: p.y,
        dir: p.dir,
        stance: p.stance,
        alpha: 0.5,
      });
      if (p.trail.length > 5) p.trail.pop();
    }
    p.trail.forEach((t) => (t.alpha -= 0.08));
    p.trail = p.trail.filter((t) => t.alpha > 0);

    // Zanshin countdown
    if (p.zanshinTimer > 0) {
      p.zanshinTimer--;
      if (p.zanshinTimer <= 38) p.canZanshin = true;
      if (p.zanshinTimer <= 22) p.perfectZanshinWindow = true;
      if (p.zanshinTimer <= 0) {
        p.potentialKi = 0;
        p.canZanshin = false;
        p.perfectZanshinWindow = false;
      }
    }

    // Combo step reset timer
    if (p.comboResetTimer > 0) {
      p.comboResetTimer--;
      if (p.comboResetTimer <= 0) {
        p.attackComboStep = 1;
      }
    }

    // Player attack frame logic
    if (p.isAttacking && p.attackType !== 'GRAPPLE') {
      p.attackTimer--;

      // Hit frame trigger at middle of swing
      if (p.attackTimer === Math.floor(p.attackDuration * 0.45)) {
        this.checkPlayerAttackHits();
      }

      if (p.attackTimer <= 0) {
        p.isAttacking = false;
      }
    } else if (p.isAttacking && p.attackType === 'GRAPPLE') {
      p.attackTimer--;
      if (p.attackTimer <= 0) {
        p.isAttacking = false;
      }
    }

    // Enemy update loop
    this.updateEnemies();

    // Tokoyo puddles expansion & pulse
    this.tokoyoPuddles.forEach((pool) => {
      pool.pulseOffset += 0.05;
      if (pool.radius < pool.maxRadius) {
        pool.radius += 0.8;
      }
    });

    // Particle update
    this.particles.forEach((part) => {
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
    });
    this.particles = this.particles.filter((part) => part.life > 0);

    // Ambient floating embers & cherry blossoms
    if (Math.random() < 0.25 && this.particles.length < 90) {
      const isCherry = Math.random() > 0.5;
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 1.5 - 0.5,
        vy: Math.random() * 1.2 + 0.8,
        color: isCherry ? 'rgba(255, 183, 195, 0.7)' : 'rgba(255, 107, 107, 0.6)',
        size: Math.random() * 3 + 2,
        life: 300,
        maxLife: 300,
        type: isCherry ? 'petal' : 'ember',
      });
    }

    // Damage numbers
    this.damageNumbers.forEach((d) => {
      d.y -= 1.1;
      d.life--;
    });
    this.damageNumbers = this.damageNumbers.filter((d) => d.life > 0);

    // Check game condition
    if (p.hp <= 0) {
      p.hp = 0;
      this.state = 'GAMEOVER';
      this.stats.endTime = Date.now();
      sound.play('death_bell');
      this.onStateChange?.(this.state);
      this.onStatsChange?.(this.stats);
    }
  }

  private checkPlayerAttackHits() {
    const p = this.player;
    let reach = p.stance === 'HIGH' ? 95 : p.stance === 'MID' ? 76 : 60;
    if (p.isLivingWeaponActive) reach += 25;

    const hitX = p.dir === 1 ? p.x + p.w : p.x - reach;
    const hitBox = { x: hitX, y: p.y, w: reach, h: p.h };

    this.enemies.forEach((enemy) => {
      if (this.checkCollision(hitBox, enemy)) {
        let baseDmg = p.attackType === 'LIGHT' ? 70 : 135;
        let kiDmg = p.attackType === 'LIGHT' ? 30 : 65;

        if (p.stance === 'HIGH') {
          baseDmg *= 1.45;
          kiDmg *= 1.6;
        } else if (p.stance === 'LOW') {
          baseDmg *= 0.75;
          kiDmg *= 0.65;
        }

        if (p.isLivingWeaponActive) {
          baseDmg *= 1.5;
          kiDmg *= 1.8;
        }

        // Special Yoki Horn Break mechanic!
        if (
          enemy.type === 'yoki' &&
          enemy.hasHorn &&
          p.stance === 'HIGH' &&
          p.attackType === 'HEAVY'
        ) {
          enemy.hasHorn = false;
          enemy.ki = 0;
          enemy.isWinded = true;
          enemy.windedTimer = 220;
          this.screenShake = 16;
          this.hitPauseFrames = 4;
          sound.play('grapple');

          this.damageNumbers.push({
            id: this.nextDamageId++,
            x: enemy.x + enemy.w / 2,
            y: enemy.y - 45,
            text: '妖鬼破角！！ 精力粉碎',
            color: '#ffbe0b',
            life: 50,
            maxLife: 50,
            isCrit: true,
          });

          // Horn shatter sparks
          for (let i = 0; i < 25; i++) {
            this.particles.push({
              x: enemy.x + enemy.w / 2,
              y: enemy.y + 10,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.8) * 10,
              color: '#ffd166',
              size: Math.random() * 4 + 2,
              life: 30,
              maxLife: 30,
              type: 'spark',
            });
          }
        }

        const finalDmg = Math.floor(baseDmg);
        const finalKiDmg = Math.floor(kiDmg);

        enemy.hp -= finalDmg;
        enemy.ki = Math.max(0, enemy.ki - finalKiDmg);
        this.stats.damageDealt += finalDmg;
        this.currentCombo++;
        this.comboTimer = 75;

        // Amrita charge from attack
        p.amrita = Math.min(p.maxAmrita, p.amrita + (p.attackType === 'LIGHT' ? 3 : 6));

        if (enemy.ki <= 0 && !enemy.isWinded) {
          enemy.ki = 0;
          enemy.isWinded = true;
          enemy.windedTimer = 200; // 3.3 seconds window to grapple
          sound.play('winded');
        }

        this.screenShake = p.stance === 'HIGH' ? 8 : 4;
        this.hitPauseFrames = p.stance === 'HIGH' ? 3 : 1;
        sound.play('hit');

        this.damageNumbers.push({
          id: this.nextDamageId++,
          x: enemy.x + enemy.w / 2,
          y: enemy.y,
          text: `${finalDmg}`,
          color: p.isLivingWeaponActive ? '#ffbe0b' : '#ffffff',
          life: 28,
          maxLife: 28,
          isCrit: p.stance === 'HIGH' || p.isLivingWeaponActive,
        });

        // Hit sparks & blood
        for (let i = 0; i < 12; i++) {
          this.particles.push({
            x: enemy.x + enemy.w / 2,
            y: enemy.y + enemy.h / 2,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            color: p.isLivingWeaponActive ? '#ffb703' : '#e63946',
            size: Math.random() * 3 + 2,
            life: 20,
            maxLife: 20,
            type: p.isLivingWeaponActive ? 'spark' : 'blood',
          });
        }
      }
    });
  }

  private updateEnemies() {
    const p = this.player;

    this.enemies.forEach((enemy) => {
      // Winded behavior
      if (enemy.isWinded) {
        enemy.windedTimer--;
        if (enemy.windedTimer <= 0) {
          enemy.isWinded = false;
          enemy.ki = enemy.maxKi * 0.8;
          enemy.state = 'IDLE';
        }
        return;
      }

      const dist = p.x + p.w / 2 - (enemy.x + enemy.w / 2);
      enemy.dir = dist > 0 ? 1 : -1;
      enemy.attackTimer++;

      // Enemy behavior by type
      const attackRange = enemy.type === 'boss' ? 120 : enemy.type === 'yoki' ? 85 : 70;
      const moveSpeed = enemy.type === 'boss' ? 1.6 : enemy.type === 'yoki' ? 2.1 : 2.4;

      if (Math.abs(dist) > attackRange && !enemy.isAttacking) {
        enemy.x += enemy.dir * moveSpeed;
        enemy.state = 'CHASE';
      } else if (enemy.attackTimer > enemy.attackCooldown && !enemy.isAttacking) {
        enemy.attackTimer = 0;
        this.triggerEnemyAttack(enemy);
      }

      // Yokai Realm pool generation (Tokoyo)
      if (
        (enemy.type === 'yoki' || enemy.type === 'boss') &&
        Math.random() < 0.0035 &&
        this.tokoyoPuddles.length < 3
      ) {
        this.tokoyoPuddles.push({
          id: this.nextPuddleId++,
          x: enemy.x + enemy.w / 2,
          y: 435,
          radius: 10,
          maxRadius: enemy.type === 'boss' ? 95 : 75,
          pulseOffset: 0,
        });
      }
    });

    // Check defeated enemies
    const aliveEnemies: Enemy[] = [];
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) {
        this.stats.enemiesDefeated++;
        p.amrita = Math.min(p.maxAmrita, p.amrita + 35);

        // Amrita floating spirit orbs
        for (let i = 0; i < 35; i++) {
          const angle = Math.random() * Math.PI * 2;
          this.particles.push({
            x: enemy.x + enemy.w / 2,
            y: enemy.y + enemy.h / 2,
            vx: Math.cos(angle) * (Math.random() * 8 + 2),
            vy: Math.sin(angle) * (Math.random() * 8 + 2),
            color: '#ffbe0b',
            size: Math.random() * 4 + 3,
            life: 45,
            maxLife: 45,
            type: 'spark',
          });
        }
      } else {
        aliveEnemies.push(enemy);
      }
    }
    this.enemies = aliveEnemies;

    // Wave Progression
    if (this.enemies.length === 0) {
      if (this.currentWave < this.maxWaves) {
        this.currentWave++;
        this.initWave(this.currentWave);
        sound.play('victory_taiko');
        this.onWaveChange?.(this.currentWave);

        this.damageNumbers.push({
          id: this.nextDamageId++,
          x: this.canvas.width / 2 - 80,
          y: 190,
          text: `第 ${this.currentWave} 陣開戰！`,
          color: '#ffbe0b',
          life: 70,
          maxLife: 70,
          isCrit: true,
        });
      } else {
        this.state = 'VICTORY';
        this.stats.endTime = Date.now();
        sound.play('victory_taiko');
        this.onStateChange?.(this.state);
        this.onStatsChange?.(this.stats);
      }
    }
  }

  private triggerEnemyAttack(enemy: Enemy) {
    enemy.isAttacking = true;
    enemy.state = 'ATTACKING';

    const reach = enemy.type === 'boss' ? 125 : enemy.type === 'yoki' ? 90 : 75;
    const telegraphDuration = enemy.type === 'boss' ? 420 : 300;

    // Windup visual effect
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: enemy.x + enemy.w / 2 + enemy.dir * 30,
        y: enemy.y + 30,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 4,
        color: '#ff0055',
        size: 3,
        life: 18,
        maxLife: 18,
        type: 'spark',
      });
    }

    setTimeout(() => {
      if (enemy.hp <= 0 || enemy.isWinded) {
        enemy.isAttacking = false;
        return;
      }

      const hitX = enemy.dir === 1 ? enemy.x + enemy.w : enemy.x - reach;
      const hitBox = { x: hitX, y: enemy.y, w: reach, h: enemy.h };

      if (this.checkCollision(hitBox, this.player)) {
        const p = this.player;

        // Check if player dodged with i-frames
        if (p.isDodging && p.invulnerableTimer > 0) {
          this.damageNumbers.push({
            id: this.nextDamageId++,
            x: p.x + p.w / 2,
            y: p.y - 20,
            text: '完璧迴避！',
            color: '#00f5d4',
            life: 25,
            maxLife: 25,
          });
          enemy.isAttacking = false;
          return;
        }

        const rawDmg =
          enemy.type === 'boss' ? 260 : enemy.type === 'yoki' ? 170 : 125;

        if (p.isGuarding) {
          // Guard Ki drain
          let guardKiCost =
            enemy.type === 'boss' ? 110 : enemy.type === 'yoki' ? 70 : 45;
          if (p.stance === 'MID') guardKiCost *= 0.55; // Mid stance specialty!

          p.ki -= guardKiCost;
          this.screenShake = 6;
          sound.play('guard_clang');

          // Guard spark burst
          for (let i = 0; i < 15; i++) {
            this.particles.push({
              x: p.x + p.w / 2 + p.dir * 25,
              y: p.y + 40,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: '#3a86ff',
              size: 3,
              life: 16,
              maxLife: 16,
              type: 'spark',
            });
          }

          this.damageNumbers.push({
            id: this.nextDamageId++,
            x: p.x + p.w / 2,
            y: p.y - 20,
            text: '格擋成功',
            color: '#3a86ff',
            life: 22,
            maxLife: 22,
          });
        } else {
          // Direct hit
          let actualDmg = rawDmg;
          if (p.isLivingWeaponActive) actualDmg *= 0.5; // Damage reduction in Living Weapon

          p.hp -= actualDmg;
          this.stats.damageTaken += actualDmg;
          this.screenShake = enemy.type === 'boss' ? 18 : 10;
          this.hitPauseFrames = 3;
          sound.play('hit');

          // Blood burst
          for (let i = 0; i < 18; i++) {
            this.particles.push({
              x: p.x + p.w / 2,
              y: p.y + p.h / 2,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 8,
              color: '#e63946',
              size: Math.random() * 4 + 2,
              life: 24,
              maxLife: 24,
              type: 'blood',
            });
          }

          this.damageNumbers.push({
            id: this.nextDamageId++,
            x: p.x + p.w / 2,
            y: p.y - 20,
            text: `-${actualDmg}`,
            color: '#d90429',
            life: 30,
            maxLife: 30,
            isCrit: true,
          });
        }
      }

      enemy.isAttacking = false;
      enemy.state = 'IDLE';
    }, telegraphDuration);
  }

  private checkCollision(
    r1: { x: number; y: number; w: number; h: number },
    r2: { x: number; y: number; w: number; h: number }
  ) {
    return !(
      r2.x > r1.x + r1.w ||
      r2.x + r2.w < r1.x ||
      r2.y > r1.y + r1.h ||
      r2.y + r2.h < r1.y
    );
  }

  // --- Rendering ---
  public draw() {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShake,
        (Math.random() - 0.5) * this.screenShake
      );
    }

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Background
    this.drawBackground(ctx);

    // 2. Draw Tokoyo Puddles (常世)
    this.tokoyoPuddles.forEach((pool) => {
      const grad = ctx.createRadialGradient(
        pool.x,
        pool.y,
        5,
        pool.x,
        pool.y,
        pool.radius
      );
      grad.addColorStop(0, 'rgba(75, 0, 130, 0.85)');
      grad.addColorStop(0.5, 'rgba(128, 0, 128, 0.45)');
      grad.addColorStop(1, 'rgba(10, 0, 20, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(pool.x, pool.y, pool.radius, pool.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Demon miasma swirls
      ctx.strokeStyle = 'rgba(218, 112, 214, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(
        pool.x,
        pool.y - 6 + Math.sin(pool.pulseOffset) * 4,
        pool.radius * 0.7,
        pool.radius * 0.22,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    // 3. Draw Enemies
    this.enemies.forEach((enemy) => this.drawEnemy(ctx, enemy));

    // 4. Draw Player
    this.drawPlayer(ctx);

    // 5. Draw Particles
    this.particles.forEach((part) => {
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Draw Damage Numbers
    this.damageNumbers.forEach((d) => {
      ctx.save();
      ctx.fillStyle = d.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.font = d.isCrit
        ? 'bold 20px "Noto Serif TC", serif'
        : 'bold 16px "Noto Serif TC", serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.text, d.x, d.y);
      ctx.restore();
    });

    // 7. Draw HUD Elements (In-canvas quick cues)
    this.drawInGameCues(ctx);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    if (this.bgLoaded && this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
      // Soft dark tint overlay to guarantee foreground legibility
      ctx.fillStyle = 'rgba(11, 9, 10, 0.52)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Atmospheric fallback canvas gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      bgGrad.addColorStop(0, '#050406');
      bgGrad.addColorStop(0.65, '#161a1d');
      bgGrad.addColorStop(1, '#0b090a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Crimson Blood Moon
      const moonGrad = ctx.createRadialGradient(780, 110, 10, 780, 110, 55);
      moonGrad.addColorStop(0, '#ff4d6d');
      moonGrad.addColorStop(0.7, '#a4161a');
      moonGrad.addColorStop(1, 'rgba(102, 7, 8, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(780, 110, 55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground platform (Tatami / Shrine stone floor)
    const groundGrad = ctx.createLinearGradient(0, 434, 0, this.canvas.height);
    groundGrad.addColorStop(0, '#2b2d42');
    groundGrad.addColorStop(0.08, '#1b1d2e');
    groundGrad.addColorStop(1, '#080708');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 434, this.canvas.width, this.canvas.height - 434);

    // Stone border rim with subtle golden/crimson line
    ctx.strokeStyle = '#c1121f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 434);
    ctx.lineTo(this.canvas.width, 434);
    ctx.stroke();

    ctx.strokeStyle = '#e0a96d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 436);
    ctx.lineTo(this.canvas.width, 436);
    ctx.stroke();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    // Motion shadow trails
    p.trail.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle =
        p.isLivingWeaponActive
          ? '#ffbe0b'
          : t.stance === 'HIGH'
          ? '#ff4d6d'
          : t.stance === 'MID'
          ? '#3a86ff'
          : '#06d6a0';
      ctx.fillRect(t.x, t.y, p.w, p.h);
      ctx.restore();
    });

    // Dodge transparency
    if (p.isDodging) {
      ctx.globalAlpha = 0.45;
    }

    // Living Weapon Golden Spirit Fire Aura
    if (p.isLivingWeaponActive) {
      ctx.save();
      const auraGrad = ctx.createRadialGradient(
        p.x + p.w / 2,
        p.y + p.h / 2,
        15,
        p.x + p.w / 2,
        p.y + p.h / 2,
        65
      );
      auraGrad.addColorStop(0, 'rgba(255, 190, 11, 0.45)');
      auraGrad.addColorStop(0.7, 'rgba(255, 0, 85, 0.25)');
      auraGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Body silhouette (William sengoku samurai look)
    // Feet/Legs
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(p.x + 6, p.y + p.h - 22, 14, 22);
    ctx.fillRect(p.x + p.w - 20, p.y + p.h - 22, 14, 22);

    // Torso / Cuirass
    const torsoColor = p.isWinded
      ? '#495057'
      : p.isLivingWeaponActive
      ? '#ffbe0b'
      : '#2b2d42';
    ctx.fillStyle = torsoColor;
    ctx.fillRect(p.x + 4, p.y + 24, p.w - 8, 42);

    // Gold samurai sashes / armor trim
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(p.x + 8, p.y + 36, p.w - 16, 4);
    ctx.fillRect(p.x + 12, p.y + 44, p.w - 24, 3);

    // Head / Hair (William's iconic silver blonde hair + ponytail)
    ctx.fillStyle = '#f8edeb'; // Face
    ctx.fillRect(p.x + 12, p.y + 4, 22, 20);

    // Blonde hair / ponytail
    ctx.fillStyle = '#f4e04d';
    ctx.fillRect(p.x + (p.dir === 1 ? 10 : 16), p.y, 22, 8);
    // Ponytail trailing back
    ctx.fillRect(p.x + (p.dir === 1 ? 4 : 26), p.y + 6, 8, 14);

    // Guard barrier visual
    if (p.isGuarding) {
      ctx.save();
      ctx.strokeStyle = '#3a86ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        p.x + (p.dir === 1 ? p.w + 10 : -10),
        p.y + p.h / 2,
        35,
        p.dir === 1 ? -Math.PI / 3 : (2 * Math.PI) / 3,
        p.dir === 1 ? Math.PI / 3 : (4 * Math.PI) / 3
      );
      ctx.stroke();
      ctx.restore();
    }

    // Katana Blade Drawing (Stance based hold & swing)
    this.drawKatana(ctx, p);

    // Ki Pulse Contracting Circle (殘心收縮指示環)
    if (p.potentialKi > 0) {
      const zRatio = p.zanshinTimer / p.zanshinMax;
      const isPerfectWindow = p.perfectZanshinWindow;
      ctx.save();
      ctx.strokeStyle = isPerfectWindow ? '#00f5d4' : '#f8f9fa';
      ctx.lineWidth = isPerfectWindow ? 3.5 : 2;
      ctx.shadowColor = isPerfectWindow ? '#00f5d4' : '#70d6ff';
      ctx.shadowBlur = isPerfectWindow ? 12 : 6;
      ctx.beginPath();
      ctx.arc(
        p.x + p.w / 2,
        p.y + p.h / 2,
        18 + zRatio * 55,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Converging Ki particles
      for (let i = 0; i < 4; i++) {
        const ang = (Math.PI * 2 * i) / 4 + zRatio * 5;
        const rad = 18 + zRatio * 55;
        ctx.fillStyle = isPerfectWindow ? '#00f5d4' : '#e0e1dd';
        ctx.beginPath();
        ctx.arc(
          p.x + p.w / 2 + Math.cos(ang) * rad,
          p.y + p.h / 2 + Math.sin(ang) * rad,
          2.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
  }

  private drawKatana(ctx: CanvasRenderingContext2D, p: Player) {
    ctx.save();
    let startX = p.x + p.w / 2;
    let startY = p.y + 40;
    let endX = startX;
    let endY = startY;

    if (p.isAttacking) {
      // Dynamic slash arc based on progress
      const progress = 1 - p.attackTimer / p.attackDuration;
      const arcSpread = p.stance === 'HIGH' ? 1.6 : p.stance === 'MID' ? 1.2 : 0.9;
      const angle =
        p.dir === 1
          ? -Math.PI / 3 + progress * Math.PI * arcSpread
          : (-2 * Math.PI) / 3 - progress * Math.PI * arcSpread;

      const swordLen = p.isLivingWeaponActive ? 68 : 52;
      endX = startX + Math.cos(angle) * swordLen;
      endY = startY + Math.sin(angle) * swordLen;

      // Glowing Blade Slash Trail
      ctx.strokeStyle = p.isLivingWeaponActive
        ? 'rgba(255, 190, 11, 0.75)'
        : p.stance === 'HIGH'
        ? 'rgba(255, 77, 109, 0.75)'
        : p.stance === 'MID'
        ? 'rgba(58, 134, 255, 0.75)'
        : 'rgba(6, 214, 160, 0.75)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else {
      // Stance ready posture
      let swordOffsetY = 38;
      let angle = 0;
      const swordLen = 45;

      if (p.stance === 'HIGH') {
        swordOffsetY = 16;
        angle = p.dir === 1 ? -Math.PI / 4 : (-3 * Math.PI) / 4;
      } else if (p.stance === 'MID') {
        swordOffsetY = 38;
        angle = p.dir === 1 ? 0.1 : Math.PI - 0.1;
      } else {
        swordOffsetY = 58;
        angle = p.dir === 1 ? Math.PI / 4 : (3 * Math.PI) / 4;
      }

      startX = p.x + (p.dir === 1 ? p.w - 10 : 10);
      startY = p.y + swordOffsetY;
      endX = startX + Math.cos(angle) * swordLen;
      endY = startY + Math.sin(angle) * swordLen;
    }

    // Steel blade
    ctx.strokeStyle = p.isLivingWeaponActive ? '#ffbe0b' : '#f8f9fa';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Golden Tsuba (Guard)
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    ctx.save();

    // Winded crimson execution pulse
    if (enemy.isWinded) {
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.strokeRect(enemy.x - 6, enemy.y - 6, enemy.w + 12, enemy.h + 12);

      // Prompt overlay
      ctx.fillStyle = '#ff0055';
      ctx.font = 'bold 15px "Noto Serif TC", serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 按 [K] 發動近身刺擊！', enemy.x + enemy.w / 2, enemy.y - 25);
    }

    if (enemy.type === 'samurai') {
      // Rogue Samurai (Ronin with straw hat & katana)
      ctx.fillStyle = enemy.isWinded ? '#495057' : enemy.color;
      ctx.fillRect(enemy.x, enemy.y + 20, enemy.w, enemy.h - 20);

      // Straw Kasa Hat
      ctx.fillStyle = '#a68a56';
      ctx.beginPath();
      ctx.moveTo(enemy.x - 8, enemy.y + 16);
      ctx.lineTo(enemy.x + enemy.w / 2, enemy.y);
      ctx.lineTo(enemy.x + enemy.w + 8, enemy.y + 16);
      ctx.closePath();
      ctx.fill();

      // Katana
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.w / 2, enemy.y + 40);
      ctx.lineTo(enemy.x + enemy.w / 2 + enemy.dir * 46, enemy.y + 35);
      ctx.stroke();
    } else if (enemy.type === 'yoki') {
      // Yoki demon with purple-crimson body
      ctx.fillStyle = enemy.isWinded ? '#5c5255' : enemy.color;
      ctx.fillRect(enemy.x, enemy.y + 20, enemy.w, enemy.h - 20);

      // Golden horns (can be broken!)
      if (enemy.hasHorn) {
        ctx.fillStyle = '#ffd166';
        // Left horn
        ctx.beginPath();
        ctx.moveTo(enemy.x + 12, enemy.y + 20);
        ctx.lineTo(enemy.x + 4, enemy.y - 12);
        ctx.lineTo(enemy.x + 20, enemy.y + 20);
        ctx.fill();

        // Right horn
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.w - 20, enemy.y + 20);
        ctx.lineTo(enemy.x + enemy.w - 4, enemy.y - 12);
        ctx.lineTo(enemy.x + enemy.w - 12, enemy.y + 20);
        ctx.fill();
      }

      // Glowing demonic red eye
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(
        enemy.x + (enemy.dir === 1 ? enemy.w - 14 : 14),
        enemy.y + 28,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Huge butcher cleaver
      ctx.fillStyle = '#212529';
      ctx.fillRect(
        enemy.x + (enemy.dir === 1 ? enemy.w - 6 : -24),
        enemy.y + 35,
        30,
        50
      );
    } else if (enemy.type === 'boss') {
      // Onryoki Giant Boss
      ctx.fillStyle = enemy.isWinded ? '#49363c' : enemy.color;
      ctx.fillRect(enemy.x, enemy.y + 25, enemy.w, enemy.h - 25);

      // Fiery glowing eyes
      ctx.fillStyle = '#ffbe0b';
      ctx.beginPath();
      ctx.arc(
        enemy.x + (enemy.dir === 1 ? enemy.w - 25 : 25),
        enemy.y + 35,
        6,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Giant demon horns
      ctx.fillStyle = '#e76f51';
      ctx.beginPath();
      ctx.moveTo(enemy.x + 15, enemy.y + 25);
      ctx.lineTo(enemy.x, enemy.y - 25);
      ctx.lineTo(enemy.x + 30, enemy.y + 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.w - 30, enemy.y + 25);
      ctx.lineTo(enemy.x + enemy.w, enemy.y - 25);
      ctx.lineTo(enemy.x + enemy.w - 15, enemy.y + 25);
      ctx.fill();

      // Iron balls with chains
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(
        enemy.x + (enemy.dir === 1 ? enemy.w + 25 : -25),
        enemy.y + enemy.h - 35,
        22,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Iron chain line
      ctx.strokeStyle = '#6c757d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.w / 2, enemy.y + 60);
      ctx.lineTo(
        enemy.x + (enemy.dir === 1 ? enemy.w + 25 : -25),
        enemy.y + enemy.h - 35
      );
      ctx.stroke();
    }

    // Health & Ki Overhead Bars
    const barW = Math.max(enemy.w, 60);
    const barX = enemy.x + (enemy.w - barW) / 2;

    // HP Bar
    ctx.fillStyle = '#111';
    ctx.fillRect(barX, enemy.y - 16, barW, 6);
    ctx.fillStyle = '#e63946';
    ctx.fillRect(barX, enemy.y - 16, (Math.max(0, enemy.hp) / enemy.maxHp) * barW, 6);

    // Ki Bar
    ctx.fillStyle = '#111';
    ctx.fillRect(barX, enemy.y - 8, barW, 4);
    ctx.fillStyle = enemy.isWinded ? '#ff0055' : '#70d6ff';
    ctx.fillRect(barX, enemy.y - 8, (Math.max(0, enemy.ki) / enemy.maxKi) * barW, 4);

    ctx.restore();
  }

  private drawInGameCues(ctx: CanvasRenderingContext2D) {
    // Current wave banner in canvas top right
    ctx.save();
    ctx.fillStyle = '#ffbe0b';
    ctx.font = 'bold 15px "Noto Serif TC", serif';
    ctx.textAlign = 'right';
    ctx.fillText(`第 ${this.currentWave} / ${this.maxWaves} 陣`, this.canvas.width - 24, 32);

    // Combo counter
    if (this.currentCombo > 1) {
      ctx.fillStyle = '#ff0055';
      ctx.font = 'bold 22px "Cinzel", serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.currentCombo} 連擊！`, 30, 115);
    }
    ctx.restore();
  }
}
