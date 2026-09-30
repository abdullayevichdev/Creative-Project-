/**
 * Core Underwater Simulation & Graphics Engine
 * Handles volumetric lighting, dynamic caustics, parallax seabed,
 * swaying kelp forests, coral reefs, school physics, bubbles, and marine encounters.
 */

import {
  AtmosphereConfig,
  AtmosphereMode,
  BubbleEntity,
  ClickRipple,
  CoralReefItem,
  FishEntity,
  FoodPellet,
  KelpStrand,
  MarineParticle,
  SchoolFishEntity,
  SeabedCrab,
  SpeciesType,
} from '../types/marine';
import { MarineRenderers } from './MarineRenderers';
import { underwaterAudio } from '../audio/UnderwaterAudio';

export const ATMOSPHERE_MODES: Record<AtmosphereMode, AtmosphereConfig> = {
  day: {
    name: 'day',
    label: 'Tropical Noon',
    waterTopColor: '#0ea5e9', // brilliant azure turquoise
    waterBottomColor: '#0369a1', // deep oceanic blue
    waterHazeColor: 'rgba(14, 165, 233, 0.18)',
    sunbeamColor: 'rgba(255, 255, 240, 0.16)',
    sunbeamIntensity: 1.0,
    causticColor: 'rgba(255, 255, 255, 0.28)',
    causticIntensity: 1.0,
    sandColor1: '#e2d3b3',
    sandColor2: '#b8a379',
    ambientLight: 1.0,
    bioluminescence: false,
    particleColor: 'rgba(224, 242, 254, 0.45)',
    bubbleGlow: 'rgba(255, 255, 255, 0.7)',
  },
  sunset: {
    name: 'sunset',
    label: 'Golden Dusk',
    waterTopColor: '#f97316', // warm fiery orange-gold top sheen
    waterBottomColor: '#1e1b4b', // deep twilight violet-indigo
    waterHazeColor: 'rgba(194, 65, 12, 0.18)',
    sunbeamColor: 'rgba(254, 215, 170, 0.18)',
    sunbeamIntensity: 0.85,
    causticColor: 'rgba(254, 240, 138, 0.22)',
    causticIntensity: 0.75,
    sandColor1: '#c29774',
    sandColor2: '#80563b',
    ambientLight: 0.8,
    bioluminescence: false,
    particleColor: 'rgba(254, 215, 170, 0.4)',
    bubbleGlow: 'rgba(254, 240, 138, 0.7)',
  },
  deep: {
    name: 'deep',
    label: 'Abyssal Midnight',
    waterTopColor: '#032038', // midnight navy
    waterBottomColor: '#020617', // near black abyss
    waterHazeColor: 'rgba(2, 132, 199, 0.12)',
    sunbeamColor: 'rgba(56, 189, 248, 0.08)',
    sunbeamIntensity: 0.35,
    causticColor: 'rgba(56, 189, 248, 0.15)',
    causticIntensity: 0.4,
    sandColor1: '#263a4d',
    sandColor2: '#131e2b',
    ambientLight: 0.45,
    bioluminescence: true,
    particleColor: 'rgba(125, 211, 252, 0.75)',
    bubbleGlow: 'rgba(165, 243, 252, 0.85)',
  },
};

export class UnderwaterEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Time & Animation
  private animId: number | null = null;
  private lastTime: number = 0;
  private totalTime: number = 0;

  // Atmosphere
  private currentMode: AtmosphereMode = 'day';
  private targetMode: AtmosphereMode = 'day';
  private modeTransition: number = 1.0; // 0 to 1

  // Cinematic descent
  private descentProgress: number = 1.0; // 0 = at surface, 1 = descended into reef
  private isDescending: boolean = false;
  private descentStartTime: number = 0;

  // Simulation Entities
  private fishList: FishEntity[] = [];
  private schoolList: SchoolFishEntity[] = [];
  private bubbles: BubbleEntity[] = [];
  private particles: MarineParticle[] = [];
  private ripples: ClickRipple[] = [];
  private kelpStrands: KelpStrand[] = [];
  private corals: CoralReefItem[] = [];
  private foodPellets: FoodPellet[] = [];
  private crabs: SeabedCrab[] = [];

  // Interactive modes
  public isFeedMode: boolean = false;
  public isSpotlightEnabled: boolean = false;
  public targetFishId: number | null = null;
  public currentDepthMeters: number = 28;
  public oceanSurge: number = 0;

  // Mouse & Parallax
  public mouseX: number = -1000;
  public mouseY: number = -1000;
  private targetParallaxX: number = 0;
  private targetParallaxY: number = 0;
  private parallaxX: number = 0;
  private parallaxY: number = 0;

  // Follow-Cam Camera offsets
  private cameraPanX: number = 0;
  private cameraPanY: number = 0;

  // Background megafauna timer
  private nextMegafaunaTimer: number = 8;

  // Event callbacks
  public onFishCountChange?: (count: number) => void;
  public onInspectSpecies?: (species: SpeciesType) => void;
  public onTargetFishInfo?: (info: { species: SpeciesType; speed: number; depth: number } | null) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get Canvas 2D context');
    this.ctx = context;

    this.resize();
    this.initEnvironment();
    this.startDescent();
  }

  public resize(): void {
    const parent = this.canvas.parentElement || document.body;
    this.width = parent.clientWidth || window.innerWidth;
    this.height = parent.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(this.dpr, this.dpr);

    // Re-seed environment if resized significantly
    if (this.kelpStrands.length === 0) {
      this.initEnvironment();
    } else {
      this.repositionSeabedElements();
    }
  }

  public startDescent(): void {
    this.isDescending = true;
    this.descentProgress = 0;
    this.descentStartTime = performance.now();
  }

  public setAtmosphereMode(mode: AtmosphereMode): void {
    if (mode === this.currentMode) return;
    this.targetMode = mode;
    this.modeTransition = 0;
  }

  public getAtmosphereMode(): AtmosphereMode {
    return this.targetMode;
  }

  private initEnvironment(): void {
    // 1. Seaweed / Kelp Strands (Infinite Horizon)
    this.kelpStrands = [];
    const strandCount = Math.max(24, Math.floor(this.width / 50));
    for (let i = 0; i < strandCount; i++) {
      const baseX = -this.width * 0.4 + (i / strandCount) * (this.width * 1.8) + (Math.random() * 40 - 20);
      const height = this.height * (0.35 + Math.random() * 0.42);
      const segments = Math.floor(10 + Math.random() * 8);
      const segmentLength = height / segments;

      // Color variation (rich olive green, forest kelp)
      const greenHue = 135 + Math.random() * 30;
      const lightness = 22 + Math.random() * 14;
      const color = `hsl(${greenHue}, 65%, ${lightness}%)`;

      const leaves = [];
      for (let s = 2; s < segments - 1; s++) {
        if (Math.random() > 0.4) {
          leaves.push({
            segment: s,
            side: Math.random() > 0.5 ? 1 : -1,
            length: 18 + Math.random() * 26,
            angleOffset: 0.3 + Math.random() * 0.4,
          });
        }
      }

      this.kelpStrands.push({
        baseX,
        baseY: this.height + 20,
        height,
        segments,
        segmentLength,
        angles: new Array(segments).fill(0),
        color,
        width: 6 + Math.random() * 5,
        waveSpeed: 0.6 + Math.random() * 0.5,
        waveOffset: Math.random() * Math.PI * 2,
        leaves,
      });
    }

    // 2. Corals & Sponges (Infinite Horizon)
    this.corals = [];
    const coralCount = Math.max(14, Math.floor(this.width / 80));
    for (let i = 0; i < coralCount; i++) {
      const cx = -this.width * 0.35 + (i / coralCount) * (this.width * 1.7) + (Math.random() * 60 - 30);
      const cy = this.height - (30 + Math.random() * 60);
      const typeChoice = Math.random();

      if (typeChoice < 0.35) {
        // Staghorn branching coral
        const branches: { startX: number; startY: number; endX: number; endY: number; thickness: number; color: string }[] = [];
        const baseThickness = 12 + Math.random() * 6;
        const color = ['#f43f5e', '#fb7185', '#fda4af', '#f97316', '#a855f7'][Math.floor(Math.random() * 5)];
        this.generateCoralBranches(cx, cy, -Math.PI / 2, 45 + Math.random() * 30, baseThickness, 3, branches, color);
        this.corals.push({
          type: 'staghorn',
          x: cx,
          y: cy,
          scale: 1,
          color,
          secondaryColor: '#fecdd3',
          branches,
        });
      } else if (typeChoice < 0.65) {
        // Brain coral / mound
        this.corals.push({
          type: 'brain',
          x: cx,
          y: cy,
          scale: 0.8 + Math.random() * 0.5,
          color: ['#0d9488', '#14b8a6', '#059669', '#ca8a04'][Math.floor(Math.random() * 4)],
          secondaryColor: '#0f172a',
        });
      } else {
        // Anemone with waving tentacles
        const tentacleCount = 18 + Math.floor(Math.random() * 12);
        const tentacles = [];
        for (let t = 0; t < tentacleCount; t++) {
          tentacles.push({
            length: 22 + Math.random() * 18,
            phase: Math.random() * Math.PI * 2,
            speed: 1.2 + Math.random() * 1.5,
            angle: -Math.PI * 0.85 + (t / tentacleCount) * Math.PI * 0.7,
          });
        }
        this.corals.push({
          type: 'anemone',
          x: cx,
          y: cy,
          scale: 1,
          color: ['#ec4899', '#f472b6', '#a855f7', '#38bdf8'][Math.floor(Math.random() * 4)],
          secondaryColor: '#ffffff',
          tentacles,
        });
      }
    }

    // 3. Marine Particles / Marine Snow
    this.particles = [];
    const particleCount = Math.min(180, Math.floor((this.width * this.height) / 8000));
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0.2 + Math.random() * 0.4,
        vy: -0.15 + Math.random() * 0.3,
        size: 1.0 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.5,
        baseAlpha: 0.2 + Math.random() * 0.5,
        glow: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 2.0,
      });
    }

    // 4. Ambient Bubbles
    this.bubbles = [];
    for (let i = 0; i < 24; i++) {
      this.spawnBubble(true);
    }

    // 5. Initial Fish Population
    this.fishList = [];
    this.populateInitialFish();

    // 6. School of Fish
    this.initSchool();

    // 7. Benthic Seabed Crabs
    this.crabs = [];
    const crabCount = Math.max(3, Math.floor(this.width / 260));
    for (let i = 0; i < crabCount; i++) {
      this.crabs.push({
        x: (i / crabCount) * this.width + (Math.random() * 80 - 40),
        y: this.height * 0.94 + Math.random() * 8,
        vx: 0.35 + Math.random() * 0.35,
        scale: 0.75 + Math.random() * 0.35,
        legCycle: Math.random() * Math.PI * 2,
        state: 'walking',
        stateTimer: 2 + Math.random() * 4,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  private generateCoralBranches(
    x: number,
    y: number,
    angle: number,
    len: number,
    thickness: number,
    depth: number,
    outList: { startX: number; startY: number; endX: number; endY: number; thickness: number; color: string }[],
    color: string
  ): void {
    if (depth <= 0 || len < 6) return;
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;

    outList.push({ startX: x, startY: y, endX, endY, thickness, color });

    const branchesCount = 2 + (Math.random() > 0.6 ? 1 : 0);
    for (let b = 0; b < branchesCount; b++) {
      const spread = 0.45 + (Math.random() - 0.5) * 0.2;
      const branchAngle = angle + (b === 0 ? -spread : spread);
      this.generateCoralBranches(
        endX,
        endY,
        branchAngle,
        len * (0.65 + Math.random() * 0.15),
        thickness * 0.65,
        depth - 1,
        outList,
        color
      );
    }
  }

  private repositionSeabedElements(): void {
    for (const strand of this.kelpStrands) {
      strand.baseY = this.height + 20;
    }
    for (const coral of this.corals) {
      coral.y = this.height - (30 + Math.random() * 40);
    }
    for (const crab of this.crabs) {
      crab.y = this.height * 0.94 + Math.random() * 8;
    }
  }

  private populateInitialFish(): void {
    const speciesPool: SpeciesType[] = [
      'clownfish',
      'blue_tang',
      'goldfish',
      'angelfish',
      'tropical_chromis',
      'clownfish',
      'blue_tang',
      'tropical_chromis',
      'angelfish',
      'goldfish',
      'tropical_chromis',
    ];

    // Seed a rich, continuous population across the entire ocean
    const count = Math.min(46, Math.max(28, Math.floor(this.width / 32)));
    for (let i = 0; i < count; i++) {
      const species = speciesPool[i % speciesPool.length];
      const x = -300 + (i / count) * (this.width + 600);
      // Varied depth across full water column (10% to 86% of depth) using golden ratio distribution
      const y = this.height * (0.10 + ((i * 0.618) % 1) * 0.76);
      const layer = i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2;

      this.fishList.push(this.createFish(species, x, y, layer));
    }
  }

  private initSchool(): void {
    this.schoolList = [];
    const schoolSize = Math.min(42, Math.max(25, Math.floor(this.width / 38)));
    const originX = -120;
    const originY = this.height * 0.35;

    for (let i = 0; i < schoolSize; i++) {
      this.schoolList.push({
        x: originX + (Math.random() * 200 - 100),
        y: originY + (Math.random() * 110 - 55),
        vx: 1.4 + Math.random() * 0.5,
        vy: (Math.random() - 0.5) * 0.4,
        baseVx: 1.6 + Math.random() * 0.3,
        baseVy: 0,
        scale: 0.75 + Math.random() * 0.35,
        swimCycle: Math.random() * Math.PI * 2,
        tailPhase: Math.random() * Math.PI,
        colorHue: 195 + Math.random() * 20,
      });
    }
  }

  private createFish(species: SpeciesType, x: number, y: number, layer: number): FishEntity {
    // Layer determines depth scale & swimming speed
    const scaleBase = layer === 0 ? 0.65 : layer === 1 ? 0.95 : 1.25;
    let speedBase = layer === 0 ? 0.95 : layer === 1 ? 1.35 : 1.7;

    let speciesScale = 1.0;
    if (species === 'tropical_chromis') {
      speciesScale = 0.85;
      speedBase *= 1.25; // nimble tropical chromis
    }
    if (species === 'angelfish') speciesScale = 1.15;
    if (species === 'goldfish') {
      speciesScale = 1.05;
      speedBase *= 0.85; // flowing veil tail
    }
    if (species === 'sea_turtle') speedBase = 0.65;
    if (species === 'whale_silhouette') speedBase = 0.55;
    if (species === 'jellyfish') speedBase = 0.5;

    // Distinct individual personality variation so every fish moves at its own unique speed
    const baseSpeed = speedBase * (0.8 + Math.random() * 0.5);

    return {
      id: Math.floor(Math.random() * 1000000),
      species,
      x,
      y,
      vx: baseSpeed,
      vy: 0,
      baseSpeed,
      baseY: y,
      scale: scaleBase * speciesScale,
      layer,
      swimCycle: Math.random() * Math.PI * 2,
      swimSpeed: 2.0 + Math.random() * 1.5,
      amplitude: 8 + Math.random() * 14,
      frequency: 0.012 + Math.random() * 0.012,
      finCycle: Math.random() * Math.PI * 2,
      rotation: 0,
      targetRotation: 0,
      colorVariance: Math.random(),
      fleeTimer: 0,
    };
  }

  public spawnBubble(randomizeY: boolean = false, customX?: number, customY?: number): void {
    const x = customX !== undefined ? customX : Math.random() * this.width;
    const y = customY !== undefined ? customY : randomizeY ? Math.random() * this.height : this.height + 20;
    const radius = 2.5 + Math.random() * 7.5;

    this.bubbles.push({
      x,
      y,
      radius,
      baseRadius: radius,
      vy: 1.0 + Math.random() * 1.8 + radius * 0.15,
      vx: (Math.random() - 0.5) * 0.4,
      wobbleSpeed: 2.0 + Math.random() * 3.0,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleDist: 0.8 + Math.random() * 1.8,
      alpha: 0.5 + Math.random() * 0.45,
      layer: Math.random() < 0.3 ? 0 : 1,
    });
  }

  public triggerClickInteraction(x: number, y: number): void {
    // 1. Check if user clicked directly on a fish to lock Follow-Cam
    let clickedFish: FishEntity | null = null;
    for (const fish of this.fishList) {
      const dx = fish.x - x;
      const dy = fish.y - y;
      if (Math.hypot(dx, dy) < 45 * fish.scale) {
        clickedFish = fish;
        break;
      }
    }

    if (clickedFish) {
      if (this.targetFishId === clickedFish.id) {
        this.targetFishId = null; // toggle off
        if (this.onTargetFishInfo) this.onTargetFishInfo(null);
      } else {
        this.targetFishId = clickedFish.id;
        if (this.onInspectSpecies) this.onInspectSpecies(clickedFish.species);
      }
    }

    // 2. Feeding mode: drop food pellets
    if (this.isFeedMode) {
      const pelletCount = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < pelletCount; i++) {
        this.foodPellets.push({
          id: Math.random(),
          x: x + (Math.random() * 26 - 13),
          y: y + (Math.random() * 16 - 8),
          vy: 0.5 + Math.random() * 0.7,
          vx: (Math.random() - 0.5) * 0.4,
          size: 2.2 + Math.random() * 1.6,
          eaten: false,
          alpha: 1.0,
        });
      }
      underwaterAudio.playFeedPlop();
      return;
    }

    // 3. Normal water ripple shockwave
    this.ripples.push({
      x,
      y,
      radius: 5,
      maxRadius: 110 + Math.random() * 40,
      alpha: 0.85,
      life: 1.0,
    });

    // 4. Burst of sparkling effervescent bubbles
    const burstCount = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      const b = {
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        radius: 2.0 + Math.random() * 4.5,
        baseRadius: 2.0 + Math.random() * 4.5,
        vy: 1.2 + Math.random() * 2.0,
        vx: Math.cos(angle) * speed,
        wobbleSpeed: 3.5 + Math.random() * 2.0,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleDist: 1.5,
        alpha: 0.9,
        layer: 1,
      };
      this.bubbles.push(b);
    }

    // 5. Flee impulse for nearby fish (only when not feeding)
    for (const fish of this.fishList) {
      const dx = fish.x - x;
      const dy = fish.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180) {
        fish.vx += (dx / dist) * 2.8;
        fish.vy += (dy / dist) * 1.8;
        fish.fleeTimer = 1.2;
      }
    }
  }

  public setMousePosition(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
    // Parallax calculation
    this.targetParallaxX = ((x - this.width * 0.5) / (this.width * 0.5)) * 16;
    this.targetParallaxY = ((y - this.height * 0.5) / (this.height * 0.5)) * 12;

    // Check click/hover species inspection
    for (const fish of this.fishList) {
      const dx = fish.x - x;
      const dy = fish.y - y;
      if (Math.hypot(dx, dy) < 40 * fish.scale) {
        if (this.onInspectSpecies) {
          this.onInspectSpecies(fish.species);
        }
        break;
      }
    }
  }

  public clearMousePosition(): void {
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.targetParallaxX = 0;
    this.targetParallaxY = 0;
  }

  public start(): void {
    if (this.animId) return;
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.05); // cap at 50ms
      this.lastTime = time;
      this.totalTime += dt;

      this.update(dt, time);
      this.render();

      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public stop(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  private update(dt: number, time: number): void {
    // 0. Ocean Surge Oscillations
    this.oceanSurge = Math.sin(this.totalTime * 0.4) * 0.35 + Math.sin(this.totalTime * 0.16) * 0.2;

    // 1. Atmosphere Transition
    if (this.modeTransition < 1.0) {
      this.modeTransition = Math.min(1.0, this.modeTransition + dt * 0.9);
      if (this.modeTransition >= 1.0) {
        this.currentMode = this.targetMode;
      }
    }

    // 2. Cinematic Descent
    if (this.isDescending) {
      const elapsed = (time - this.descentStartTime) / 1000;
      const duration = 2.6;
      if (elapsed < duration) {
        const t = elapsed / duration;
        this.descentProgress = 1 - Math.pow(1 - t, 3);
      } else {
        this.descentProgress = 1.0;
        this.isDescending = false;
      }
    }

    // 3. Parallax Lerp
    this.parallaxX += (this.targetParallaxX - this.parallaxX) * 0.05;
    this.parallaxY += (this.targetParallaxY - this.parallaxY) * 0.05;

    // 4. Update Food Pellets
    for (let i = this.foodPellets.length - 1; i >= 0; i--) {
      const p = this.foodPellets[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(this.totalTime * 2 + p.id) * 0.3 + this.oceanSurge * 0.3;
      p.vy = Math.min(1.5, p.vy + dt * 0.3);

      if (p.y > this.height * 0.94) {
        p.alpha -= dt * 0.6;
        if (p.alpha <= 0) {
          this.foodPellets.splice(i, 1);
        }
      }
    }

    // 5. Ensure Endless Uninterrupted Fish Stream (Strict Non-Stopping Ocean Stream)
    const megafaunaSpecies: SpeciesType[] = ['sea_turtle', 'jellyfish', 'stingray', 'shark_silhouette', 'whale_silhouette'];
    const activeFish = this.fishList.filter((f) => !megafaunaSpecies.includes(f.species));
    const targetQuota = Math.min(46, Math.max(28, Math.floor(this.width / 32)));

    if (activeFish.length < targetQuota) {
      const speciesPool: SpeciesType[] = ['clownfish', 'blue_tang', 'goldfish', 'angelfish', 'tropical_chromis'];
      const pickSpecies = speciesPool[Math.floor(Math.random() * speciesPool.length)];
      const layer = Math.random() < 0.28 ? 0 : Math.random() < 0.72 ? 1 : 2;
      const x = -80 - Math.random() * 220;
      const y = this.height * (0.10 + Math.random() * 0.76);
      this.fishList.push(this.createFish(pickSpecies, x, y, layer));
    }

    // Update Fish (Smooth, calm, uninterrupted swimming from LEFT to RIGHT at distinct varied speeds & depths)
    for (let i = this.fishList.length - 1; i >= 0; i--) {
      const fish = this.fishList[i];
      fish.swimCycle += fish.swimSpeed * dt * 3.2;
      fish.finCycle += fish.swimSpeed * dt * 4.8;

      const isMegafauna = megafaunaSpecies.includes(fish.species);

      // Food-seeking AI: calm, graceful, natural biological glide (NEVER jerks, twitches, or acts erratic)
      let seekingFood = false;
      if (this.foodPellets.length > 0 && !isMegafauna) {
        let nearestPellet: FoodPellet | null = null;
        let minDist = 200;

        for (const pel of this.foodPellets) {
          if (pel.eaten) continue;
          // Only seek food in front of the fish (upstream) so fish NEVER tries to turn around
          const dx = pel.x - fish.x;
          if (dx < -10 || dx > 240) continue;
          const dy = pel.y - fish.y;
          if (Math.abs(dy) > 130) continue;

          const dist = Math.hypot(dx, dy);
          if (dist < minDist) {
            minDist = dist;
            nearestPellet = pel;
          }
        }

        if (nearestPellet) {
          seekingFood = true;
          const pdy = nearestPellet.y - fish.y;
          // Smooth, organic vertical glide toward pellet (gentle damping, zero jerking)
          const desiredVy = Math.max(-0.75, Math.min(0.75, pdy * 0.035));
          fish.vy += (desiredVy - fish.vy) * 0.04;

          // Gentle, eager forward glide (positive only, 15-20% boost)
          const targetVx = fish.baseSpeed * 1.18;
          fish.vx += (targetVx - fish.vx) * 0.03;

          // Continuously adapt baseY to current height so fish does NOT snap back when food is eaten
          fish.baseY += (fish.y - fish.baseY) * 0.05;

          // Eat food pellet smoothly
          const pdist = Math.hypot(nearestPellet.x - fish.x, nearestPellet.y - fish.y);
          if (pdist < 26 * fish.scale) {
            nearestPellet.eaten = true;
            fish.baseY = fish.y; // lock equilibrium at current level
            this.spawnBubble(false, fish.x + 8, fish.y);
            const pIdx = this.foodPellets.indexOf(nearestPellet);
            if (pIdx !== -1) this.foodPellets.splice(pIdx, 1);
          }
        }
      }

      // If not seeking food, maintain natural calm vertical undulation
      if (!seekingFood) {
        const targetY = fish.baseY + Math.sin(this.totalTime * fish.frequency * 25 + fish.id) * fish.amplitude;
        fish.vy += (targetY - fish.y) * 0.015;
        fish.vy *= 0.95;

        // Mouse gentle evasion (soft, continuous vector - suppressed during feeding mode to avoid conflict!)
        if (this.mouseX > 0 && this.mouseY > 0 && !this.isFeedMode && !isMegafauna) {
          const mdx = fish.x - this.mouseX;
          const mdy = fish.y - this.mouseY;
          const mdist = Math.hypot(mdx, mdy);
          const avoidDist = 75 * fish.scale;
          if (mdist < avoidDist && mdist > 0) {
            const force = (1 - mdist / avoidDist) * 0.35;
            const normY = mdy / mdist;
            fish.vy += normY * force * 0.35;
            fish.vx += Math.max(0, mdx / mdist) * force * 0.25;
          }
        }

        // Return naturally to individual base speed
        const targetSpeed = fish.baseSpeed + this.oceanSurge * 0.12;
        fish.vx += (targetSpeed - fish.vx) * 0.02;
      }

      // STRICT LAW: Velocity MUST remain positive and bounded. Fish NEVER stops or flips!
      fish.vx = Math.max(0.75, Math.min(2.5, fish.vx));
      fish.vy = Math.max(-0.85, Math.min(0.85, fish.vy));

      // Advance coordinates strictly from LEFT to RIGHT
      fish.x += fish.vx;
      fish.y += fish.vy;

      // Realistic pitch tilt: strictly clamped to ±7 degrees (-0.12 to +0.12 rad) so fish NEVER twists or twirls
      const naturalPitch = Math.max(-0.12, Math.min(0.12, fish.vy * 0.08));
      fish.rotation += (naturalPitch - fish.rotation) * 0.05;

      // Random bubble emission from gills
      if (Math.random() < 0.003 && fish.layer > 0) {
        this.spawnBubble(false, fish.x + 8, fish.y);
      }

      // Wrap around right side: seamless continuous stream entering from left at varied heights & speeds
      if (fish.x > this.width + 140 * fish.scale) {
        // If rare megafauna, remove it cleanly so they don't multiply endlessly
        if (isMegafauna) {
          this.fishList.splice(i, 1);
          continue;
        }

        // Regular fish re-enters from the left with fresh randomized depth and speed
        fish.x = -60 - Math.random() * 220;
        // Distribute across varied depths from 10% to 86% height
        fish.y = this.height * (0.10 + Math.random() * 0.76);
        fish.baseY = fish.y;
        fish.layer = Math.random() < 0.28 ? 0 : Math.random() < 0.72 ? 1 : 2;
        fish.scale = (fish.layer === 0 ? 0.65 : fish.layer === 1 ? 0.95 : 1.25) * (0.9 + Math.random() * 0.25);

        let speedBase = fish.layer === 0 ? 0.95 : fish.layer === 1 ? 1.35 : 1.7;
        if (fish.species === 'tropical_chromis') speedBase *= 1.25;
        if (fish.species === 'goldfish') speedBase *= 0.85;

        // Fresh individual speed
        fish.baseSpeed = speedBase * (0.8 + Math.random() * 0.5);
        fish.vx = fish.baseSpeed;
        fish.vy = 0;
        fish.rotation = 0;
      }
    }

    // 6. Update Follow-Cam Panning (Soft Cinematic Lead without leaving seabed)
    if (this.targetFishId !== null) {
      const target = this.fishList.find((f) => f.id === this.targetFishId);
      if (target) {
        const rawPanX = this.width * 0.5 - target.x;
        const rawPanY = this.height * 0.5 - target.y;
        const maxPanX = this.width * 0.24;
        const maxPanY = this.height * 0.16;
        const desiredPanX = Math.max(-maxPanX, Math.min(maxPanX, rawPanX));
        const desiredPanY = Math.max(-maxPanY, Math.min(maxPanY, rawPanY));

        this.cameraPanX += (desiredPanX - this.cameraPanX) * 0.04;
        this.cameraPanY += (desiredPanY - this.cameraPanY) * 0.04;

        if (this.onTargetFishInfo) {
          this.onTargetFishInfo({
            species: target.species,
            speed: parseFloat((Math.max(1.2, target.vx * 3.4)).toFixed(1)),
            depth: Math.round(18 + (target.y / this.height) * 45),
          });
        }

        // Release follow-cam when target moves far right
        if (target.x > this.width + 100) {
          this.clearTargetFish();
        }
      } else {
        this.clearTargetFish();
      }
    } else {
      this.cameraPanX += (0 - this.cameraPanX) * 0.06;
      this.cameraPanY += (0 - this.cameraPanY) * 0.06;
    }

    // 7. Update Benthic Seabed Crabs
    for (const crab of this.crabs) {
      crab.stateTimer -= dt;
      if (crab.stateTimer <= 0) {
        crab.state = Math.random() < 0.7 ? 'walking' : 'idle';
        crab.direction = Math.random() < 0.5 ? 1 : -1;
        crab.stateTimer = 1.5 + Math.random() * 3.5;
      }

      if (crab.state === 'walking') {
        crab.legCycle += dt * 3.5;
        crab.x += crab.vx * crab.direction;
        if (crab.x < 30) crab.direction = 1;
        if (crab.x > this.width - 30) crab.direction = -1;
      }
    }

    // 8. Update School of Fish
    this.updateSchool(dt);

    // 9. Occasional Background Megafauna Encounter
    this.nextMegafaunaTimer -= dt;
    if (this.nextMegafaunaTimer <= 0) {
      this.spawnRareMegafauna();
      this.nextMegafaunaTimer = 16 + Math.random() * 22;
    }

    // 10. Update Kelp Strands (influenced by Ocean Surge)
    for (const strand of this.kelpStrands) {
      const baseWave = Math.sin(this.totalTime * strand.waveSpeed + strand.waveOffset);
      for (let s = 0; s < strand.segments; s++) {
        const segRatio = s / strand.segments;
        const phase = this.totalTime * strand.waveSpeed + strand.waveOffset - segRatio * 1.5;
        strand.angles[s] = Math.sin(phase) * (0.08 + segRatio * 0.28) + baseWave * 0.05 + this.oceanSurge * 0.12 * segRatio;
      }
    }

    // 11. Update Bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.wobblePhase += b.wobbleSpeed * dt;
      b.x += b.vx + Math.sin(b.wobblePhase) * b.wobbleDist * 0.15 + this.oceanSurge * 0.15;
      b.y -= b.vy;

      if (this.mouseX > 0 && this.mouseY > 0) {
        const bdx = b.x - this.mouseX;
        const bdy = b.y - this.mouseY;
        const bdist = Math.hypot(bdx, bdy);
        if (bdist < 60 && bdist > 0) {
          b.x += (bdx / bdist) * 1.2;
        }
      }

      if (b.y < -20) {
        this.bubbles.splice(i, 1);
        if (this.bubbles.length < 24) {
          this.spawnBubble(false);
        }
      }
    }

    // 12. Update Marine Snow Particles
    for (const p of this.particles) {
      p.x += p.vx + Math.sin(this.totalTime * 0.5 + p.y * 0.01) * 0.2 + this.oceanSurge * 0.35;
      p.y += p.vy;
      p.pulsePhase += p.pulseSpeed * dt;

      if (p.x > this.width + 10) p.x = -10;
      if (p.y > this.height + 10) p.y = -10;
      if (p.y < -10) p.y = this.height + 10;
    }

    // 13. Update Click Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += (r.maxRadius - r.radius) * 0.08 + 1.2;
      r.alpha -= dt * 0.8;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  private updateSchool(dt: number): void {
    // School center centroid
    let avgX = 0;
    let avgY = 0;
    for (const fish of this.schoolList) {
      avgX += fish.x;
      avgY += fish.y;
    }
    avgX /= this.schoolList.length || 1;
    avgY /= this.schoolList.length || 1;

    for (const fish of this.schoolList) {
      fish.swimCycle += dt * 8;

      // School cohesion: gently pull toward centroid
      fish.vx += (avgX - fish.x) * 0.0008;
      fish.vy += (avgY - fish.y) * 0.0012;

      // Alignment / base forward velocity
      fish.vx += (fish.baseVx - fish.vx) * 0.03;
      fish.vy += (Math.sin(this.totalTime * 0.8 + fish.tailPhase) * 0.5 - fish.vy) * 0.04;

      // Cursor avoidance for the school (soft deflection)
      if (this.mouseX > 0 && this.mouseY > 0 && !this.isFeedMode) {
        const dx = fish.x - this.mouseX;
        const dy = fish.y - this.mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 100 && dist > 0) {
          const repel = (1 - dist / 100) * 0.4;
          const normY = dy / dist;
          fish.vy += normY * repel * 0.4;
          fish.vx += Math.max(0, dx / dist) * repel * 0.3;
        }
      }

      // Enforce positive forward swimming
      fish.vx = Math.max(1.0, Math.min(2.8, fish.vx));
      fish.vy = Math.max(-0.8, Math.min(0.8, fish.vy));

      fish.x += fish.vx;
      fish.y += fish.vy;

      // Wrap school fish seamlessly
      if (fish.x > this.width + 140) {
        fish.x = -60 - Math.random() * 200;
        fish.y = this.height * (0.18 + Math.random() * 0.45);
      }
    }
  }

  private spawnRareMegafauna(): void {
    const choices: SpeciesType[] = [
      'sea_turtle',
      'jellyfish',
      'stingray',
      'shark_silhouette',
      'whale_silhouette',
    ];
    const pick = choices[Math.floor(Math.random() * choices.length)];

    let y = this.height * (0.25 + Math.random() * 0.4);
    let scale = 1.0;
    let layer = 0; // deep background

    if (pick === 'sea_turtle') {
      layer = 1;
      scale = 0.95;
    } else if (pick === 'jellyfish') {
      layer = 1;
      scale = 0.85;
      y = this.height * (0.3 + Math.random() * 0.4);
    } else if (pick === 'stingray') {
      layer = 0;
      scale = 0.9;
    } else if (pick === 'shark_silhouette') {
      layer = 0;
      scale = 1.1;
      y = this.height * 0.45;
    } else if (pick === 'whale_silhouette') {
      layer = 0;
      scale = 1.35;
      y = this.height * 0.35;
    }

    const fish = this.createFish(pick, -150 * scale, y, layer);
    if (pick === 'whale_silhouette' || pick === 'sea_turtle') {
      fish.vx = 0.65; // slow majestic swim
    }
    this.fishList.push(fish);
  }

  // ========================================================
  // RENDERING PIPELINE
  // ========================================================
  private render(): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Blend atmosphere configurations
    const atmos = this.getBlendedAtmosphere();

    // 1. Water Background Gradient
    const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
    waterGrad.addColorStop(0, atmos.waterTopColor);
    waterGrad.addColorStop(1, atmos.waterBottomColor);
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    // Parallax offset + Follow-Cam Panning
    ctx.translate(this.parallaxX * 0.5 + this.cameraPanX, this.parallaxY * 0.5 + this.cameraPanY);

    // 2. Volumetric Sunlight God Rays (Crepuscular Rays)
    this.renderVolumetricSunRays(ctx, atmos);

    // 3. Deep Background Layer (Layer 0 Fish, Distant silhouettes)
    this.renderFishLayer(0, atmos);

    // 4. Distant Parallax Seabed Dune & Sunken Shipwreck
    this.renderBackgroundSeabed(ctx, atmos);

    // 5. School of Fish (Midground-background)
    for (const sf of this.schoolList) {
      MarineRenderers.renderSchoolFish(ctx, sf);
    }

    // 6. Midground Parallax Seabed (Sand floor, Coral Reefs, Kelp)
    this.renderMidgroundSeabed(ctx, atmos);

    // 7. Swaying Kelp Forests (Midground layer)
    this.renderKelp(ctx, atmos);

    // 8. Corals & Anemones
    this.renderCorals(ctx, atmos);

    // 9. Midground Fish (Layer 1)
    this.renderFishLayer(1, atmos);

    // 10. Foreground Parallax Seabed Dunes, Shells, Anchor & Benthic Crabs
    this.renderForegroundSeabed(ctx, atmos);

    // 11. Foreground Fish (Layer 2 - sharpest, highest detail)
    this.renderFishLayer(2, atmos);

    // 12. Food Pellets
    this.renderFoodPellets(ctx);

    // 13. Follow-Cam Target Reticle
    this.renderTargetReticle(ctx);

    // 14. Floating Marine Particles / Plankton
    this.renderParticles(ctx, atmos);

    // 15. Dynamic Animated Water Caustics (overlaying everything)
    this.renderWaterCaustics(ctx, atmos);

    // 16. Bubbles (Rising through water column)
    this.renderBubbles(ctx, atmos);

    // 17. Click Ripples / Shockwaves
    this.renderClickRipples(ctx);

    // 18. Volumetric Diver/ROV Spotlight
    this.renderDiverSpotlight(ctx);

    ctx.restore();

    // 19. Surface Water Reflection & Descent Fog (When entering/descending)
    this.renderCinematicEntrance(ctx, atmos);
  }

  /**
   * Linear interpolation of color hex or components
   */
  private getBlendedAtmosphere(): AtmosphereConfig {
    const from = ATMOSPHERE_MODES[this.currentMode];
    const to = ATMOSPHERE_MODES[this.targetMode];
    const t = this.modeTransition;

    if (t >= 1.0) return to;

    return {
      name: to.name,
      label: to.label,
      waterTopColor: this.lerpColor(from.waterTopColor, to.waterTopColor, t),
      waterBottomColor: this.lerpColor(from.waterBottomColor, to.waterBottomColor, t),
      waterHazeColor: to.waterHazeColor,
      sunbeamColor: to.sunbeamColor,
      sunbeamIntensity: from.sunbeamIntensity * (1 - t) + to.sunbeamIntensity * t,
      causticColor: to.causticColor,
      causticIntensity: from.causticIntensity * (1 - t) + to.causticIntensity * t,
      sandColor1: this.lerpColor(from.sandColor1, to.sandColor1, t),
      sandColor2: this.lerpColor(from.sandColor2, to.sandColor2, t),
      ambientLight: from.ambientLight * (1 - t) + to.ambientLight * t,
      bioluminescence: to.bioluminescence,
      particleColor: to.particleColor,
      bubbleGlow: to.bubbleGlow,
    };
  }

  private lerpColor(c1: string, c2: string, t: number): string {
    // Quick hex lerp
    if (c1.startsWith('#') && c2.startsWith('#')) {
      const r1 = parseInt(c1.slice(1, 3), 16);
      const g1 = parseInt(c1.slice(3, 5), 16);
      const b1 = parseInt(c1.slice(5, 7), 16);

      const r2 = parseInt(c2.slice(1, 3), 16);
      const g2 = parseInt(c2.slice(3, 5), 16);
      const b2 = parseInt(c2.slice(5, 7), 16);

      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      return `rgb(${r}, ${g}, ${b})`;
    }
    return t > 0.5 ? c2 : c1;
  }

  private renderVolumetricSunRays(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    if (atmos.sunbeamIntensity <= 0.05) return;

    ctx.save();
    const rayCount = 10;
    const baseAngle = 0.28; // tilted sunlight angle
    const totalSpan = this.width * 2.6;

    for (let i = 0; i < rayCount; i++) {
      const phase = this.totalTime * 0.4 + i * 1.1;
      const intensity = (Math.sin(phase) * 0.5 + 0.5) * atmos.sunbeamIntensity;
      const xStart = -this.width * 0.8 + (i / rayCount) * totalSpan;
      const beamWidth = 90 + Math.sin(phase * 0.7) * 40;

      const grad = ctx.createLinearGradient(xStart, 0, xStart + Math.sin(baseAngle) * this.height, this.height);
      grad.addColorStop(0, atmos.sunbeamColor);
      grad.addColorStop(0.6, `rgba(255, 255, 255, ${intensity * 0.12})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(xStart - beamWidth * 0.3, 0);
      ctx.lineTo(xStart + beamWidth * 0.7, 0);
      ctx.lineTo(xStart + beamWidth * 2.2 + Math.sin(baseAngle) * this.height, this.height);
      ctx.lineTo(xStart - beamWidth * 0.8 + Math.sin(baseAngle) * this.height, this.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private renderFishLayer(layer: number, atmos: AtmosphereConfig): void {
    const ctx = this.ctx;
    for (const fish of this.fishList) {
      if (fish.layer === layer) {
        const causticGlow = atmos.causticIntensity;
        MarineRenderers.renderFish(ctx, fish, causticGlow, atmos.bioluminescence);
      }
    }
  }

  private renderBackgroundSeabed(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    ctx.save();
    ctx.translate(this.parallaxX * 0.2, this.parallaxY * 0.2);

    // Distant ocean floor ridge / reef cliff silhouette (Infinite Horizon)
    const grad = ctx.createLinearGradient(0, this.height * 0.7, 0, this.height);
    grad.addColorStop(0, atmos.waterBottomColor);
    grad.addColorStop(1, atmos.sandColor2);

    const startX = -this.width * 1.5;
    const endX = this.width * 2.5;

    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(startX, this.height);
    for (let x = startX; x <= endX; x += 40) {
      const y = this.height * 0.75 + Math.sin(x * 0.003) * (this.height * 0.035) + Math.cos(x * 0.006) * (this.height * 0.02);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, this.height);
    ctx.closePath();
    ctx.fill();

    // Sunken Shipwreck in the background
    this.renderSunkenShipwreck(ctx, atmos);

    ctx.restore();
  }

  private renderMidgroundSeabed(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    ctx.save();
    ctx.translate(this.parallaxX * 0.5, this.parallaxY * 0.5);

    // Textured sandy floor with dunes (Infinite Horizon)
    const sandGrad = ctx.createLinearGradient(0, this.height * 0.82, 0, this.height);
    sandGrad.addColorStop(0, atmos.sandColor1);
    sandGrad.addColorStop(1, atmos.sandColor2);

    const startX = -this.width * 1.5;
    const endX = this.width * 2.5;

    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(startX, this.height);
    for (let x = startX; x <= endX; x += 40) {
      const y = this.height * 0.83 + Math.sin(x * 0.004 + 1.2) * (this.height * 0.03) + Math.cos(x * 0.008) * (this.height * 0.018);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, this.height);
    ctx.closePath();
    ctx.fill();

    // Natural textured rock outcroppings
    this.renderRocks(ctx, atmos);

    ctx.restore();
  }

  private renderRocks(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    // Multi-tiled rock formations extending across the endless ocean
    const baseRocks = [
      { rx: 0.12, ry: 0.85, w: 90, h: 55 },
      { rx: 0.45, ry: 0.88, w: 120, h: 65 },
      { rx: 0.82, ry: 0.86, w: 110, h: 70 },
      { rx: -0.28, ry: 0.86, w: 100, h: 60 },
      { rx: 1.25, ry: 0.85, w: 115, h: 65 },
    ];

    for (const r of baseRocks) {
      const rockX = this.width * r.rx;
      const rockY = this.height * r.ry;

      ctx.save();
      const rockGrad = ctx.createRadialGradient(rockX, rockY - r.h * 0.3, 5, rockX, rockY, r.w * 0.6);
      rockGrad.addColorStop(0, '#64748b');
      rockGrad.addColorStop(0.6, '#334155');
      rockGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(rockX - r.w * 0.5, rockY + r.h * 0.5);
      ctx.bezierCurveTo(rockX - r.w * 0.45, rockY - r.h * 0.7, rockX + r.w * 0.4, rockY - r.h * 0.8, rockX + r.w * 0.5, rockY + r.h * 0.5);
      ctx.closePath();
      ctx.fill();

      // Algae / moss patches
      ctx.fillStyle = atmos.bioluminescence ? 'rgba(45, 212, 191, 0.4)' : 'rgba(74, 222, 128, 0.35)';
      ctx.beginPath();
      ctx.ellipse(rockX - 10, rockY - r.h * 0.35, r.w * 0.25, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderKelp(ctx: CanvasRenderingContext2D, _atmos: AtmosphereConfig): void {
    for (const strand of this.kelpStrands) {
      ctx.save();
      ctx.strokeStyle = strand.color;
      ctx.lineWidth = strand.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let currX = strand.baseX;
      let currY = strand.baseY;

      ctx.beginPath();
      ctx.moveTo(currX, currY);

      let runningAngle = -Math.PI / 2;
      const points: { x: number; y: number }[] = [{ x: currX, y: currY }];

      for (let s = 0; s < strand.segments; s++) {
        runningAngle += strand.angles[s];
        currX += Math.cos(runningAngle) * strand.segmentLength;
        currY += Math.sin(runningAngle) * strand.segmentLength;
        points.push({ x: currX, y: currY });
        ctx.lineTo(currX, currY);
      }
      ctx.stroke();

      // Render kelp leaves along stem
      ctx.fillStyle = strand.color;
      for (const leaf of strand.leaves) {
        if (leaf.segment < points.length) {
          const pt = points[leaf.segment];
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(runningAngle + leaf.side * leaf.angleOffset);
          ctx.beginPath();
          ctx.ellipse(leaf.length * 0.5, 0, leaf.length * 0.5, leaf.length * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
    }
  }

  private renderCorals(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    for (const coral of this.corals) {
      ctx.save();
      ctx.translate(coral.x, coral.y);
      ctx.scale(coral.scale, coral.scale);

      if (coral.type === 'staghorn' && coral.branches) {
        // Draw branching staghorn coral
        for (const b of coral.branches) {
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.thickness;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(b.startX - coral.x, b.startY - coral.y);
          ctx.lineTo(b.endX - coral.x, b.endY - coral.y);
          ctx.stroke();

          // Delicate vibrant polyp tips
          ctx.fillStyle = coral.secondaryColor;
          ctx.beginPath();
          ctx.arc(b.endX - coral.x, b.endY - coral.y, b.thickness * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (coral.type === 'brain') {
        // Dome brain coral with convoluted labyrinth ridges
        const grad = ctx.createRadialGradient(0, -10, 5, 0, 0, 42);
        grad.addColorStop(0, coral.color);
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 36, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Convoluted ridges
        ctx.strokeStyle = coral.secondaryColor;
        ctx.lineWidth = 1.6;
        for (let r = 12; r < 34; r += 7) {
          ctx.beginPath();
          ctx.arc(0, 0, r, Math.PI * 0.95, Math.PI * 0.05, true);
          ctx.stroke();
        }
      } else if (coral.type === 'anemone' && coral.tentacles) {
        // Pulsing anemone with gently moving tentacles
        for (const ten of coral.tentacles) {
          const sway = Math.sin(this.totalTime * ten.speed + ten.phase) * 12;
          ctx.strokeStyle = coral.color;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const endX = Math.cos(ten.angle) * ten.length + sway;
          const endY = Math.sin(ten.angle) * ten.length;
          ctx.quadraticCurveTo(Math.cos(ten.angle) * (ten.length * 0.5), Math.sin(ten.angle) * (ten.length * 0.5) + sway * 0.5, endX, endY);
          ctx.stroke();

          // Bioluminescent tentacle tip
          if (atmos.bioluminescence) {
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(endX, endY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }

  private renderForegroundSeabed(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    ctx.save();
    ctx.translate(this.parallaxX * 0.8, this.parallaxY * 0.8);

    // Front sand shelf (Infinite Horizon)
    const frontGrad = ctx.createLinearGradient(0, this.height * 0.92, 0, this.height);
    frontGrad.addColorStop(0, atmos.sandColor1);
    frontGrad.addColorStop(1, atmos.sandColor2);

    const startX = -this.width * 1.5;
    const endX = this.width * 2.5;

    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.moveTo(startX, this.height);
    for (let x = startX; x <= endX; x += 40) {
      const y = this.height * 0.92 + Math.sin(x * 0.005 + 2.5) * (this.height * 0.025) + Math.cos(x * 0.01) * (this.height * 0.015);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, this.height);
    ctx.closePath();
    ctx.fill();

    // Starfish on foreground sand
    this.renderStarfish(ctx, this.width * 0.28, this.height * 0.94, 14, '#ef4444');
    this.renderStarfish(ctx, this.width * 0.72, this.height * 0.95, 11, '#f97316');
    this.renderStarfish(ctx, -this.width * 0.22, this.height * 0.94, 12, '#f97316');
    this.renderStarfish(ctx, this.width * 1.35, this.height * 0.94, 13, '#ef4444');

    // Seashells
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(this.width * 0.42, this.height * 0.95, 4.5, 0, Math.PI * 2);
    ctx.arc(this.width * 0.56, this.height * 0.96, 3.8, 0, Math.PI * 2);
    ctx.arc(this.width * 1.15, this.height * 0.95, 4.0, 0, Math.PI * 2);
    ctx.fill();

    // Ancient Coral-Encrusted Anchor
    this.renderAncientAnchor(ctx, this.width * 0.86, this.height * 0.92);

    // Benthic Seabed Crabs
    for (const crab of this.crabs) {
      MarineRenderers.renderSeabedCrab(ctx, crab);
    }

    ctx.restore();
  }

  private renderStarfish(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? r : r * 0.42;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * 0.5; // perspective flattening
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Central star dot
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    ctx.save();
    for (const p of this.particles) {
      const pulse = Math.sin(p.pulsePhase) * 0.35 + 0.65;
      const alpha = p.baseAlpha * pulse;

      ctx.fillStyle = atmos.particleColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Bioluminescent glowing halo in Deep Ocean mode
      if (atmos.bioluminescence) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Procedural animated water caustics pattern moving across the entire screen
   */
  private renderWaterCaustics(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    if (atmos.causticIntensity <= 0.05) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = atmos.causticColor;
    ctx.lineWidth = 1.2;

    const t = this.totalTime * 0.7;
    const step = 85;
    const rows = Math.ceil(this.height / step) + 1;
    const startCol = -Math.ceil(this.width / step) - 1;
    const endCol = Math.ceil((this.width * 2) / step) + 2;

    ctx.beginPath();
    for (let r = 0; r < rows; r++) {
      for (let c = startCol; c < endCol; c++) {
        const x = c * step;
        const y = r * step;

        // Wave matrix displacement
        const dx1 = Math.sin(x * 0.02 + t) * 18;
        const dy1 = Math.cos(y * 0.02 + t * 0.8) * 18;
        const dx2 = Math.sin((x + y) * 0.015 - t * 0.6) * 14;
        const dy2 = Math.cos((x - y) * 0.015 + t * 0.6) * 14;

        const px = x + dx1 + dx2;
        const py = y + dy1 + dy2;

        if (c === startCol) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Additional cross-diagonal caustic web for organic fluidity
    ctx.beginPath();
    for (let c = startCol; c < endCol; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * step;
        const y = r * step;

        const dx = Math.sin(x * 0.025 - t * 0.8) * 16;
        const dy = Math.cos(y * 0.025 + t) * 16;

        const px = x + dx;
        const py = y + dy;

        if (r === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  private renderBubbles(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    ctx.save();
    for (const b of this.bubbles) {
      ctx.save();
      ctx.translate(b.x, b.y);

      // Bubble glass circle
      ctx.fillStyle = atmos.bioluminescence ? 'rgba(165, 243, 252, 0.25)' : 'rgba(255, 255, 255, 0.18)';
      ctx.strokeStyle = atmos.bubbleGlow;
      ctx.lineWidth = 1.0;

      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specular light crescent glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  private renderClickRipples(ctx: CanvasRenderingContext2D): void {
    if (this.ripples.length === 0) return;

    ctx.save();
    for (const r of this.ripples) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.6})`;
      ctx.lineWidth = 2.5 * (r.alpha);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary echo ring
      if (r.radius > 20) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${r.alpha * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private renderCinematicEntrance(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    if (this.descentProgress >= 1.0) return;

    const t = this.descentProgress; // 0 to 1
    const invT = 1.0 - t;

    ctx.save();

    // 1. Surface Sun Glare / Water Surface Reflection bloom
    const surfaceGlare = ctx.createLinearGradient(0, 0, 0, this.height * 0.7);
    surfaceGlare.addColorStop(0, `rgba(255, 255, 255, ${invT * 0.9})`);
    surfaceGlare.addColorStop(0.3, `rgba(186, 230, 253, ${invT * 0.6})`);
    surfaceGlare.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = surfaceGlare;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Rolling surface waves breaking down into the descent
    ctx.strokeStyle = `rgba(255, 255, 255, ${invT * 0.7})`;
    ctx.lineWidth = 3;
    const waveCount = 5;
    for (let w = 0; w < waveCount; w++) {
      const wy = (w / waveCount) * (this.height * 0.35) * invT;
      ctx.beginPath();
      for (let x = 0; x <= this.width; x += 30) {
        const y = wy + Math.sin(x * 0.02 + this.totalTime * 2 + w) * 12 * invT;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3. Submergence Haze Overlay
    ctx.fillStyle = atmos.waterHazeColor;
    ctx.globalAlpha = invT * 0.5;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }

  private renderSunkenShipwreck(ctx: CanvasRenderingContext2D, atmos: AtmosphereConfig): void {
    ctx.save();
    const shipX = this.width * 0.72;
    const shipY = this.height * 0.76;

    ctx.fillStyle = atmos.bioluminescence ? 'rgba(15, 23, 42, 0.45)' : 'rgba(30, 41, 59, 0.4)';
    ctx.beginPath();
    // Galleon stern and bow tilted in the sand
    ctx.moveTo(shipX - 110, shipY + 20);
    ctx.bezierCurveTo(shipX - 80, shipY - 35, shipX + 60, shipY - 30, shipX + 110, shipY - 10);
    ctx.lineTo(shipX + 115, shipY + 25);
    ctx.bezierCurveTo(shipX + 40, shipY + 30, shipX - 60, shipY + 28, shipX - 110, shipY + 20);
    ctx.closePath();
    ctx.fill();

    // Broken wooden main mast & spar
    ctx.strokeStyle = atmos.bioluminescence ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(shipX - 10, shipY - 25);
    ctx.lineTo(shipX + 15, shipY - 110);
    ctx.stroke();

    // Cross yard spar
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(shipX - 25, shipY - 80);
    ctx.lineTo(shipX + 45, shipY - 65);
    ctx.stroke();

    // Tattered rigging lines hanging
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(shipX + 15, shipY - 110);
    ctx.quadraticCurveTo(shipX - 40, shipY - 60, shipX - 90, shipY - 15);
    ctx.moveTo(shipX + 45, shipY - 65);
    ctx.quadraticCurveTo(shipX + 80, shipY - 40, shipX + 105, shipY - 10);
    ctx.stroke();

    // Overgrown coral patches on the ship hull
    ctx.fillStyle = atmos.bioluminescence ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(shipX - 30, shipY - 15, 6, 0, Math.PI * 2);
    ctx.arc(shipX + 20, shipY - 12, 8, 0, Math.PI * 2);
    ctx.arc(shipX + 65, shipY - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderAncientAnchor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.35);

    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Shank (vertical shaft)
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(0, 18);
    ctx.stroke();

    // Ring at top
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, -38, 7, 0, Math.PI * 2);
    ctx.stroke();

    // Stock (cross bar near ring)
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-16, -26);
    ctx.lineTo(16, -26);
    ctx.stroke();

    // Curved arms with flukes
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.arc(0, 8, 22, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Fluke points
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(21, 14);
    ctx.lineTo(26, 6);
    ctx.lineTo(16, 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-21, 14);
    ctx.lineTo(-26, 6);
    ctx.lineTo(-16, 8);
    ctx.closePath();
    ctx.fill();

    // Coral encrustations on anchor
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(2, -10, 3, 0, Math.PI * 2);
    ctx.arc(-8, 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderFoodPellets(ctx: CanvasRenderingContext2D): void {
    if (this.foodPellets.length === 0) return;
    ctx.save();
    for (const p of this.foodPellets) {
      ctx.globalAlpha = p.alpha;
      const grad = ctx.createRadialGradient(p.x - 1, p.y - 1, 0.5, p.x, p.y, p.size);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.6, '#d97706');
      grad.addColorStop(1, '#78350f');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderTargetReticle(ctx: CanvasRenderingContext2D): void {
    if (this.targetFishId === null) return;
    const target = this.fishList.find((f) => f.id === this.targetFishId);
    if (!target) return;

    ctx.save();
    ctx.translate(target.x, target.y);
    const r = 38 * target.scale;

    // Glowing target bracket
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r, -0.4, 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 0.5 - 0.4, Math.PI * 0.5 + 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI - 0.4, Math.PI + 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 1.5 - 0.4, Math.PI * 1.5 + 0.4);
    ctx.stroke();

    ctx.restore();
  }

  private renderDiverSpotlight(ctx: CanvasRenderingContext2D): void {
    if (!this.isSpotlightEnabled || this.mouseX < 0 || this.mouseY < 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const coneLength = 400;
    const coneAngle = Math.PI * 0.32;
    const dirAngle = Math.PI * 0.35;

    const coneGrad = ctx.createRadialGradient(this.mouseX, this.mouseY, 10, this.mouseX, this.mouseY, coneLength);
    coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    coneGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.28)');
    coneGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.08)');
    coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(this.mouseX, this.mouseY);
    ctx.arc(this.mouseX, this.mouseY, coneLength, dirAngle - coneAngle * 0.5, dirAngle + coneAngle * 0.5);
    ctx.closePath();
    ctx.fill();

    const centerGrad = ctx.createRadialGradient(this.mouseX, this.mouseY, 2, this.mouseX, this.mouseY, 70);
    centerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    centerGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.35)');
    centerGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(this.mouseX, this.mouseY, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public toggleSpotlight(): boolean {
    this.isSpotlightEnabled = !this.isSpotlightEnabled;
    return this.isSpotlightEnabled;
  }

  public toggleFeedMode(): boolean {
    this.isFeedMode = !this.isFeedMode;
    return this.isFeedMode;
  }

  public clearTargetFish(): void {
    this.targetFishId = null;
    if (this.onTargetFishInfo) this.onTargetFishInfo(null);
  }

  public setDepth(meters: number): void {
    this.currentDepthMeters = meters;
  }

  public getFishCount(): number {
    return this.fishList.length + this.schoolList.length;
  }

  public destroy(): void {
    this.stop();
  }
}
